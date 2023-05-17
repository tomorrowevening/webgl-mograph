import { PCFShadowMap, WebGLRenderer, WebGLRenderTarget, WebGLRenderTargetOptions } from 'three'
import { IS_DEV } from './constants'
import { settings } from './settings'
import { debugSettings } from '@/utils/debug'

class WebGLSingleton {
  renderer!: WebGLRenderer
  renderTargets: Map<string, WebGLRenderTarget> = new Map<string, WebGLRenderTarget>()

  init = (canvas: HTMLCanvasElement) => {
    this.renderer = new WebGLRenderer({
      canvas: canvas,
      powerPreference: 'high-performance',
      stencil: false,
    })
    this.renderer.autoClear = false
    this.renderer.info.autoReset = !IS_DEV // debug performance
    this.renderer.setClearColor(0x0d0d0d)
    this.renderer.setPixelRatio(settings.quality === 'low' ? 1 : devicePixelRatio)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = PCFShadowMap

    this.addRT('previousScene')
    this.addRT('currentScene')
    this.addRT('transition', { depthBuffer: false })
    this.addRT('ui', { depthBuffer: false })

    // Settings / debug
    settings.checkGPU(this.renderer)
    if (IS_DEV) debugSettings()
  }

  resize = (width: number, height: number) => {
    const dpr = this.dpr
    this.renderTargets.forEach((renderTarget: WebGLRenderTarget) => {
      renderTarget.setSize(width * dpr, height * dpr)
    })
    this.renderer.setSize(width, height)
  }

  addRT = (name: string, params?: WebGLRenderTargetOptions) => {
    const rt = new WebGLRenderTarget(32, 32, params)
    rt.texture.name = name
    this.renderTargets.set(name, rt)
  }

  set dpr(value: number) {
    this.renderer.setPixelRatio(value)
  }

  get dpr(): number {
    return this.renderer.getPixelRatio()
  }

  get width(): number {
    return this.renderer.domElement.width / this.dpr
  }

  get height(): number {
    return this.renderer.domElement.height / this.dpr
  }

  get canvas(): HTMLCanvasElement {
    return this.renderer.domElement
  }
}

const webgl = new WebGLSingleton()
export default webgl
