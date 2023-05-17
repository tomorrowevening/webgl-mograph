// Libs
import { Mesh, MeshBasicMaterial, MeshPhysicalMaterial, PerspectiveCamera, PlaneGeometry, RectAreaLight } from 'three'
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

  protected override initLighting(): Promise<void> {
    return new Promise((resolve) => {
      const portal = new RectAreaLight(0xffffff, 1, 100, 100)
      portal.name = 'portalLight'
      this.lights.add(portal)
      resolve()
    })
  }

  protected override initMesh(): Promise<void> {
    return new Promise((resolve) => {
      const floor = new Mesh(
        new PlaneGeometry(),
        new MeshPhysicalMaterial({
          color: 0xffffff,
          emissive: 0x414141,
        }),
      )
      floor.name = 'floor'
      floor.rotateX(-Math.PI / 2)
      floor.scale.setScalar(2000)
      this.world.add(floor)
      console.log(floor.material)

      const portal = new Mesh(new PlaneGeometry(100, 100), new MeshBasicMaterial())
      portal.name = 'portal'
      portal.position.y = 50
      portal.rotateX(Math.PI)
      this.world.add(portal)

      resolve()
    })
  }

  protected override initPost(): Promise<void> {
    return new Promise((resolve) => {
      this.post = new PostController(this, this.camera)
      this.post.addEffect('FXAA', new FXAAEffect())
      resolve()
    })
  }

  protected override initAnimation(): Promise<void> {
    return new Promise((resolve) => {
      animation.createSheet(this.name)
      resolve()
    })
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
