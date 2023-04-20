// Libs
import {
  AmbientLight,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  Clock,
  DirectionalLight,
  HemisphereLight,
  Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  RectAreaLight,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SpotLight,
  Texture,
  WebGLRenderTarget,
} from 'three'
// Models
import { Events, IS_DEV, threeDispatcher } from '@/models/constants'
import webgl from '@/models/webgl'
import { Scenes } from '@/types'
// Controllers
import scenes from '@/controllers/SceneController'
import assets from '@/models/assets'

export default class BaseScene extends Scene {
  camera!: PerspectiveCamera | OrthographicCamera
  clock: Clock

  // Scene setup
  cameras: Object3D
  lights: Object3D
  world: Object3D
  utils: Object3D // Helpers / controls

  constructor(name: Scenes) {
    super()
    this.name = name

    this.clock = new Clock()

    this.cameras = new Object3D()
    this.cameras.name = 'cameras'
    this.add(this.cameras)

    this.lights = new Object3D()
    this.lights.name = 'lights'
    this.add(this.lights)

    this.utils = new Object3D()
    this.utils.name = 'utils'
    this.add(this.utils)

    this.world = new Object3D()
    this.world.name = 'world'
    this.add(this.world)
  }

  async init() {
    await this.buildFromJSON()
    await this.initLighting()
    await this.initMesh()
    await this.initPost()
    await this.initAnimation()
    if (IS_DEV) this.initDebug()
  }

