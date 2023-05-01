// Libs
import { PerspectiveCamera, RectAreaLight } from 'three'
import gsap from 'gsap'
import { FXAAEffect, NoiseEffect, VignetteEffect } from 'postprocessing'
// Models
import animation from '@/models/animation'
import webgl from '@/models/webgl'
// Views
import BaseScene from '../BaseScene'
// Controllers
import PostController from '@/controllers/PostController'

export default class IntroScene extends BaseScene {
  private mainCamera: PerspectiveCamera

  constructor() {
    super('intro')
    this.mainCamera = new PerspectiveCamera(60, webgl.width / webgl.height, 1, 2000)
    this.mainCamera.name = 'introMainCam'
    this.mainCamera.position.set(0, 500, 0)
    this.mainCamera.rotateX(-Math.PI / 2)
    this.camera = this.mainCamera
    this.cameras.add(this.mainCamera)
  }

  protected override initPost(): Promise<void> {
    return new Promise((resolve) => {
      this.post = new PostController(this, this.camera)
      this.post.addEffect('FXAA_Vignette', new FXAAEffect(), new VignetteEffect())

      resolve()
    })
  }

  protected override initAnimation(): Promise<void> {
    return new Promise((resolve) => {
      animation.createSheet(this.name)
      resolve()
    })
  }

  override dispose(): void {
    this.post.dispose()
  }

  override hide(): void {
    this.disable()

    gsap.to(this, {
      duration: 2,
      ease: 'expo.inOut',
      transitionProgress: 1,
      onComplete: () => this.onHidden(),
    })
  }

  override resize(width: number, height: number): void {
    const cam = this.camera as PerspectiveCamera
    cam.aspect = width / height
    cam.updateProjectionMatrix()
    this.post.resize(width, height)
  }
}
