import {
  AddEquation,
  AlwaysStencilFunc,
  Bone,
  BufferGeometry,
  Camera,
  CustomBlending,
  DstColorFactor,
  EqualStencilFunc,
  Float32BufferAttribute,
  KeepStencilOp,
  Material,
  Matrix4,
  Mesh,
  NormalBlending,
  NotEqualStencilFunc,
  Object3D,
  OneFactor,
  OneMinusDstColorFactor,
  OneMinusSrcAlphaFactor,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  PositionalAudio,
  ReplaceStencilOp,
  SrcAlphaFactor,
  Texture,
  Vector3,
  WebGLRenderTarget,
  WebGLRenderTargetOptions,
} from 'three'
import webgl from '@/models/webgl'

//////////////////////////////////////////////////
// Cameras

export const orthoCamera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1)

/**
 * Updates an Orthographic camera's view to fit pixel-perfect in view
 * @param {THREE.OrthographicCamera} camera
 * @param {Number} width Screen width
 * @param {Number} height Screen height
 * @param {Number} aspect Screen aspect ratio
 */
export function updateCameraOrtho(camera: OrthographicCamera, width: number, height: number): void {
  camera.left = width / -2
  camera.right = width / 2
  camera.top = height / 2
  camera.bottom = height / -2
  camera.position.x = width / 2
  camera.position.y = height / -2
  camera.updateProjectionMatrix()
}

/**
 * Updates a Perspective camera's FOV to fit pixel-perfect
 * @param {THREE.PerspectiveCamera} camera
 * @param {Number} width Screen width
 * @param {Number} height Screen height
 * @param {Number} distance Distance to the object to focus on
 */
export function updateCameraPerspective(
  camera: PerspectiveCamera,
  width: number,
  height: number,
  distance: number,
): void {
  const aspect = width / height
  const fov = 2 * Math.atan(width / aspect / (2 * distance)) * (180 / Math.PI)
  camera.fov = fov
  camera.aspect = aspect
  camera.updateProjectionMatrix()
}

//////////////////////////////////////////////////
// Dispose

// Dispose texture
export const disposeTexture = (texture?: Texture): void => {
  texture?.dispose()
}

// Dispose material
export const disposeMaterial = (material?: Material | Material[]): void => {
  if (!material) return

  if (Array.isArray(material)) {
    material.forEach((mat: Material) => mat.dispose())
  } else {
    material.dispose()
  }
}

// Dispose object
export const dispose = (object: Object3D): void => {
  if (!object) return

  // Dispose children
  while (object.children.length > 0) {
    const child = object.children[0]
    if (child instanceof PositionalAudio) {
      child.pause()
      if (child.parent) {
        child.parent.remove(child)
      }
    } else {
      dispose(child)
    }
  }

  // Dispose object
  if (object.parent) object.parent.remove(object)
  // @ts-ignore
  if (object.isMesh) {
    const mesh = object as Mesh
    mesh.geometry?.dispose()
    disposeMaterial(mesh.material)
  }

  // @ts-ignore
  if (object.dispose !== undefined) object.dispose()
}

//////////////////////////////////////////////////
// Geometry

export const triangle = new BufferGeometry()
triangle.setAttribute('position', new Float32BufferAttribute([-0.5, -0.5, 0, 1.5, -0.5, 0, -0.5, 1.5, 0], 3))
triangle.setAttribute('normal', new Float32BufferAttribute([0, 0, 1, 0, 0, 1], 3))
triangle.setAttribute('uv', new Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2))

export const plane = new PlaneGeometry()
export const planeTL = new PlaneGeometry()
anchorGeometryTL(planeTL)

/**
 * Updates your geometry to be offset
 * @param geometry Your geometry
 * @param x X-offset
 * @param y Y-offset
 * @param z Z-offset
 */
export function anchorGeometry(geometry: BufferGeometry, x: number, y: number, z: number) {
  geometry.applyMatrix4(new Matrix4().makeTranslation(x, -y, -z))
}

