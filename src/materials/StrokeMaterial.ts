import { Color, ColorRepresentation, DoubleSide, ShaderMaterial, Side, Vector3 } from 'three'
import vertex from '@/glsl/materials/stroke.vert'
import fragment from '@/glsl/materials/stroke.frag'

type StrokeProps = {
  diffuse?: ColorRepresentation
  thickness?: number
  opacity?: number
  dash?: number
  dashGap?: number
  dashOffset?: number
  trimStart?: number
  trimEnd?: number
  trimOffset?: number
  side?: Side | undefined
}

export default class StrokeMaterial extends ShaderMaterial {
  constructor(params?: StrokeProps) {
    super({
      uniforms: {
        thickness: {
          value: params?.thickness !== undefined ? params?.thickness : 4.0,
        },
        opacity: {
          value: params?.opacity !== undefined ? params?.opacity : 1.0,
        },
        diffuse: {
          value: new Color(params?.diffuse !== undefined ? params?.diffuse : 0xffffff),
        },
        dash: {
          value: new Vector3(
            params?.dash !== undefined ? params?.dash : 0,
            params?.dashGap !== undefined ? params?.dashGap : 10,
            params?.dashOffset !== undefined ? params?.dashOffset : 0,
          ),
        },
        trim: {
          value: new Vector3(
            params?.trimStart !== undefined ? params?.trimStart : 0,
            params?.trimEnd !== undefined ? params?.trimEnd : 1,
            params?.trimOffset !== undefined ? params?.trimOffset : 0,
          ),
        },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      side: params?.side !== undefined ? params?.side : DoubleSide,
      // @ts-ignore
      type: 'StrokeMaterial',
    })
  }

  get thickness(): number {
    return this.uniforms.thickness.value
  }

  set thickness(value: number) {
    this.uniforms.thickness.value = value
  }

  get alpha(): number {
    return this.uniforms.opacity.value
  }

  set alpha(value: number) {
    this.uniforms.opacity.value = value
  }

  get diffuse(): Color {
    return this.uniforms.diffuse.value
  }

  set diffuse(value: Color) {
    this.uniforms.diffuse.value = value
  }

  get dash(): number {
    return this.uniforms.dash.value.x
  }

  set dash(value: number) {
    this.uniforms.dash.value.x = value
  }

  get dashGap(): number {
    return this.uniforms.dash.value.y
  }

  set dashGap(value: number) {
    this.uniforms.dash.value.y = value
  }

  get dashOffset(): number {
    return this.uniforms.dash.value.z
  }

  set dashOffset(value: number) {
    this.uniforms.dash.value.z = value
  }

  get trimStart(): number {
    return this.uniforms.trim.value.x
  }

  set trimStart(value: number) {
    this.uniforms.trim.value.x = value
  }

  get trimEnd(): number {
    return this.uniforms.trim.value.y
  }

  set trimEnd(value: number) {
    this.uniforms.trim.value.y = value
  }

  get trimOffset(): number {
    return this.uniforms.trim.value.z
  }

  set trimOffset(value: number) {
    this.uniforms.trim.value.z = value
  }
}
