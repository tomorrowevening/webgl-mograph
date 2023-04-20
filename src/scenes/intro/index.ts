// Libs
import { HalfFloatType, OrthographicCamera, PerspectiveCamera, WebGLRenderTarget } from 'three'
import gsap from 'gsap'
import { EffectComposer, EffectPass, FXAAEffect, Pass, RenderPass, VignetteEffect } from 'postprocessing'
// Models
import webgl from '@/models/webgl'
// Views
import BaseScene from '../BaseScene'

export default class IntroScene extends BaseScene {
  composer!: EffectComposer
  private mainCamera: PerspectiveCamera

  constructor() {
    super('intro')
    this.mainCamera = new PerspectiveCamera(60, webgl.width / webgl.height, 1, 2000)
    this.mainCamera.name = 'introMainCam'
    this.mainCamera.position.set(0, 100, 500)
    this.camera = this.mainCamera
    this.cameras.add(this.mainCamera)
  }

  protected override initLighting(): Promise<void> {
    return new Promise((resolve) => {
      resolve()
    })
  }

  protected override initMesh(): Promise<void> {
    return new Promise((resolve) => {
      resolve()
    })
  }

  protected override initPost(): Promise<void> {
    return new Promise((resolve) => {
      this.composer = new EffectComposer(webgl.renderer, {
        frameBufferType: HalfFloatType,
      })
      this.composer.autoRenderToScreen = false
      // Default pass
      this.composer.addPass(new RenderPass(this, this.camera))
      // AA + Vignette
      this.composer.addPass(new EffectPass(this.camera, new FXAAEffect(), new VignetteEffect()))

      resolve()
    })
  }

  protected override initDebug(): void {
    //
  }

  override dispose(): void {
    this.composer.dispose()
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

  override update(): void {
    //
  }

  override draw(renderTarget: WebGLRenderTarget | null): void {
    const delta = this.clock.getDelta()
    this.composer.outputBuffer = renderTarget!
    this.composer.render(delta)
  }

  override resize(width: number, height: number): void {
    const cam = this.camera as PerspectiveCamera
    cam.aspect = width / height
    cam.updateProjectionMatrix()
    this.composer.setSize(width, height)
  }

  override updateCamera(camera: PerspectiveCamera | OrthographicCamera) {
    super.updateCamera(camera)
    this.composer.passes.forEach((pass: Pass) => {
      pass.mainCamera = camera
    })
  }
}
