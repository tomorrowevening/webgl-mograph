import { Camera, CatmullRomCurve3, Object3D, PerspectiveCamera, Vector3 } from 'three'
import { FolderApi } from 'tweakpane'
// Models
import { Events, IS_DEV, debugDispatcher } from '@/models/constants'
import Spline from './Spline'
// Utils
import { debugButton, debugFolder, debugInput, toolsTab } from '@/utils/debug'
import { dispose } from '@/utils/three'

let splinesCreated = 0

export type SplineJSON = {
  name: string
  points: Array<number[]>
  tension: number
  closed: boolean
  subdivide: number
  type: string
}

export default class SplineEditor extends Object3D {
  public defaultScale = 1
  private _debugFolder?: FolderApi
  private _camera: Camera = new PerspectiveCamera(60, 1, 1, 1000)

  constructor() {
    super()
    this.name = 'SplineEditor'
  }

  dispose() {
    debugDispatcher.removeEventListener(Events.ADD_SPLINE, this.onAddSpline)
    this._debugFolder?.dispose()
    this._debugFolder = undefined
    const total = this.children.length - 1
    for (let i = total; i > -1; i--) {
      const spline = this.children[i] as Spline
      dispose(spline)
    }
  }

  createSpline = (defaultPoints: Array<Vector3> = []): Spline => {
    const name = `spline_${splinesCreated}`
    const spline = new Spline(name, this._camera)
    spline.draggableScale = this.defaultScale
    spline.addPoints(defaultPoints)
    spline.hideTransform()
    if (IS_DEV) {
      spline.initDebug(this.debugFolder)
    }
    this.add(spline)
    splinesCreated++
    return spline
  }

  createSplineFromArray = (points: Array<number[]>): Spline => {
    const vectors: Array<Vector3> = []
    points.forEach((pos: number[]) => {
      vectors.push(new Vector3(pos[0], pos[1], pos[2]))
    })
    return this.createSpline(vectors)
  }

  createSplineFromCurve = (curve: CatmullRomCurve3): Spline => {
    return this.createSpline(curve.points)
  }

  createSplineFromJSON = (data: SplineJSON): Spline => {
    const spline = this.createSplineFromArray(data.points)
    spline.setName(data.name)
    spline.closed = data.closed
    spline.subdivide = data.subdivide
    spline.tension = data.tension
    spline.type = data.type
    spline.updateSpline()
    return spline
  }

  initDebug() {
    debugDispatcher.addEventListener(Events.ADD_SPLINE, this.onAddSpline)
    debugButton(this.debugFolder, 'New Spline', this.createSpline)
    debugInput(this.debugFolder, this, 'visible')
    debugInput(this.debugFolder, this, 'defaultScale', {
      min: 0,
      max: 50,
      step: 0.01,
    })
    debugButton(this.debugFolder, 'Show Points', () => {
      this.showPoints(true)
    })
    debugButton(this.debugFolder, 'Hide Points', () => {
      this.showPoints(false)
    })
  }

  showPoints = (visible = true) => {
    this.children.forEach((child: Object3D) => {
      const spline = child as Spline
      spline.showPoints(visible)
    })
  }

  get camera(): Camera {
    return this._camera
  }

  set camera(value: Camera) {
    this._camera = value
    this.children.forEach((spline: Object3D) => {
      const _spline = spline as Spline
      _spline.camera = value
    })
  }

  get debugFolder(): FolderApi {
    if (this._debugFolder === undefined) {
      this._debugFolder = debugFolder('Spline Editor', toolsTab)
    }
    return this._debugFolder!
  }

  private onAddSpline = () => {
    this.createSpline()
  }
}
