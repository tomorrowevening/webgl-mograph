// Libs
import { Color, ShaderMaterial, ShaderMaterialParameters, Texture } from 'three'
// Shader
import vertex from '@/glsl/default.vert'
import fragment from '@/glsl/materials/ui/font.frag'

export type TextMaterialProps = ShaderMaterialParameters & {
  map: Texture | null
}

export default class TextMaterial extends ShaderMaterial {
  constructor(parameters?: TextMaterialProps) {
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
      },
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      type: 'ui/TextMaterial',
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

  get alpha(): number {
    return this.uniforms.opacity.value
  }

  set alpha(value: number) {
    this.uniforms.opacity.value = value
  }
}
