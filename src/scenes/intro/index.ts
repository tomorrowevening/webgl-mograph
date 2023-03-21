// Libs
import { BoxGeometry, Mesh, MeshNormalMaterial, PerspectiveCamera, Vector2 } from 'three'
import gsap from 'gsap'
// Models
import assets from '../../models/assets'
import webgl from '../../models/webgl'
// Views
import BaseScene from '../BaseScene'
// Controllers
import scenes from '../../controllers/SceneController'

export default class IntroScene extends BaseScene {
  constructor() {
    super()
    this.camera = new PerspectiveCamera(60, webgl.width / webgl.height, 1, 1000)
    this.camera.position.z = 150
  }

  protected override initMesh(): Promise<void> {
    return new Promise((resolve) => {
      const mesh = new Mesh(new BoxGeometry(100, 100, 100), new MeshNormalMaterial())
      this.add(mesh)

      const font = 'moon_bold'
      const fontData = assets.json.get(font)
      const fontTex = assets.textures.get(font).clone()
      const txt = scenes.addText('Header', {
        font: fontData,
        fontSize: 16,
        map: fontTex,
        text: 'TOMORROW EVENING',
      })
      txt.position.set(20, -20, 0)

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