/**
 * Anchors your geometry to the top-left
 * @param geometry Your geometry
 */
export function anchorGeometryTL(geometry: BufferGeometry) {
  geometry.computeBoundingBox()
  const box = geometry.boundingBox!
  const x = (box.max.x - box.min.x) / 2
  const y = (box.max.y - box.min.y) / 2
  anchorGeometry(geometry, x, y, 0)
}

//////////////////////////////////////////////////
// Materials

export function createMask(mesh: Mesh, id: number, colorWrite = true, depthWrite = false) {
  mesh.renderOrder = -id
  const material = mesh.material
  if (Array.isArray(material)) {
    material.forEach((mat: Material) => {
      mat.colorWrite = colorWrite
      mat.depthWrite = depthWrite
      mat.stencilWrite = true
      mat.stencilRef = id
      mat.stencilFunc = AlwaysStencilFunc
      mat.stencilFail = ReplaceStencilOp
      mat.stencilZFail = ReplaceStencilOp
      mat.stencilZPass = ReplaceStencilOp
    })
  } else {
    material.colorWrite = colorWrite
    material.depthWrite = depthWrite
    material.stencilWrite = true
    material.stencilRef = id
    material.stencilFunc = AlwaysStencilFunc
    material.stencilFail = ReplaceStencilOp
    material.stencilZFail = ReplaceStencilOp
    material.stencilZPass = ReplaceStencilOp
  }
}

/**
 * Based on:
 * https://github.com/pmndrs/drei/blob/master/src/core/Mask.tsx
 */
export function useMask(mesh: Mesh, id: number, inverse = false) {
  const material = mesh.material
  if (Array.isArray(material)) {
    material.forEach((mat: Material) => {
      mat.stencilWrite = true
      mat.stencilRef = id
      mat.stencilFunc = inverse ? NotEqualStencilFunc : EqualStencilFunc
      mat.stencilFail = KeepStencilOp
      mat.stencilZFail = KeepStencilOp
      mat.stencilZPass = KeepStencilOp
    })
  } else {
    material.stencilWrite = true
    material.stencilRef = id
    material.stencilFunc = inverse ? NotEqualStencilFunc : EqualStencilFunc
    material.stencilFail = KeepStencilOp
    material.stencilZFail = KeepStencilOp
    material.stencilZPass = KeepStencilOp
  }
}

export function setMaterialBlendNormal(material: Material) {
  material.blending = NormalBlending
  material.blendEquation = AddEquation
  material.blendSrc = SrcAlphaFactor
  material.blendDst = OneMinusSrcAlphaFactor
  material.needsUpdate = true
}

export function setMaterialBlendAdd(material: Material) {
  material.blending = CustomBlending
  material.blendEquation = AddEquation
  material.blendSrc = SrcAlphaFactor
  material.blendDst = OneFactor
  material.needsUpdate = true
}

export function setMaterialBlendMultiply(material: Material) {
  material.blending = CustomBlending
  material.blendEquation = AddEquation
  material.blendSrc = DstColorFactor
  material.blendDst = OneMinusSrcAlphaFactor
  material.needsUpdate = true
}

export function setMaterialBlendScreen(material: Material) {
  material.blending = CustomBlending
  material.blendEquation = AddEquation
  material.blendSrc = OneMinusDstColorFactor
  material.blendDst = OneFactor
  material.needsUpdate = true
}

//////////////////////////////////////////////////
// Rendering / Shaders

/**
 * Renders your scene into a RenderTarget
 */
export const renderToTexture = (scene: Object3D, camera: Camera, target: WebGLRenderTarget) => {
  webgl.renderer.setRenderTarget(target)
  webgl.renderer.clear()
  webgl.renderer.render(scene, camera)
}

// FBO is a term referenced from OpenFrameworks:
// "Frame Buffer Object" - https://openframeworks.cc/documentation/gl/ofFbo/

