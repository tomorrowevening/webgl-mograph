// Libs
import {
  HalfFloatType,
  Mesh,
  MeshNormalMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  TorusKnotGeometry,
  WebGLRenderTarget,
} from 'three'
import gsap from 'gsap'
// Models
import webgl from '@/models/webgl'
// Views
import BaseScene from '../BaseScene'
import { EffectComposer, EffectPass, FXAAEffect, Pass, RenderPass } from 'postprocessing'
import animation from '@/models/animation'

export default class CreditsScene extends BaseScene {
  composer!: EffectComposer

  constructor() {
    super('credits')
    this.camera = new PerspectiveCamera(60, webgl.width / webgl.height, 1, 1500)
    this.camera.name = 'creditsMainCam'
    this.camera.position.z = 300
    this.cameras.add(this.camera)
  }

  protected override initMesh(): Promise<void> {
    return new Promise((resolve) => {
      const mesh = new Mesh(new TorusKnotGeometry(100), new MeshNormalMaterial())
      mesh.name = 'torusKnot'
      this.world.add(mesh)

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
      // AA
      this.composer.addPass(new EffectPass(this.camera, new FXAAEffect()))

      resolve()
    })
  }

  protected override initAnimation(): Promise<void> {
    return new Promise((resolve) => {
      animation.sheet(this.name)
      resolve()
    })
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
