// Libs
import {
  BoxGeometry,
  BufferGeometry,
  Camera,
  CatmullRomCurve3,
  Color,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Raycaster,
  SphereGeometry,
  Vector2,
  Vector3,
} from 'three'
import { lerp } from 'three/src/math/MathUtils'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import { FolderApi, InputBindingApi } from 'tweakpane'
// Tools
import Transformer from '../Transformer'
// Utils
import { debugButton, debugColor, debugFolder, debugInput, debugOptions } from '@/utils/debug'
import { copyToClipboard } from '@/utils/dom'
import { roundTo } from '@/utils/math'
import { dispose } from '@/utils/three'
import LineGeometry from '@/geometry/LineGeometry'
import StrokeMaterial from '@/materials/StrokeMaterial'
import scenes from '@/controllers/SceneController'
import { Events, debugDispatcher, threeDispatcher } from '@/models/constants'
import Inspector from '../Inspector'

export type CurveType = 'catmullrom' | 'centripetal' | 'chordal'

const draggedGeom = new BoxGeometry()
const pointer = new Vector2()

export default class Spline extends Object3D {
  name: string
  curve: CatmullRomCurve3 = new CatmullRomCurve3()
  line: Line
  private _camera: Camera

  // Variables
  tension = 0.5
  closed = false
  subdivide = 50
  curveType: CurveType
  offset = 1

  // Debug
  draggable: Object3D
  debugFolder?: FolderApi
  private nameInput?: InputBindingApi<unknown, any>
  pointsFolder?: FolderApi
  curvePos: Mesh
  private _curvePercentage = 0
  private _draggableScale = 10
  private inputs: Map<string, InputBindingApi<unknown, any>> = new Map()
  private _transform?: TransformControls
  private raycaster: Raycaster
  private draggedMat = new MeshBasicMaterial()

  constructor(name: string, camera: Camera) {
    const color = new Color(0xff00ff)
    super()
    this.name = name

    this.line = new Line(new BufferGeometry(), new LineBasicMaterial({ color: color }))
    this.line.name = 'line'
    this.add(this.line)

    this._camera = camera
    this.curveType = 'catmullrom'

    this.draggedMat.color = color
    this.draggable = new Object3D()
    this.draggable.name = 'draggablePoints'
    this.add(this.draggable)

    this.curvePos = new Mesh(new SphereGeometry(), new MeshBasicMaterial({ color: color }))
    this.curvePos.name = 'curvePos'
    this.curvePos.scale.setScalar(this._draggableScale)
    this.curvePos.visible = false
    this.add(this.curvePos)

    this.raycaster = new Raycaster()
    // @ts-ignore
    this.raycaster.params.Line.threshold = 3

    this.enable()
  }

  enable() {
    document.addEventListener('pointerdown', this.onMouseClick)
  }

  disable() {
    document.removeEventListener('pointerdown', this.onMouseClick)
  }

  dispose = () => {
    Transformer.remove(`${this.name} controls`)
    this.disable()
    this.debugFolder?.dispose()
  }

  hideTransform = () => {
    this._transform?.detach()
  }

  get points(): Array<Vector3> {
    const pts: Array<Vector3> = []
    this.draggable.children.forEach((child: Object3D) => {
      pts.push(child.position)
    })
    return pts
  }

  exportSpline = () => {
    const pts: Array<number[]> = []
    this.draggable.children.forEach((child: Object3D) => {
      pts.push([roundTo(child.position.x, 3), roundTo(child.position.y, 3), roundTo(child.position.z, 3)])
    })
    copyToClipboard({
      name: this.name,
      points: pts,
      tension: this.tension,
      closed: this.closed,
      subdivide: this.subdivide,
      type: this.curveType,
    })
    console.log('Spline copied!')
  }

  showPoints = (visible = true) => {
    this.draggable.visible = visible
  }

  // Modifiers