  protected initLighting(): Promise<void> {
    return new Promise((resolve) => {
      resolve()
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

  protected initDebug(): void {
    //
  }

  //////////////////////////////////////////////////
  // Build

  private async buildLights(data: Array<any>) {
    data.forEach((info: any) => {
      // Check if light already exists
      if (this.lights.getObjectByName(info.name) !== undefined) return

      let light: any = undefined
      switch (info.type) {
        case 'AmbientLight':
          light = new AmbientLight(info.color, info.intensity)
          break
        case 'DirectionalLight':
          light = new DirectionalLight(info.color, info.intensity)
          break
        case 'HemisphereLight':
          light = new HemisphereLight(info.skyColor, info.groundColor, info.intensity)
          break
        case 'PointLight':
          light = new PointLight(info.color, info.intensity, info.distance, info.decay)
          break
        case 'RectAreaLight':
          light = new RectAreaLight(info.color, info.intensity, info.width, info.height)
          break
        case 'SpotLight':
          light = new SpotLight(info.color, info.intensity, info.distance, info.angle, info.penumbra, info.decay)
          break
      }

      if (light !== undefined) {
        const m = info.matrix as Array<number>
        light.matrix.set(
          m[0],
          m[1],
          m[2],
          m[3],
          m[4],
          m[5],
          m[6],
          m[7],
          m[8],
          m[9],
          m[10],
          m[11],
          m[12],
          m[13],
          m[14],
          m[15],
        )
        light.name = info.name
        light.uuid = info.uuid
        this.lights.add(light)
      }
    })
  }

  private async buildWorld(scene: any) {
    if (scene.geometries === undefined || scene.materials === undefined || scene.children === undefined) return

    // Geometries
    const geometries: Map<string, BufferGeometry> = new Map()
    scene.geometries.forEach((item: any) => {
      let geom = undefined
      switch (item.type) {
        case 'BufferGeometry':
          geom = new BufferGeometry()
          // TODO: Check Array type
          for (const name in item.data.attributes) {
            const attr = item.data.attributes[name]
            let data = undefined
            if (attr.type === 'Float32Array') {
              data = new Float32Array(attr.array)
            }
            if (data !== undefined) {
              const bufferAttr = new BufferAttribute(data, attr.itemSize)
              geom.setAttribute(name, bufferAttr)
            }
          }
          break
        case 'PlaneGeometry':
          geom = new PlaneGeometry(item.width, item.height, item.widthSegments, item.heightSegments)
          break
        case 'BoxGeometry':
          geom = new BoxGeometry(
            item.width,
            item.height,
            item.depth,
            item.widthSegments,
            item.heightSegments,
            item.depthSegments,
          )
          break
        case 'CircleGeometry':
          geom = new CircleGeometry(item.radius, item.segments, item.theataStart, item.theataLength)
          break
        case 'SphereGeometry':
          geom = new SphereGeometry(
            item.radius,
            item.widthSegments,
            item.heightSegments,
            item.phiStart,
            item.phiLength,
            item.theataStart,
            item.theataLength,
          )
          break
      }

      if (geom !== undefined) {
        geom.uuid = item.uuid
        geometries.set(item.uuid, geom)
      }
    })

    // Images
    const images: Map<string, string> = new Map()
    if (scene.images !== undefined) {
      scene.images.forEach((value: any) => {
        images.set(value.uuid, value.url)
      })
    }

    // Textures
    const textures: Map<string, Texture> = new Map()
    if (scene.textures !== undefined) {
      scene.textures.forEach((value: any) => {
        const texture = new Texture(
          value.image,
          value.mapping,
          value.wrap[0],
          value.wrap[1],
          value.magFilter,
          value.minFilter,
          value.format,
          value.type,
          value.anisotropy,
          value.encoding,
        )
        texture.name = value.name
        texture.uuid = value.uuid
        textures.set(value.uuid, texture)
      })
    }

    // Materials
    const materials: Map<string, Material> = new Map()
    if (scene.materials !== undefined) {
      scene.materials.forEach((item: any) => {
        let material = undefined
        switch (item.type) {
          case 'MeshBasicMaterial':
            material = new MeshBasicMaterial(item)
            break
          case 'MeshPhysicalMaterial':
            material = new MeshPhysicalMaterial(item)
            break
          case 'ShaderMaterial':
            material = new ShaderMaterial(item)
            break
        }

        if (material !== undefined) {
          material.uuid = item.uuid
          materials.set(item.uuid, material)
        }
      })
    }

    // Objects
    const addObject = (item: any, parent?: Object3D): Object3D | undefined => {
      // Check if light already exists
      if (this.world.getObjectByName(item.name) !== undefined) return undefined

      let obj: any = undefined
      switch (item.type) {
        default:
        case 'Object3D':
          obj = new Object3D()
          break
        case 'Mesh':
          const geom = geometries.get(item.geometry)
          const mat = materials.get(item.material)
          // @ts-ignore
          obj = new Mesh(geom, mat)
          break
      }

      if (obj !== undefined) {
        obj.name = item.name
        obj.uuid = item.uuid
        const m = item.matrix as Array<number>
        const matrix = new Matrix4()
        matrix.set(m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8], m[9], m[10], m[11], m[12], m[13], m[14], m[15])
        obj.applyMatrix4(matrix)
        obj.updateMatrix()
        parent?.add(obj)
        if (item.children !== undefined) {
          item.children.forEach((child: any) => {
            // @ts-ignore
            addObject(child, obj)
          })
        }
      }
      return obj
    }

    scene.children.forEach((child: any) => {
      addObject(child, this.world)
    })
  }

  protected buildFromJSON(): Promise<void> {
    return new Promise((resolve) => {
      const json = assets.json.get('data').scenes
      // @ts-ignore
      const scene = json[this.name]
      if (scene !== undefined) {
        if (scene.lights !== undefined) {
          this.buildLights(scene.lights)
        }
        if (scene.world !== undefined) {
          this.buildWorld(scene.world)
        }
      }
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
    this.clock.start()
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

  postDraw(): void {
    //
  }

  resize(width: number, height: number): void {
    // update camera
  }

  updateCamera(camera: PerspectiveCamera | OrthographicCamera) {
    this.camera = camera
  }

  get transitionProgress(): number {
    return scenes.transitionProgress
  }

  set transitionProgress(value: number) {
    scenes.transitionProgress = value
  }
}
