// Libs
import { Object3D, OrthographicCamera, PerspectiveCamera, Scene, WebGLRenderTarget } from 'three'
// Models
import { Events, threeDispatcher } from '@/models/constants'
import webgl from '@/models/webgl'
import { Scenes } from '@/types'
// Controllers
import scenes from '@/controllers/SceneController'

export default class BaseScene extends Scene {
  camera!: PerspectiveCamera | OrthographicCamera

  // Scene setup
  cameras: Object3D
  lights: Object3D
  world: Object3D
  utils: Object3D // Helpers / controls

  constructor(name: Scenes) {
    super()
    this.name = name

    this.cameras = new Object3D()
    this.cameras.name = 'cameras'
    this.add(this.cameras)

    this.lights = new Object3D()
    this.lights.name = 'lights'
    this.add(this.lights)

    this.utils = new Object3D()
    this.utils.name = 'utils'
    this.add(this.utils)

    this.world = new Object3D()
    this.world.name = 'world'
    this.add(this.world)
  }

  init(): Promise<void> {
    return new Promise((resolve) => {
      this.initMesh().then(() => {
        this.initPost().then(() => {
          this.initAnimation().then(resolve)
        })
      })
    })
  }

  protected initLights(): Promise<void> {
    return new Promise((resolve) => {
      resolve()
    })
  }

  protected initMesh(): Promise<void> {
    return new Promise((resolve) => {
      resolve()
    })
  }

  protected initPost(): Promise<void> {
    return new Promise((resolve) => {
      resolve()
    })
  }

  protected initAnimation(): Promise<void> {
    return new Promise((resolve) => {
      resolve()
    })
  }

  dispose(): void {
    //
  }

  enable(): void {
    //
  }

  disable(): void {
    //
  }

  show(): void {
    this.enable()
  }

  hide(): void {
    this.disable()
    this.onHidden()
  }

  protected onHidden(): void {
    threeDispatcher.dispatchEvent({ type: Events.SCENE_HIDDEN })
  }

  update(): void {
    //
  }

  draw(renderTarget: WebGLRenderTarget | null): void {
    // Backup drawing to renderer (if no post-processing)
    webgl.renderer.setRenderTarget(renderTarget)
    webgl.renderer.clear()
    webgl.renderer.render(this, this.camera)
  }

  postDraw(): void {
    //
  }

  resize(width: number, height: number): void {
    // update camera
  }

  updateCamera(camera: PerspectiveCamera | OrthographicCamera) {
    this.camera = camera
  }

  get transitionProgress(): number {
    return scenes.transitionProgress
  }

  set transitionProgress(value: number) {
    scenes.transitionProgress = value
  }
}