  addPoints = (defaultPoints: Array<Vector3> = []) => {
    if (defaultPoints.length > 0) {
      const total = defaultPoints.length - 1
      for (let i = 0; i < total; i++) {
        this.addPoint(defaultPoints[i], false)
      }
      this.addPoint(defaultPoints[total])
    } else {
      this.addPoint(new Vector3(-this._draggableScale * 50, 0, 0), false)
      this.addPoint(new Vector3(this._draggableScale * 50, 0, 0))
    }
  }

  addPoint = (position: Vector3, update = true): Mesh => {
    const index = this.draggable.children.length
    const mesh = new Mesh(draggedGeom, this.draggedMat)
    mesh.name = `point_${index}`
    mesh.position.copy(position)
    mesh.scale.setScalar(this._draggableScale)
    this.draggable.add(mesh)

    if (this.debugFolder !== undefined) this.debugPoint(mesh)

    if (update) this.updateSpline()

    return mesh
  }

  addNextPt = () => {
    const total = this.draggable.children.length
    const pos = new Vector3(
      lerp(-this.offset, this.offset, Math.random()),
      lerp(-this.offset, this.offset, Math.random()),
      lerp(-this.offset, this.offset, Math.random()),
    )
    if (total > 0) pos.add(this.draggable.children[total - 1].position)
    const mesh = this.addPoint(pos)
    this._transform?.attach(mesh)
  }

  removePoint = (child: Object3D) => {
    if (this._transform?.object === child) this._transform?.detach()
    this.inputs.delete(child.name)
    dispose(child)
    this.updateSpline()
  }

  removePointAt = (index: number) => {
    const child = this.draggable.children[index]
    this.removePoint(child)
  }

  removeSelectedPt = () => {
    if (this._transform?.object !== undefined) this.removePoint(this._transform?.object)
  }

  updateSpline = () => {
    this.curve = new CatmullRomCurve3(this.points, this.closed, this.curveType, this.tension)
    this.line.geometry.setFromPoints(this.getPoints())
    this.curvePos.position.copy(this.getPointAt(this._curvePercentage))
    this.inputs.forEach((input: InputBindingApi<unknown, any>) => {
      input.refresh()
    })
  }

  // Handlers

  private onMouseClick = (evt: MouseEvent) => {
    pointer.x = (evt.clientX / window.innerWidth) * 2 - 1
    pointer.y = -(evt.clientY / window.innerHeight) * 2 + 1
    //
    this.raycaster.setFromCamera(pointer, this.camera!)
    const intersects = this.raycaster.intersectObjects(this.draggable.children, false)
    if (intersects.length > 0) {
      const object = intersects[0].object
      if (object !== this._transform?.object) {
        this._transform?.attach(object)
      }
    }
  }

  // Getters

  getPointAt(percentage: number): Vector3 {
    return this.curve.getPointAt(percentage)
  }

  getPoints(): Vector3[] {
    return this.curve.getPoints(this.subdivide)
  }

  getTangentAt(percentage: number): Vector3 {
    return this.curve.getTangentAt(percentage)
  }

  get total() {
    return this.draggable.children.length
  }

  get draggableScale(): number {
    return this._draggableScale
  }

  set draggableScale(value: number) {
    this._draggableScale = value
    this.draggable.children.forEach((child: Object3D) => child.scale.setScalar(value))
    this.curvePos.scale.setScalar(value)
  }

  get camera(): Camera {
    return this._camera
  }

  set camera(value: Camera) {
    this._camera = value
    if (this._transform !== undefined) this._transform.camera = value
  }

  get curvePercentage(): number {
    return this._curvePercentage
  }

  set curvePercentage(value: number) {
    this._curvePercentage = value
    this.curvePos.position.copy(this.getPointAt(value))
  }

  setName(value: string) {
    this.name = value
    if (this.debugFolder !== undefined) {
      this.debugFolder.title = value
      this.nameInput?.refresh()
    }
  }

  // Debug

