// Libs
import { Color, ShaderMaterial, Texture, Vector2 } from 'three'
// Shader
import vertex from '@/glsl/default.vert'
import fragment from '@/glsl/materials/ui/basicUI.frag'

export default class UIMaterial extends ShaderMaterial {
  constructor(parameters?: any) {
    const props = {
      uniforms: {
        diffuse: {
          value: new Color(parameters?.color),
        },
        map: {
          value: parameters?.map,
        },
        opacity: {
          value: parameters?.opacity ? parameters?.opacity : 1,
        },
        mapOffset: {
          value: new Vector2(),
        },
        mapScale: {
          value: new Vector2(1, 1),
        },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      type: 'ui/UIMaterial',
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

  get offset(): Vector2 {
    return this.uniforms.mapOffset.value
  }

  set offset(value: Vector2) {
    this.uniforms.mapOffset.value = value
  }

  get scale(): Vector2 {
    return this.uniforms.mapScale.value
  }

  set scale(value: Vector2) {
    this.uniforms.mapScale.value = value
  }
}
