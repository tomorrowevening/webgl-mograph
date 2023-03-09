import { getGPUTier } from 'detect-gpu'
import { FloatType, HalfFloatType, RGBAFormat, WebGLRenderer, WebGLRenderTarget } from 'three'

export type Quality = 'low' | 'medium' | 'high'

function testFBO(renderer: WebGLRenderer, type: number): boolean {
  const rt = new WebGLRenderTarget(4, 4, {
    depthBuffer: false,
    type,
    format: RGBAFormat,
  })

  renderer.setRenderTarget(rt)

  const gl = renderer.getContext()
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
  renderer.setRenderTarget(null)
  rt.dispose()

  return status === gl.FRAMEBUFFER_COMPLETE
}

function tryHalfFloat(renderer: WebGLRenderer): boolean {
  try {
    const gl = renderer.getContext()
    const data = []
    for (let i = 0; i < 16 * 4; ++i) {
      data[i] = 0
    }
    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      4,
      4,
      0,
      gl.RGBA,
      // @ts-ignore
      gl.getExtension('OES_texture_half_float').HALF_FLOAT_OES,
      new Uint16Array(data),
    )
    // this still gives an error on iOS, even tho the upload works?
    const error = gl.getError()
    gl.deleteTexture(tex)

    return error === gl.NO_ERROR
  } catch (_) {
    return false
  }
}

export const settings = {
  mobile: false,
  quality: 'low',
  gpu: {
    FLOAT_TEXTURES: false,
    HALF_FLOAT_TEXTURES: false,
    FLOAT_TEX_LINEAR: false,
    HALF_FLOAT_TEX_LINEAR: false,
    FLOAT_FBO: false,
    HALF_FLOAT_FBO: false,
    shaderTextureLOD: false,
  },
  detect: async function () {
    const gpuTier = await getGPUTier()

    // Device
    if (gpuTier.isMobile !== undefined) this.mobile = gpuTier.isMobile

    // Quality
    switch (gpuTier.tier) {
      case 0:
      case 1:
        this.quality = 'low'
        break
      case 2:
        this.quality = 'medium'
        break
      case 3:
        this.quality = 'high'
        break
    }
  },
  checkGPU: function (renderer: WebGLRenderer) {
    const classRef = window['WebGL2RenderingContext']
    const isWebGL2 = classRef && renderer.getContext() instanceof classRef
    const gl = renderer.getContext()

    this.gpu.FLOAT_TEXTURES = !!renderer.capabilities.floatFragmentTextures
    this.gpu.HALF_FLOAT_TEXTURES = isWebGL2 || !!gl.getExtension('OES_texture_half_float')
    this.gpu.FLOAT_TEX_LINEAR = !!gl.getExtension('OES_texture_float_linear')
    this.gpu.HALF_FLOAT_TEX_LINEAR = !!gl.getExtension('OES_texture_half_float_linear')

    if (!isWebGL2) {
      this.gpu.HALF_FLOAT_TEXTURES = this.gpu.HALF_FLOAT_TEXTURES && tryHalfFloat(renderer)
    }

    this.gpu.FLOAT_FBO = testFBO(renderer, FloatType)
    this.gpu.HALF_FLOAT_FBO = testFBO(renderer, HalfFloatType)
    this.gpu.shaderTextureLOD = isWebGL2 || !!gl.getExtension('EXT_shader_texture_lod')
  }
}
