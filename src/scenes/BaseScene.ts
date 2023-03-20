// Libs
import { OrthographicCamera, PerspectiveCamera, Scene, WebGLRenderTarget } from 'three'
import { Events, threeDispatcher } from '../models/constants'
// Models
import webgl from '../models/webgl'
// Controllers
import scenes from '../controllers/SceneController'

export default class BaseScene extends Scene {
  camera!: PerspectiveCamera | OrthographicCamera

  init(): Promise<void> {
    return new Promise((resolve) => {
      this.initMesh().then(() => {
        this.initPost().then(() => {
          this.initAnimation().then(resolve)
        })
      })
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

  resize(width: number, height: number): void {
    // update camera
  }

  get transitionProgress(): number {
    return scenes.transitionProgress
  }

  set transitionProgress(value: number) {
    scenes.transitionProgress = value
  }
}
