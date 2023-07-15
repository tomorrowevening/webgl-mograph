import {
  Color,
  Matrix4,
  MeshPhysicalMaterialParameters,
  NormalMapTypes,
  ShaderLib,
  ShaderMaterial,
  Texture,
  UniformsUtils,
  Vector2,
  Vector3,
} from 'three'
import { fragmentHeader, fragmentReplacement, vertexHeader, vertexReplacement } from './shader'

interface TPMeshPhysicalMaterialProps extends MeshPhysicalMaterialParameters {
  blendAmt?: number
  projectedMap?: Texture | null
  targetPos?: Vector3
  camWorldInverse?: Matrix4
  camProjection?: Matrix4
}

const TPMeshPhysicalVertex = ShaderLib.physical.vertexShader
  .replace('#include <common>', vertexHeader)
  .replace('#include <fog_vertex>', vertexReplacement)

const TPMeshPhysicalFragment = ShaderLib.physical.fragmentShader
  .replace('#include <common>', fragmentHeader)
  .replace('#include <dithering_fragment>', fragmentReplacement)

export default class TPMeshPhysicalMaterial extends ShaderMaterial {
  private _morphTargets = false
  private _morphNormals = false

  constructor(params?: TPMeshPhysicalMaterialProps) {
    super({
      defines: {},
      lights: true,
      uniforms: UniformsUtils.merge([
        ShaderLib.physical.uniforms,
        {
          tpBlend: { value: params?.blendAmt !== undefined ? params?.blendAmt : 0.5 },
          tpMap: { value: params?.projectedMap !== undefined ? params?.projectedMap : null },
          tpTargetPos: { value: params?.targetPos !== undefined ? params?.targetPos : new Vector3() },
          tpCamViewMatrix: { value: params?.camWorldInverse !== undefined ? params?.camWorldInverse : new Matrix4() },
          tpCamProjectionMatrix: { value: params?.camProjection !== undefined ? params?.camProjection : new Matrix4() },
        },
      ]),
      vertexShader: TPMeshPhysicalVertex,
      fragmentShader: TPMeshPhysicalFragment,
      // @ts-ignore
      name: 'textureProjection/MeshPhysicalMaterial',
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

  get projectedMap(): Texture | null {
    return this.uniforms.tpMap.value
  }

  set projectedMap(value: Texture | null) {
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

  // Physical material

  get color(): Color {
    return this.uniforms.diffuse.value
  }

  set color(value) {
    this.uniforms.diffuse.value.set(value)
  }

  get metalness(): number {
    return this.uniforms.metalness.value
  }

  set metalness(value: number) {
    this.uniforms.metalness.value = value
  }

  get roughness(): number {
    return this.uniforms.roughness.value
  }

  set roughness(value: number) {
    this.uniforms.roughness.value = value
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

  get emissive(): Color {
    return this.uniforms.emissive.value
  }

  set emissive(value: Color) {
    this.uniforms.emissive.value.set(value)
  }

  get emissiveMap(): Texture | null {
    return this.uniforms.emissiveMap.value
  }

  set emissiveMap(value: Texture | null) {
    this.needsUpdate = !!this.uniforms.emissiveMap.value !== !!value
    this.uniforms.emissiveMap.value = value
  }

  get bumpMap(): Texture | null {
    return this.uniforms.bumpMap.value
  }

  set bumpMap(value: Texture | null) {
    this.needsUpdate = !!this.uniforms.bumpMap.value !== !!value
    this.uniforms.bumpMap.value = value
  }

  get bumpScale(): number {
    return this.uniforms.bumpScale.value
  }

  set bumpScale(value: number) {
    this.uniforms.bumpScale.value = value
  }

  get normalMap(): Texture | null {
    return this.uniforms.normalMap.value
  }

  set normalMap(value: Texture | null) {
    this.needsUpdate = !!this.uniforms.normalMap.value !== !!value
    this.uniforms.normalMap.value = value
  }

  get normalMapType(): NormalMapTypes {
    // @ts-ignore
    return this._normalMapType
  }

  set normalMapType(value: NormalMapTypes) {
    // @ts-ignore
    this.needsUpdate = this._normalMapType !== value
    // @ts-ignore
    this._normalMapType = value
  }

  get normalScale(): Vector2 {
    return this.uniforms.normalScale.value
  }

  set normalScale(value: Vector2) {
    this.uniforms.normalScale.value = value
  }

  get displacementMap(): Texture | null {
    return this.uniforms.displacementMap.value
  }

  set displacementMap(value: Texture | null) {
    this.needsUpdate = !!this.uniforms.displacementMap.value !== !!value
    this.uniforms.displacementMap.value = value
  }

  get displacementScale(): number {
    return this.uniforms.displacementScale.value
  }

  set displacementScale(value: number) {
    this.uniforms.displacementScale.value = value
  }

  get displacementBias(): number {
    return this.uniforms.displacementBias.value
  }

  set displacementBias(value: number) {
    this.uniforms.displacementBias.value = value
  }

  get roughnessMap(): Texture | null {
    return this.uniforms.roughnessMap.value
  }

  set roughnessMap(value: Texture | null) {
    this.needsUpdate = !!this.uniforms.roughnessMap.value !== !!value
    this.uniforms.roughnessMap.value = value
  }

  get metalnessMap(): Texture | null {
    return this.uniforms.metalnessMap.value
  }

  set metalnessMap(value: Texture | null) {
    this.needsUpdate = !!this.uniforms.metalnessMap.value !== !!value
    this.uniforms.metalnessMap.value = value
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

  get refractionRatio(): number {
    return this.uniforms.refractionRatio.value
  }

  set refractionRatio(value: number) {
    this.uniforms.refractionRatio.value = value
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
