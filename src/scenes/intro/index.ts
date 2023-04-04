// Libs
import {
  AmbientLight,
  Clock,
  HalfFloatType,
  Mesh,
  OrthographicCamera,
  PerspectiveCamera,
  PointLight,
  Shape,
  TorusGeometry,
  TorusKnotGeometry,
  Vector2,
  Vector3,
  WebGLRenderTarget,
} from 'three'
import { SVGLoader, SVGResult, SVGResultPaths } from 'three/examples/jsm/loaders/SVGLoader'
import gsap from 'gsap'
import { EffectComposer, EffectPass, FXAAEffect, Pass, RenderPass, VignetteEffect } from 'postprocessing'
// Models
import assets from '@/models/assets'
import { IS_DEV } from '@/models/constants'
import webgl from '@/models/webgl'
// Views
import BaseScene from '../BaseScene'
import LineGeometry from '@/geometry/LineGeometry'
import StrokeMaterial from '@/materials/StrokeMaterial'
import TPMeshBasicMaterial from '@/materials/textureProjection/TPMeshBasicMaterial'
import TPMeshPhysicalMaterial from '@/materials/textureProjection/TPMeshPhysicalMaterial'
// Utils
import { debugColor, debugFolder, debugInput } from '@/utils/debug'

export default class IntroScene extends BaseScene {
  composer!: EffectComposer

  unlitTP!: TPMeshBasicMaterial
  box!: Mesh
  litTP!: TPMeshPhysicalMaterial
  torus!: Mesh

  private clock: Clock

  constructor() {
    super('intro')
    this.camera = new PerspectiveCamera(60, webgl.width / webgl.height, 1, 1000)
    this.camera.name = 'introMainCam'
    this.camera.position.z = 300
    this.cameras.add(this.camera)

    this.clock = new Clock()

    const ambient = new AmbientLight(0xffffff, 0.5)
    ambient.name = 'ambient'
    this.lights.add(ambient)

    const light = new PointLight(0xffffff)
    light.name = 'pointLight'
    light.position.set(300, 600, 500)
    this.lights.add(light)
  }

  protected override initMesh(): Promise<void> {
    return new Promise((resolve) => {
      const texture = assets.textures.get('uv_grid')
      const target = new Vector3(0, 0, 100)

      this.unlitTP = new TPMeshBasicMaterial({
        projectedMap: texture.clone(),
        targetPos: target,
        camWorldInverse: this.camera.matrixWorldInverse.clone(),
        camProjection: this.camera.projectionMatrix.clone(),
      })
      this.box = new Mesh(new TorusKnotGeometry(100, 20, 18, 36), this.unlitTP)
      this.box.name = 'boxMesh'
      this.box.position.x = 250
      this.world.add(this.box)

      this.camera.updateProjectionMatrix()
      this.litTP = new TPMeshPhysicalMaterial({
        projectedMap: texture.clone(),
        targetPos: target,
        camWorldInverse: this.camera.matrixWorldInverse.clone(),
        camProjection: this.camera.projectionMatrix.clone(),
        metalness: 0.5,
        roughness: 0.5,
      })

      this.torus = new Mesh(new TorusGeometry(100, 20, 18, 36), this.litTP)
      this.torus.name = 'torusMesh'
      this.torus.position.x = -250
      this.world.add(this.torus)

      const loader = new SVGLoader()
      loader.load('svg/test.svg', (data: SVGResult) => {
        data.paths.forEach((path: SVGResultPaths) => {
          const shapes = SVGLoader.createShapes(path)
          shapes.forEach((shape: Shape) => {
            const vectors = shape.getPoints()
            const pts: Array<number[]> = []
            vectors.forEach((v: Vector2) => {
              pts.push([v.x, -v.y])
            })
            const lineGeom = new LineGeometry(pts, { closed: false, distances: true })
            const lineMat = new StrokeMaterial({
              diffuse: 0xffffff,
              thickness: 1,
            })
            const line = new Mesh(lineGeom, lineMat)
            line.name = 'line'
            line.position.set(-100, 100, 0)
            this.world.add(line)

            if (IS_DEV) {
              const folder = debugFolder('Line')
              debugInput(folder, lineMat, 'alpha', {
                min: 0,
                max: 1,
              })
              debugColor(folder, lineMat, 'diffuse')
              debugInput(folder, lineMat, 'thickness', {
                min: 0,
                max: 20,
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
            }
          })
        })
      })

      resolve()
    })
  }

  protected override initPost(): Promise<void> {
    return new Promise((resolve) => {
      this.composer = new EffectComposer(webgl.renderer, {
        frameBufferType: HalfFloatType,
      })
      this.composer.autoRenderToScreen = false

      this.composer.addPass(new RenderPass(this, this.camera))
      this.composer.addPass(new EffectPass(this.camera, new FXAAEffect(), new VignetteEffect()))
      console.log(this.composer)

      resolve()
    })
  }

  protected override initAnimation(): Promise<void> {
    return new Promise((resolve) => {
      resolve()
    })
  }

  override show(): void {
    super.show()
    this.clock.start()
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
    const time = this.clock.getElapsedTime()

    this.box.rotateX(0.01)
    this.box.rotateY(0.02)
    this.box.rotateZ(0.005)

    this.torus.rotateX(-0.005)
    this.torus.rotateY(-0.01)
    this.torus.rotateZ(-0.02)

    const mainCam = this.cameras.getObjectByName('introMainCam') as PerspectiveCamera
    mainCam.updateProjectionMatrix()
    mainCam.updateMatrixWorld()

    this.unlitTP.camWorldInverse.copy(mainCam.matrixWorldInverse)
    this.unlitTP.camProjection.copy(mainCam.projectionMatrix)

    this.litTP.camWorldInverse.copy(mainCam.matrixWorldInverse)
    this.litTP.camProjection.copy(mainCam.projectionMatrix)
    this.litTP.blendAmt = Math.sin(time / 1000) * 0.5 + 0.5
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
