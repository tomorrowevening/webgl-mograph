// Libs
import { ShaderMaterial, Vector2, WebGLRenderTarget } from 'three'
// Models
import { IS_DEV } from '../../models/constants'
import webgl from '../../models/webgl'
// Shader
import vertex from '../../glsl/fxaa.vert'
import fragment from '../../glsl/post/composite.frag'

export default class CompositeMaterial extends ShaderMaterial {
  constructor(params?: any) {
    const currentRT = webgl.renderTargets.get('currentScene') as WebGLRenderTarget
    const prevRT = webgl.renderTargets.get('previousScene') as WebGLRenderTarget
    const transitionRT = webgl.renderTargets.get('transition') as WebGLRenderTarget
    const uiRT = webgl.renderTargets.get('ui') as WebGLRenderTarget
    const defaultParams = {
      uniforms: {
        currentSceneTex: {
          value: currentRT.texture,
        },
        prevSceneTex: {
          value: prevRT.texture,
        },
        transitionTex: {
          value: transitionRT.texture,
        },
        transitioning: {
          value: false,
        },
        uiTex: {
          value: uiRT.texture,
        },
        resolution: {
          value: new Vector2(webgl.width, webgl.height),
        },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
      type: 'post/CompositeMaterial',
      defines: {},
      ...params,
    }
    if (IS_DEV && document.location.hash.search('debugGrid') > -1) {
      defaultParams.defines['DEBUG_GRID'] = ''
      defaultParams.uniforms['gridSize'] = { value: new Vector2(100, 1) }
      defaultParams.uniforms['gridOffset'] = { value: new Vector2() }
    }
    super(defaultParams)
  }

  setResolution(width: number, height: number): void {
    const dpr = webgl.dpr
    this.uniforms.resolution.value.set(width * dpr, height * dpr)
  }

  get transitioning(): boolean {
    return this.uniforms.transitioning.value
  }

  set transitioning(value: boolean) {
    this.uniforms.transitioning.value = value
  }
}
