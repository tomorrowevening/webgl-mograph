import { ShaderMaterial, Texture } from 'three'
import vertex from '../../glsl/default.vert'
import webgl from '../../models/webgl'

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
          prevScene: {
            value: webgl.renderTargets.get('previousScene')!.texture,
          },
          currentScene: {
            value: webgl.renderTargets.get('currentScene')!.texture,
          },
        },
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

  get prevScene(): Texture | null {
    return this.uniforms.prevScene.value
  }

  set prevScene(value: Texture | null) {
    this.uniforms.prevScene.value = value
  }

  get currentScene(): Texture | null {
    return this.uniforms.currentScene.value
  }

  set currentScene(value: Texture | null) {
    this.uniforms.currentScene.value = value
  }
}