/**
 * A "Frame Buffer Object" to be used generative shaders
 */
export class FBO {
  rt1: WebGLRenderTarget
  target: WebGLRenderTarget

  constructor(width: number, height: number, params?: WebGLRenderTargetOptions) {
    this.rt1 = new WebGLRenderTarget(width, height, params)
    this.target = this.rt1
  }

  /**
   * Resizes the Render Target
   * @param width The width of the Render Target
   * @param height The height of the Render Target
   */
  resize(width: number, height: number) {
    this.rt1.setSize(width, height)
  }

  get texture(): Texture {
    return this.target.texture
  }
}

/**
 * Meant for compute shaders (aka GPGPU shaders)
 */
export class DoubleFBO extends FBO {
  rt2: WebGLRenderTarget
  flip = true

  constructor(width: number, height: number, params?: WebGLRenderTargetOptions) {
    super(width, height, params)
    this.rt2 = this.rt1.clone()
  }

  /**
   * Resizes the Render Targets
   * @param width The width of the Render Targets
   * @param height The height of the Render Targets
   */
  resize(width: number, height: number) {
    this.rt1.setSize(width, height)
    this.rt2.setSize(width, height)
  }

  /**
   * Ping-pongs the FBO
   */
  swap() {
    if (this.flip) {
      this.target = this.rt2
    } else {
      this.target = this.rt1
    }
    this.flip = !this.flip
  }
}

//////////////////////////////////////////////////
// Skeleton

/**
 * Unexposed function from:
 * https://github.com/mrdoob/three.js/blob/fbf6d9de8d652105b27666a85498b3221c5d7daa/src/helpers/SkeletonHelper.js#L107
 */
export function getBoneList(object: any): Array<Bone> {
  const boneList: Array<Bone> = []
  if (object.isBone === true) {
    boneList.push(object as Bone)
  }
  for (let i = 0; i < object.children.length; i++) {
    // eslint-disable-next-line prefer-spread
    boneList.push.apply(boneList, getBoneList(object.children[i]))
  }
  return boneList
}

//////////////////////////////////////////////////
// Utils

let outputCanvas: HTMLCanvasElement | null = null
let outputLink: HTMLAnchorElement | null = null

export function saveTarget(target: WebGLRenderTarget, filename: string) {
  const { width, height } = target
  if (outputCanvas === null) outputCanvas = document.createElement('canvas')
  outputCanvas.width = width
  outputCanvas.height = height

  const ctx = outputCanvas.getContext('2d')!
  const img = ctx.getImageData(0, 0, width, height)
  webgl.renderer.readRenderTargetPixels(target, 0, 0, width, height, img.data)
  ctx.putImageData(img, 0, 0)

  outputCanvas.toBlob((blob: Blob | null) => {
    if (blob !== null) {
      const url = URL.createObjectURL(blob)
      if (outputLink === null) outputLink = document.createElement('a')
      outputLink.href = url
      outputLink.download = `${filename}.png`
      outputLink.click()
      URL.revokeObjectURL(url)
    }
  })
}

export function saveCanvasToPNG() {
  const canvas = webgl.renderer.domElement
  if (canvas !== null) {
    if (outputLink === null) outputLink = document.createElement('a')
    outputLink.setAttribute('download', `screenshot_${Date.now()}.png`)
    outputLink.setAttribute('href', canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream'))
    outputLink.click()
  }
}

export function worldToScreen(worldCoordinates: Vector3, camera: PerspectiveCamera): Vector3 {
  const screenCoordinates = worldCoordinates.clone()
  screenCoordinates.project(camera)
  const width = webgl.width
  const height = webgl.height
  screenCoordinates.x = ((screenCoordinates.x + 1) * width) / 2
  screenCoordinates.y = ((-screenCoordinates.y + 1) * height) / 2
  screenCoordinates.z = 0
  return screenCoordinates
}
