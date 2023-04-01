// Libs
import { BoxGeometry, Mesh, MeshNormalMaterial, PerspectiveCamera, Vector2 } from 'three'
import gsap from 'gsap'
// Models
import webgl from '../../models/webgl'
// Views
import BaseScene from '../BaseScene'
import LineGeometry from '../../geometry/LineGeometry'
import StrokeMaterial from '../../materials/StrokeMaterial'
import { debugColor, debugFolder, debugInput } from '../../utils/debug'

export default class IntroScene extends BaseScene {
  constructor() {
    super('intro')
    this.camera = new PerspectiveCamera(60, webgl.width / webgl.height, 1, 1000)
    this.camera.name = 'introMainCam'
    this.camera.position.z = 300
    this.cameras.add(this.camera)
  }

  protected override initMesh(): Promise<void> {
    return new Promise((resolve) => {
      const mesh = new Mesh(new BoxGeometry(100, 100, 100), new MeshNormalMaterial())
      mesh.name = 'boxMesh'
      this.world.add(mesh)

      const border = 120
      const pts: Array<number[]> = [
        [-border, -border],
        [border, -border],
        [border, border],
        [-border, border],
      ]
      const lineGeom = new LineGeometry(pts, { closed: true, distances: true })
      const lineMat = new StrokeMaterial({
        diffuse: 0xffffff,
        thickness: 4,
      })
      const line = new Mesh(lineGeom, lineMat)
      line.name = 'line'
      this.world.add(line)

      const folder = debugFolder('Line')
      debugInput(folder, lineMat, 'alpha', {
        min: 0,
        max: 1,
      })
      debugColor(folder, lineMat, 'diffuse')
      debugInput(folder, lineMat, 'thickness', {
        min: 0,
        max: 50,
      })
      debugInput(folder, lineMat, 'dash', {
        min: 0,
        max: 10,
      })
      debugInput(folder, lineMat, 'dashGap', {
        min: 0,
        max: 10,
      })
      debugInput(folder, lineMat, 'dashOffset', {
        min: 0,
        max: 10,
      })
      debugInput(folder, lineMat, 'trimStart', {
        min: -1,
        max: 1,
      })
      debugInput(folder, lineMat, 'trimEnd', {
        min: -1,
        max: 1,
      })
      debugInput(folder, lineMat, 'trimOffset', {
        min: -1,
        max: 1,
      })

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

  override resize(width: number, height: number): void {
    const cam = this.camera as PerspectiveCamera
    cam.aspect = width / height
    cam.updateProjectionMatrix()
  }
}
