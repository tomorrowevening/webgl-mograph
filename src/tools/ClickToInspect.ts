// Libs
import {
  ArrowHelper,
  AxesHelper,
  Box3Helper,
  BoxHelper,
  Camera,
  CameraHelper,
  DirectionalLightHelper,
  GridHelper,
  HemisphereLightHelper,
  Line,
  Object3D,
  PlaneHelper,
  PointLightHelper,
  PolarGridHelper,
  Raycaster,
  SkeletonHelper,
  SpotLightHelper,
  Vector2,
} from 'three'
import { DragControls } from 'three/examples/jsm/controls/DragControls'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls'
import { FlyControls } from 'three/examples/jsm/controls/FlyControls'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
// Models
import { debugDispatcher } from '@/models/constants'
import webgl from '@/models/webgl'
// Utils
import Inspector from './Inspector'

export default class ClickToInspect {
  static SELECT = 'ClickToInspect::select'

  scene?: Object3D
  camera?: Camera

  private raycaster = new Raycaster()
  private pointer = new Vector2()
  private _enabled = false

  private enable() {
    if (this._enabled) return
    this._enabled = true
    const element = webgl.renderer.domElement
    element.addEventListener('mousedown', this.onClick, false)
  }

  private disable() {
    if (!this._enabled) return
    this._enabled = false
    const element = webgl.renderer.domElement
    element.removeEventListener('mousedown', this.onClick)
  }

  private setCurrentObject(obj: Object3D) {
    debugDispatcher.dispatchEvent({
      type: Inspector.SELECT,
      value: obj,
    })
  }

  private selectableObject(obj: Object3D): boolean {
    // Ensure helpers aren't selectable
    if (
      obj instanceof ArrowHelper ||
      obj instanceof AxesHelper ||
      obj instanceof BoxHelper ||
      obj instanceof Box3Helper ||
      obj instanceof CameraHelper ||
      obj instanceof DirectionalLightHelper ||
      obj instanceof GridHelper ||
      obj instanceof HemisphereLightHelper ||
      obj instanceof PolarGridHelper ||
      obj instanceof PlaneHelper ||
      obj instanceof PointLightHelper ||
      obj instanceof SkeletonHelper ||
      obj instanceof SpotLightHelper
    )
      return false

    // Ensure controls aren't selectable
    if (
      obj instanceof DragControls ||
      obj instanceof FirstPersonControls ||
      obj instanceof FlyControls ||
      obj instanceof OrbitControls ||
      obj instanceof PointerLockControls ||
      obj instanceof TrackballControls ||
      obj instanceof TransformControls
    )
      return false

    // Helper parts
    if (obj instanceof Line) return false
    if (obj.name === 'X' || obj.name === 'Y' || obj.name === 'Z') return false
    if (obj.type === 'TransformControlsPlane' || obj.type === 'TransformControlsGizmo') return false

    return true
  }

  private getIntersectedObject(intersects: Array<any>): Object3D | undefined {
    const total = intersects.length
    for (let i = 0; i < total; i++) {
      const obj = intersects[i].object
      const selectable = this.selectableObject(obj)
      if (selectable) {
        return obj
      }
    }
    return undefined
  }

  private checkCollision() {
    if (this.camera === undefined) return
    if (this.scene === undefined) return
    this.raycaster.setFromCamera(this.pointer, this.camera)
    let intersects = undefined
    let obj = undefined
    try {
      intersects = this.raycaster.intersectObjects(this.scene.children)
    } catch (_) {
      return
    }
    try {
      obj = this.getIntersectedObject(intersects)
    } catch (_) {
      return
    }
    if (obj !== undefined) {
      // @ts-ignore
      const toAdd = obj['isSkinnedMesh'] !== undefined ? obj.parent! : obj
      this.setCurrentObject(toAdd)
    }
  }

  get enabled(): boolean {
    return this._enabled
  }

  set enabled(value: boolean) {
    value ? this.enable() : this.disable()
  }

  // Events

  private onClick = (event: MouseEvent) => {
    if (!this._enabled) return
    this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
    this.checkCollision()
  }
}
