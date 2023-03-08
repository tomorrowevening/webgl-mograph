import { WebGLRenderer } from 'three'
import { settings } from './settings'

class WebGLSingleton {
  renderer!: WebGLRenderer

  init = (canvas: HTMLCanvasElement) => {
    this.renderer = new WebGLRenderer({
      canvas: canvas,
      powerPreference: 'high-performance',
      antialias: false,
      stencil: false,
      depth: false
    })
    this.renderer.autoClear = false
    this.renderer.info.autoReset = false // debug performance
    this.renderer.setPixelRatio(settings.quality === 'low' ? 1 : devicePixelRatio)
  }

  resize = (width: number, height: number) => {
    this.renderer.setSize(width, height)
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
