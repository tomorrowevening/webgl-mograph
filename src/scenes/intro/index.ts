// Libs
import { BoxGeometry, Mesh, MeshNormalMaterial, PerspectiveCamera, Vector2 } from 'three'
import gsap from 'gsap'
// Models
import webgl from '../../models/webgl'
// Views
import BaseScene from '../BaseScene'

export default class IntroScene extends BaseScene {
  constructor() {
    super('intro')
    this.camera = new PerspectiveCamera(60, webgl.width / webgl.height, 1, 1000)
    this.camera.name = 'introMainCam'
    this.camera.position.z = 150
    this.cameras.add(this.camera)
  }

  protected override initMesh(): Promise<void> {
    return new Promise((resolve) => {
      const mesh = new Mesh(new BoxGeometry(100, 100, 100), new MeshNormalMaterial())
      mesh.name = 'boxMesh'
      this.world.add(mesh)

      resolve()
    })
  }

  protected override initPost(): Promise<void> {
    return new Promise((resolve) => {
      resolve()
    })
  }

  protected override initAnimation(): Promise<void> {
    return new Promise((resolve) => {
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
}
