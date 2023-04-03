import {
  Color,
  Matrix4,
  MeshBasicMaterialParameters,
  ShaderLib,
  ShaderMaterial,
  Texture,
  UniformsUtils,
  Vector3,
} from 'three'
import { fragmentHeader, fragmentReplacement, vertexHeader, vertexReplacement } from './shader'

interface TPMeshBasicMaterialProps extends MeshBasicMaterialParameters {
  projectedBlend?: number
  projectedMap?: Texture | null
  targetPos?: Vector3
  camWorldInverse?: Matrix4
  camProjection?: Matrix4
}

const TPMeshBasicVertex = ShaderLib.basic.vertexShader
  .replace('#include <common>', vertexHeader)
  .replace('#include <fog_vertex>', vertexReplacement)

const TPMeshBasicFragment = ShaderLib.basic.fragmentShader
  .replace('#include <common>', fragmentHeader)
  .replace('#include <dithering_fragment>', fragmentReplacement)

export default class TPMeshBasicMaterial extends ShaderMaterial {
  private _morphTargets = false
  private _morphNormals = false

  constructor(params?: TPMeshBasicMaterialProps) {
    super({
      defines: {},
      uniforms: UniformsUtils.merge([
        ShaderLib.basic.uniforms,
        {
          tpBlend: { value: params?.projectedBlend !== undefined ? params?.projectedBlend : 0.5 },
          tpMap: { value: params?.projectedMap !== undefined ? params?.projectedMap : null },
          tpTargetPos: { value: params?.targetPos !== undefined ? params?.targetPos : new Vector3() },
          tpCamViewMatrix: { value: params?.camWorldInverse !== undefined ? params?.camWorldInverse : new Matrix4() },
          tpCamProjectionMatrix: { value: params?.camProjection !== undefined ? params?.camProjection : new Matrix4() },
        },
      ]),
      vertexShader: TPMeshBasicVertex,
      fragmentShader: TPMeshBasicFragment,
      // @ts-ignore
      type: 'textureProjection/TPMeshBasicMaterial',
    })
    // @ts-ignore
    this.setValues(params)
  }

  get blendAmt(): number {
    return this.uniforms.tpBlend.value
  }

  set blendAmt(value: number) {
    this.uniforms.tpBlend.value = value
  }

  get tpMap(): Texture | null {
    return this.uniforms.tpMap.value
  }

  set tpMap(value: Texture | null) {
    this.uniforms.tpMap.value = value
  }

  get targetPos(): Vector3 {
    return this.uniforms.tpTargetPos.value
  }

  set targetPos(value: Vector3) {
    this.uniforms.tpTargetPos.value = value
  }

  get camWorldInverse(): Matrix4 {
    return this.uniforms.tpCamViewMatrix.value
  }

  set camWorldInverse(value: Matrix4) {
    this.uniforms.tpCamViewMatrix.value = value
  }

  get camProjection(): Matrix4 {
    return this.uniforms.tpCamProjectionMatrix.value
  }

  set camProjection(value: Matrix4) {
    this.uniforms.tpCamProjectionMatrix.value = value
  }

  // Basic material

  get color(): Color {
    return this.uniforms.diffuse.value
  }

  set color(value) {
    this.uniforms.diffuse.value.set(value)
  }

  // @ts-ignore
  get opacity(): number {
    return this.uniforms.opacity.value
  }

  set opacity(value: number) {
    // set in material constructor when uniforms aren't assigned yet
    if (this.uniforms) this.uniforms.opacity.value = value
  }

  get map(): Texture | null {
    return this.uniforms.map.value
  }

  set map(value: Texture | null) {
    this.needsUpdate = !!this.uniforms.map.value !== !!value
    this.uniforms.map.value = value
  }

  get lightMap(): Texture | null {
    return this.uniforms.lightMap.value
  }

  set lightMap(value: Texture | null) {
    this.needsUpdate = !!this.uniforms.lightMap.value !== !!value
    this.uniforms.lightMap.value = value
  }

  get lightMapIntensity(): number {
    return this.uniforms.lightMapIntensity.value
  }

  set lightMapIntensity(value: number) {
    this.uniforms.lightMapIntensity.value = value
  }

  get aoMap(): Texture | null {
    return this.uniforms.aoMap.value
  }

  set aoMap(value: Texture | null) {
    this.needsUpdate = !!this.uniforms.aoMap.value !== !!value
    this.uniforms.aoMap.value = value
  }

  get aoMapIntensity(): number {
    return this.uniforms.aoMapIntensity.value
  }

  set aoMapIntensity(value: number) {
    this.uniforms.aoMapIntensity.value = value
  }

  get alphaMap(): Texture | null {
    return this.uniforms.alphaMap.value
  }

  set alphaMap(value: Texture | null) {
    this.needsUpdate = !!this.uniforms.alphaMap.value !== !!value
    this.uniforms.alphaMap.value = value
  }

  get envMap(): Texture | null {
    return this.uniforms.envMap.value
  }

  set envMap(value: Texture | null) {
    this.needsUpdate = !!this.uniforms.envMap.value !== !!value
    this.uniforms.envMap.value = value
  }

  get envMapIntensity(): number {
    return this.uniforms.envMapIntensity.value
  }

  set envMapIntensity(value: number) {
    this.uniforms.envMapIntensity.value = value
  }

  get skinning(): boolean {
    // @ts-ignore
    return this._skinning
  }

  set skinning(value: boolean) {
    // @ts-ignore
    if (this._skinning !== value) this.needsUpdate = true
    // @ts-ignore
    this._skinning = value
  }

  get morphTargets(): boolean {
    // @ts-ignore
    return this._morphTargets
  }

  set morphTargets(value: boolean) {
    // @ts-ignore
    if (this._morphTargets !== value) this.needsUpdate = true

    // @ts-ignore
    this._morphTargets = value
  }

  get morphNormals(): boolean {
    // @ts-ignore
    return this._morphNormals
  }

  set morphNormals(value: boolean) {
    // @ts-ignore
    if (this._morphNormals !== value) this.needsUpdate = true

    // @ts-ignore
    this._morphNormals = value
  }
}
