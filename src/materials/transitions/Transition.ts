import { ShaderMaterial } from 'three'
import vertex from '../../glsl/default.vert'

export default class Transition extends ShaderMaterial {
  constructor(name: string, fragment: string, uniforms?: any) {
    super({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uniforms,
        ...{
          progress: {
            value: 0,
          },
        }
      },
      // @ts-ignore
      type: `transition/${name}`,
    })
  }

  get progress(): number {
    return this.uniforms.progress.value
  }

  set progress(value: number) {
    this.uniforms.progress.value = value
  }
}
