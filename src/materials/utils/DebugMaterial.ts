// Libs
import { ShaderLib, ShaderMaterial, UniformsUtils, Vector3 } from 'three'
// Shader
import vertex from '@/glsl/materials/debug.vert'
import fragment from '@/glsl/materials/debug.frag'
// Utils
import { debugInput, debugOptions } from '@/utils/debug'

export default class DebugMaterial extends ShaderMaterial {
  constructor(mode = 0) {
    super({
      defines: {
        USE_UV: '',
      },
      uniforms: UniformsUtils.merge([
        {
          debug: {
            value: mode,
          },
          opacity: {
            value: 1,
          },
          scalar: {
            value: new Vector3(1, 1, 1),
          },
        },
        ShaderLib.basic.uniforms,
      ]),
      vertexShader: vertex,
      fragmentShader: fragment,
      // @ts-ignore
      name: 'utils/DebugMaterial',
    })
  }

  initDebug(parent?: any): void {
    debugOptions(
      parent,
      'Mode',
      [
        {
          text: 'UV',
          value: 0,
        },
        {
          text: 'Normal',
          value: 1,
        },
        {
          text: 'Position',
          value: 2,
        },
      ],
      (value: number) => {
        this.mode = value
      },
    )
    debugInput(parent, this, 'scalar', {
      label: 'Position Scalar',
      x: {
        min: 0,
        max: 1000,
        step: 0.01,
      },
      y: {
        min: 0,
        max: 1000,
        step: 0.01,
      },
      z: {
        min: 0,
        max: 1000,
        step: 0.01,
      },
    })
  }

  get mode(): number {
    return this.uniforms.debug.value
  }

  set mode(value: number) {
    this.uniforms.debug.value = value
  }

  get scalar(): number {
    return this.uniforms.scalar.value
  }

  set scalar(value: number) {
    this.uniforms.scalar.value = value
  }
}
