// Libs
import {
  AmbientLight,
  DirectionalLight,
  HalfFloatType,
  OrthographicCamera,
  PerspectiveCamera,
  PointLight,
  WebGLRenderTarget,
} from 'three'
import gsap from 'gsap'
import { EffectComposer, EffectPass, FXAAEffect, Pass, RenderPass, VignetteEffect } from 'postprocessing'
// Models
import webgl from '@/models/webgl'
// Views
import BaseScene from '../BaseScene'
import Field from './Field'

export default class IntroScene extends BaseScene {
  composer!: EffectComposer
  private mainCamera: PerspectiveCamera

  field!: Field

  constructor() {
    super('intro')
    this.mainCamera = new PerspectiveCamera(60, webgl.width / webgl.height, 1, 2000)
    this.mainCamera.name = 'introMainCam'
    this.mainCamera.position.z = 500
    this.camera = this.mainCamera
    this.cameras.add(this.mainCamera)
  }

  protected override initLighting(): Promise<void> {
    return new Promise((resolve) => {
      const ambient = new AmbientLight(0xffffff, 0.25)
      ambient.name = 'ambient'
      this.lights.add(ambient)

      const directional = new DirectionalLight(0xffffff, 2)
      directional.name = 'directional'
      directional.position.set(-50, 30, 100)
      this.lights.add(directional)

      resolve()
    })
  }

  protected override initMesh(): Promise<void> {
    return new Promise((resolve) => {
      this.field = new Field()
      this.world.add(this.field)

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
    this.field.initDebug()
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
    const delta = this.clock.getDelta()
    this.field.update(delta)
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