  private splineToStroke = () => {
    const v3Arr = this.getPoints()
    const verts: Array<number[]> = []
    v3Arr.forEach((v: Vector3) => {
      verts.push([v.x, v.y, v.z])
    })
    if (this.closed) verts.pop()
    const geom = new LineGeometry(verts, { closed: this.closed, distances: true })
    const material = new StrokeMaterial({})
    const mesh = new Mesh(geom, material)
    mesh.name = this.name
    scenes.currentScene?.world.add(mesh)
    debugDispatcher.dispatchEvent({ type: Inspector.SELECT, value: mesh })
    threeDispatcher.dispatchEvent({ type: Events.UPDATE_HIERARCHY })
  }

  initDebug(parentFolder: any) {
    this.debugFolder = debugFolder(this.name, parentFolder)
    this.nameInput = debugInput(this.debugFolder, this, 'name', {
      onChange: (value: string) => {
        this.debugFolder!.title = value
      },
    })
    debugInput(this.debugFolder, this, 'closed', {
      onChange: this.updateSpline,
    })
    debugInput(this.debugFolder, this, 'subdivide', {
      min: 1,
      max: 100,
      step: 1,
      onChange: this.updateSpline,
    })
    debugInput(this.debugFolder, this, 'tension', {
      min: 0,
      max: 1,
      onChange: this.updateSpline,
    })
    debugOptions(
      this.debugFolder,
      'Curve Type',
      [
        {
          text: 'catmullrom',
          value: 0,
        },
        {
          text: 'centripetal',
          value: 1,
        },
        {
          text: 'chordal',
          value: 2,
        },
      ],
      (value: number) => {
        switch (value) {
          case 0:
            this.curveType = 'catmullrom'
            break
          case 1:
            this.curveType = 'centripetal'
            break
          case 2:
            this.curveType = 'chordal'
            break
        }
        this.updateSpline()
      },
    )
    debugInput(this.debugFolder, this, 'draggableScale', {
      min: 0.01,
      max: 100,
    })
    debugInput(this.debugFolder, this, 'visible')
    debugColor(this.debugFolder, this.line.material, 'color', {
      onChange: (value: any) => {
        this.draggedMat.color.setRGB(value.r / 255, value.g / 255, value.b / 255)
      },
    })
    debugInput(this.debugFolder, this, 'offset', {
      min: 0,
      max: 10,
      label: 'New Pt Offset',
    })
    debugInput(this.debugFolder, this.curvePos, 'visible', {
      label: 'Show Position',
    })
    debugInput(this.debugFolder, this, 'curvePercentage', {
      min: 0,
      max: 1,
      onChange: (value: number) => {
        this.curvePos.position.copy(this.getPointAt(value))
      },
    })
    debugInput(this.debugFolder, this.draggable, 'visible', {
      label: 'Show Points',
    })
    debugButton(this.debugFolder, 'Add Point', this.addNextPt)
    debugButton(this.debugFolder, 'Remove Point', this.removeSelectedPt)
    debugButton(this.debugFolder, 'Export Spline', this.exportSpline)
    debugButton(this.debugFolder, 'Delete Spline', () => {
      dispose(this)
    })
    debugButton(this.debugFolder, 'Update Spline', this.updateSpline)
    debugButton(this.debugFolder, 'To Stroke', this.splineToStroke)

    this._transform = Transformer.add(`${this.name} controls`, this.debugFolder)
    this._transform.camera = this._camera
    this._transform.addEventListener('objectChange', this.updateSpline)
    this.add(this._transform)

    // debug points that exist
    this.pointsFolder = debugFolder('Points', this.debugFolder)
    this.draggable.children.forEach((obj: Object3D) => {
      this.debugPoint(obj as Mesh)
    })
  }

  private debugPoint = (mesh: Mesh) => {
    const name = mesh.name
    if (this.inputs.get(name) !== undefined) return
    mesh.visible = this.draggable.visible
    this.inputs.set(
      name,
      debugInput(this.pointsFolder, mesh, 'position', {
        label: name,
        onChange: () => {
          this.updateSpline()
        },
      }),
    )
  }
}
