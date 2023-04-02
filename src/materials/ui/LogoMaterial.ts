// Libs
import {
  AddEquation,
  Color,
  CustomBlending,
  OneFactor,
  OneMinusDstColorFactor,
  ShaderMaterial,
  ShaderMaterialParameters,
  Texture,
  Vector2,
} from 'three'
// Shader
import vertex from '@/glsl/default.vert'
import fragment from '@/glsl/materials/ui/logo.frag'

export type LogoMaterialProps = ShaderMaterialParameters & {
  map: Texture | null
}

export default class LogoMaterial extends ShaderMaterial {
  constructor(parameters?: LogoMaterialProps) {
    const res = 1 / 4
    const props = {
      defines: {},
      uniforms: {
        map: {
          type: 't',
          value: parameters?.map,
        },
        color: {
          value: new Color(),
        },
        opacity: {
          value: 1,
        },
        intensity: {
          value: 1,
        },
        time: {
          value: 0,
        },
        resolution: {
          value: new Vector2(res, res),
        },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      type: 'ui/LogoMaterial',
      blending: CustomBlending,
      blendEquation: AddEquation,
      blendSrc: OneMinusDstColorFactor,
      blendDst: OneFactor,
    }
    super(props)
    if (parameters !== undefined) {
      this.setValues(parameters)
    }
  }

  get map(): Texture | null {
    return this.uniforms.map.value
  }

  set map(value: Texture | null) {
    this.uniforms.map.value = value
  }

  get color(): Color {
    return this.uniforms.color.value
  }

  set color(value: Color) {
    this.uniforms.color.value = value
  }

  get intensity(): number {
    return this.uniforms.intensity.value
  }

  set intensity(value: number) {
    this.uniforms.intensity.value = value
  }

  get time(): number {
    return this.uniforms.time.value
  }

  set time(value: number) {
    this.uniforms.time.value = value
  }

  get resolution(): Vector2 {
    return this.uniforms.resolution.value
  }

  set resolution(value: Vector2) {
    this.uniforms.resolution.value = value
  }

  get alpha(): number {
    return this.uniforms.opacity.value
  }

  set alpha(value: number) {
    this.uniforms.opacity.value = value
  }
}
