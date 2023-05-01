// Libs
import {
  BrightnessContrastEffect,
  DepthOfFieldEffect,
  Effect,
  EffectPass,
  EffectComposer,
  HueSaturationEffect,
  RenderPass,
  SelectiveBloomEffect,
  SMAAEffect,
  TextureEffect,
  VignetteEffect,
  Pass,
  ShaderPass,
  CopyMaterial,
  DepthCopyPass,
  DepthDownsamplingPass,
  DepthPass,
  DepthPickingPass,
  GaussianBlurPass,
  KawaseBlurPass,
  LuminancePass,
  MaskPass,
  NormalPass,
  AdaptiveLuminancePass,
  BoxBlurPass,
  ClearMaskPass,
  BloomEffect,
  ChromaticAberrationEffect,
  ColorAverageEffect,
  ColorDepthEffect,
  DepthEffect,
  DotScreenEffect,
  FXAAEffect,
  GlitchEffect,
  GridEffect,
  LUT1DEffect,
  NoiseEffect,
  OutlineEffect,
  PixelationEffect,
  SSAOEffect,
  ScanlineEffect,
  SepiaEffect,
  TiltShiftEffect,
  ToneMappingEffect,
  ClearPass,
  CopyPass,
  LambdaPass,
} from 'postprocessing'
import { Camera, HalfFloatType, RepeatWrapping, Scene, Texture, WebGLRenderTarget } from 'three'
// Models
import { Events, IS_DEV, threeDispatcher } from '@/models/constants'
import webgl from '@/models/webgl'
import { BlendOptions } from '@/types'
// Utils
import { debugButton, debugFolder, debugImage, debugInput, debugOptions } from '../utils/debug'
import { mapToObj } from '@/utils/dom'

export type PostEffects =
  | 'Bloom'
  | 'BrightnessContrast'
  | 'ChromaticAberration'
  | 'ColorAverage'
  | 'ColorDepth'
  | 'Depth'
  | 'DepthOfField'
  | 'DotScreen'
  | 'FXAA'
  | 'Glitch'
  | 'Grid'
  | 'HueSaturation'
  | 'LUT'
  | 'Noise'
  | 'Outline'
  | 'Pixelation'
  | 'SMAA'
  | 'SSAO'
  | 'Scanline'
  | 'SelectiveBloom'
  | 'Sepia'
  | 'Texture'
  | 'TiltShift'
  | 'ToneMapping'
  | 'Vignette'

export type PostPasses =
  | 'AdaptiveLuminance'
  | 'BoxBlur'
  | 'ClearMask'
  | 'Copy'
  | 'DepthCopy'
  | 'DepthDownsampling'
  | 'Depth'
  | 'DepthPicking'
  | 'GaussianBlur'
  | 'KawaseBlur'
  | 'Luminance'
  | 'Mask'
  | 'Normal'
  | 'Render'
  | 'Shader'
  | 'TiltShiftBlur'

const emptyRT = new WebGLRenderTarget(1, 1, {
  depthBuffer: false,
  stencilBuffer: false,
  generateMipmaps: false,
})
emptyRT.texture.name = 'emptyRT'

class CustomEffectPass extends EffectPass {
  addEffect(effect: Effect, index?: number) {
    // @ts-ignore
    const effects = [...this.effects]
    if (index !== undefined) {
      effects.splice(index, 0, effect)
    } else {
      effects.push(effect)
    }
    this.setEffects(effects)
  }

  removeEffect(effect: Effect | string) {
    // @ts-ignore
    const effects = [...this.effects]
    const total = effects.length
    if (typeof effect === 'string') {
      for (let i = 0; i < total; i++) {
        const current = effects[i]
        if (current.name === effect) {
          effects.splice(i, 1)
          this.setEffects(effects)
          return
        }
      }
    } else {
      for (let i = 0; i < total; i++) {
        const current = effects[i]
        if (current === effect) {
          effects.splice(i, 1)
          this.setEffects(effects)
          return
        }
      }
    }
  }

  getEffects(): Effect[] {
    // @ts-ignore
    return this.effects
  }
}

export default class PostController {
  scene: Scene
  camera: Camera
  enabled = true
  composer: EffectComposer
  passes: Map<string, Pass> = new Map()
  effects: Map<string, Effect> = new Map()
  renderPass: RenderPass

  protected debugFolder?: any = undefined

  constructor(scene: Scene, camera: Camera) {
    this.scene = scene
    this.camera = camera

    this.composer = new EffectComposer(webgl.renderer, {
      frameBufferType: HalfFloatType,
    })
    this.composer.autoRenderToScreen = false

    this.renderPass = new RenderPass(this.scene, this.camera)
    this.addPass('Render', this.renderPass)
    // this.addPostPass('Copy')

    if (IS_DEV) {
      this.debugFolder = debugFolder('Post')
      debugButton(this.debugFolder, 'Passes', () => {
        console.log(this.composer.passes)
      })
      debugButton(this.debugFolder, 'Export', this.export)
      debugButton(this.debugFolder, 'Prune', this.prune)
    }
  }

  dispose() {
    this.effects.forEach((value: Effect) => {
      value.dispose()
    })
    this.passes.forEach((value: Pass) => {
      value.dispose()
    })
    this.effects.clear()
    this.passes.clear()
    this.composer.dispose()
  }

  render(delta: number, renderTarget: WebGLRenderTarget | null): void {
    if (this.enabled) {
      this.composer.outputBuffer = renderTarget!
      this.composer.render(delta)
    } else {
      webgl.renderer.setRenderTarget(renderTarget)
      webgl.renderer.setClearAlpha(0)
      webgl.renderer.clear()
      webgl.renderer.render(this.scene, this.camera)
    }
  }

  resize(width: number, height: number) {
    this.composer.setSize(width, height)
  }

  updateCamera(camera: Camera): void {
    this.camera = camera
    if (this.composer.passes.length > 0) {
      this.composer.passes[0].mainCamera = camera
    }
    this.effects.forEach((value: Effect) => {
      value.mainCamera = camera
    })
    this.passes.forEach((value: Pass) => {
      value.mainCamera = camera
    })
  }

  prune = () => {
    console.log(this.composer.passes)
    console.log(this.passes)
    console.log(this.effects)
    for (let i = 1; i < this.composer.passes.length; i++) {
      const prev = this.composer.passes[i - 1]
      const pass = this.composer.passes[i]
      if (prev instanceof CustomEffectPass && pass instanceof CustomEffectPass) {
        // @ts-ignore
        const effects = prev.effects.concat(pass.effects)
        console.log('> Combine passes:', effects)
        // const _prev = prev as EffectPass
        // _prev.pa
        // const effects = prev.pas
      }
    }
  }

  export = (): any => {
    const passesInfo: Array<any> = []
    this.composer.passes.forEach((pass: Pass) => {
      let type = 'Pass'
      let data = undefined
      if (pass instanceof AdaptiveLuminancePass) {
        type = 'AdaptiveLuminancePass'
      } else if (pass instanceof BoxBlurPass) {
        type = 'BoxBlurPass'
      } else if (pass instanceof ClearMaskPass) {
        type = 'ClearMaskPass'
      } else if (pass instanceof ClearPass) {
        type = 'ClearPass'
      } else if (pass instanceof CopyPass) {
        type = 'CopyPass'
      } else if (pass instanceof DepthCopyPass) {
        type = 'DepthCopyPass'
      } else if (pass instanceof DepthDownsamplingPass) {
        type = 'DepthDownsamplingPass'
      } else if (pass instanceof DepthPass) {
        type = 'DepthPass'
      } else if (pass instanceof DepthPickingPass) {
        type = 'DepthPickingPass'
      } else if (pass instanceof GaussianBlurPass) {
        type = 'GaussianBlurPass'
      } else if (pass instanceof KawaseBlurPass) {
        type = 'KawaseBlurPass'
      } else if (pass instanceof LambdaPass) {
        type = 'LambdaPass'
      } else if (pass instanceof LuminancePass) {
        type = 'LuminancePass'
      } else if (pass instanceof MaskPass) {
        type = 'MaskPass'
      } else if (pass instanceof NormalPass) {
        type = 'NormalPass'
      } else if (pass instanceof RenderPass) {
        type = 'RenderPass'
      } else if (pass instanceof ShaderPass) {
        type = 'ShaderPass'
        data = pass.fullscreenMaterial.toJSON()
      } else if (pass instanceof CustomEffectPass) {
        type = 'EffectPass'
        const passes = pass.getEffects()
        data = []
        passes.forEach((effect: Effect) => {
          data.push({
            blendMode: effect.blendMode.blendFunction,
            name: effect.name,
            defines: mapToObj(effect.defines),
            uniforms: mapToObj(effect.uniforms),
          })
        })
      }
      passesInfo.push({
        name: pass.name,
        type: type,
        data: data,
      })
    })
    return {
      enabled: this.enabled,
      passes: passesInfo,
    }
  }

  get passList(): string[] {
    const passes: string[] = []
    this.passes.forEach((value: Pass) => {
      passes.push(value.name)
    })
    return passes
  }

  //////////////////////////////////////////////////
  // Passes

  addEffect(name: string, ...effects: Effect[]) {
    if (Array.isArray(effects)) {
      effects.forEach((effect: Effect) => {
        this.effects.set(effect.name, effect)
        if (IS_DEV) this.debugEffect(effect)
      })
    } else {
      // @ts-ignore
      effects.name = name
      this.effects.set(name, effects)
      if (IS_DEV) this.debugEffect(effects)
    }

    // TODO: Merge EffectPasses
    /*
    const lastPass = this.composer.passes[this.composer.passes.length - 1]
    if (lastPass instanceof EffectPass) {
      // combine effects
      const efxPass = lastPass as EffectPass
      let name = efxPass.name
      this.passes.delete(name)
      if (Array.isArray(effects)) {
        effects.forEach((value: Effect) => {
          name += `_${value.name}`
        })
      } else {
        // @ts-ignore
        name += `_${effects.name}`
      }
      name = name.replaceAll('Effect', '')
      efxPass.name = name
      // @ts-ignore
      efxPass.setEffects(efxPass.effects.concat(effects))
      this.passes.set(name, efxPass)
      threeDispatcher.dispatchEvent({ type: Events.UPDATE_POST })
    } else {
      */
    this.addPass(name, new CustomEffectPass(this.camera, ...effects))
    // }
  }

  addPass(name: string, pass: Pass, index?: number | undefined) {
    if (this.passes.get(name) !== undefined) return // already added
    pass.name = name
    this.passes.set(name, pass)
    this.composer.addPass(pass, index)
    threeDispatcher.dispatchEvent({ type: Events.UPDATE_POST })
  }

  addPostEffect(type: PostEffects, params?: any | undefined) {
    let effect = undefined
    switch (type) {
      case 'Bloom':
        effect = new BloomEffect(params)
        break
      case 'BrightnessContrast':
        effect = new BrightnessContrastEffect(params)
        break
      case 'ChromaticAberration':
        effect = new ChromaticAberrationEffect(params)
        break
      case 'ColorAverage':
        effect = new ColorAverageEffect()
        break
      case 'ColorDepth':
        effect = new ColorDepthEffect(params)
        break
      case 'Depth':
        effect = new DepthEffect(params)
        break
      case 'DepthOfField':
        effect = new DepthOfFieldEffect(this.camera, params)
        break
      case 'DotScreen':
        effect = new DotScreenEffect(params)
        break
      case 'FXAA':
        effect = new FXAAEffect(params)
        break
      case 'Glitch':
        effect = new GlitchEffect(params)
        break
      case 'Grid':
        effect = new GridEffect(params)
        break
      case 'HueSaturation':
        effect = new HueSaturationEffect(params)
        break
      case 'LUT':
        effect = new LUT1DEffect(emptyRT.texture, params)
        break
      case 'Noise':
        effect = new NoiseEffect(params)
        break
      case 'Outline':
        effect = new OutlineEffect(this.scene, this.camera, params)
        break
      case 'Pixelation':
        effect = new PixelationEffect()
        break
      case 'SMAA':
        effect = new SMAAEffect(params)
        break
      case 'SSAO':
        effect = new SSAOEffect(this.camera, emptyRT.texture, params)
        break
      case 'Scanline':
        effect = new ScanlineEffect(params)
        break
      case 'SelectiveBloom':
        effect = new SelectiveBloomEffect(this.scene, this.camera)
        break
      case 'Sepia':
        effect = new SepiaEffect(params)
        break
      case 'Texture':
        effect = new TextureEffect({ ...params, texture: emptyRT.texture })
        break
      case 'TiltShift':
        effect = new TiltShiftEffect(params)
        break
      case 'ToneMapping':
        effect = new ToneMappingEffect(params)
        break
      case 'Vignette':
        effect = new VignetteEffect(params)
        break
    }

    if (effect !== undefined) {
      this.addEffect(type, effect)
    }
  }

  addPostPass(type: PostPasses, params?: any | undefined) {
    let pass = undefined
    switch (type) {
      case 'AdaptiveLuminance':
        pass = new AdaptiveLuminancePass(emptyRT.texture, params)
        break
      case 'BoxBlur':
        pass = new BoxBlurPass(params)
        break
      case 'ClearMask':
        pass = new ClearMaskPass()
        break
      case 'Copy':
        pass = new ShaderPass(new CopyMaterial())
        break
      case 'DepthCopy':
        pass = new DepthCopyPass(params)
        break
      case 'DepthDownsampling':
        pass = new DepthDownsamplingPass(params)
        break
      case 'Depth':
        pass = new DepthPass(this.scene, this.camera, params)
        break
      case 'DepthPicking':
        pass = new DepthPickingPass(params)
        break
      case 'GaussianBlur':
        pass = new GaussianBlurPass(params)
        break
      case 'KawaseBlur':
        pass = new KawaseBlurPass(params)
        break
      case 'Luminance':
        pass = new LuminancePass(params)
        break
      case 'Mask':
        pass = new MaskPass(this.scene, this.camera)
        break
      case 'Normal':
        pass = new NormalPass(this.scene, this.camera, params)
        break
      case 'Render':
        pass = new RenderPass(this.scene, this.camera)
        break
      case 'Shader':
        pass = new ShaderPass(params)
        break
    }

    if (pass !== undefined) {
      this.addPass(type, pass)
    }
  }

  removeEffect(effect: Effect) {
    const pass = this.passes.get(effect.name)
    if (pass !== undefined) {
      this.composer.removePass(pass)
    } else {
      const totalPasses = this.composer.passes.length
      for (let i = 0; i < totalPasses; i++) {
        const pass = this.composer.passes[i]
        if (pass instanceof CustomEffectPass) {
          if (effect.name.search(pass.name) > -1) {
            this.composer.removePass(pass)
            this.passes.delete(pass.name)
            break
          }
        }
      }
    }
    this.effects.delete(effect.name)
    this.passes.delete(effect.name)
    effect.dispose()
    threeDispatcher.dispatchEvent({ type: Events.UPDATE_POST })
  }

  //////////////////////////////////////////////////
  // Debug

  debugEffect(effect: Effect) {
    const HPI = Math.PI / 2
    const folder = debugFolder(effect.name, this.debugFolder)
    debugButton(folder, 'Delete', () => {
      this.removeEffect(effect)
      folder.dispose()
    })
    debugInput(folder, effect.blendMode.opacity, 'value', { min: 0, max: 1, label: 'Blend Opacity' })
    debugOptions(
      folder,
      'Blend Mode',
      BlendOptions,
      (value: any) => {
        effect.blendMode.blendFunction = value
      },
      effect.blendMode.blendFunction,
    )
    if (effect instanceof BloomEffect) {
      //
    } else if (effect instanceof BrightnessContrastEffect) {
      const fx = effect as BrightnessContrastEffect
      debugInput(folder, fx, 'brightness', { min: -1, max: 1 })
      debugInput(folder, fx, 'contrast', { min: -1, max: 1 })
    } else if (effect instanceof ChromaticAberrationEffect) {
      const fx = effect as ChromaticAberrationEffect
      debugInput(folder, fx, 'offset')
      debugInput(folder, fx, 'modulationOffset', { min: 0, max: 1 })
      debugInput(folder, fx, 'radialModulation')
    } else if (effect instanceof ColorAverageEffect) {
      folder.dispose()
    } else if (effect instanceof ColorDepthEffect) {
      const fx = effect as ColorDepthEffect
      debugInput(folder, fx, 'bits', { min: 1, max: 128, step: 1 })
    } else if (effect instanceof DepthEffect) {
      const fx = effect as DepthEffect
      debugInput(folder, fx, 'inverted')
    } else if (effect instanceof DepthOfFieldEffect) {
      const fx = effect as DepthOfFieldEffect
      debugInput(folder, fx, 'bokehScale', { min: 0, max: 50 })
      debugInput(folder, fx, 'focusDistance')
      debugInput(folder, fx, 'focusRange')
      debugInput(folder, fx, 'resolutionScale', { min: 0, max: 1 })
    } else if (effect instanceof DotScreenEffect) {
      const fx = effect as DotScreenEffect
      debugInput(folder, fx, 'angle', { min: -HPI, max: HPI })
      debugInput(folder, fx, 'scale', { min: 0, max: 10 })
    } else if (effect instanceof FXAAEffect) {
      folder.dispose()
    } else if (effect instanceof GlitchEffect) {
      //
    } else if (effect instanceof GridEffect) {
      const fx = effect as GridEffect
      debugInput(folder, fx, 'lineWidth', { min: 0, max: 10 })
      debugInput(folder, fx, 'scale', { min: 0, max: 10 })
    } else if (effect instanceof HueSaturationEffect) {
      const fx = effect as HueSaturationEffect
      debugInput(folder, fx, 'hue', { min: 0, max: Math.PI })
      debugInput(folder, fx, 'saturation', { min: -1, max: 1 })
    } else if (effect instanceof LUT1DEffect) {
      const fx = effect as LUT1DEffect
      debugImage(folder, 'Texture', {
        texture: true,
        onChange: (texture: Texture) => {
          // @ts-ignore
          fx.lut = texture
        },
      })
    } else if (effect instanceof NoiseEffect) {
      //
    } else if (effect instanceof OutlineEffect) {
      const fx = effect as OutlineEffect
      debugInput(folder, fx, 'edgeStrength', { min: 0, max: 1 })
    } else if (effect instanceof PixelationEffect) {
      const fx = effect as PixelationEffect
      debugInput(folder, fx, 'granularity', { min: 1, max: 100, step: 1 })
    } else if (effect instanceof SMAAEffect) {
      folder.dispose()
    } else if (effect instanceof SSAOEffect) {
      //
    } else if (effect instanceof ScanlineEffect) {
      const fx = effect as ScanlineEffect
      debugInput(folder, fx, 'density', { min: 0, max: 5 })
      debugInput(folder, fx, 'scrollSpeed', { min: 0, max: 1 })
    } else if (effect instanceof SelectiveBloomEffect) {
      const fx = effect as SelectiveBloomEffect
      debugInput(folder, fx, 'intensity', { min: 0, max: 3 })
      debugInput(folder, fx.luminanceMaterial, 'smoothing', { min: 0, max: 1 })
      debugInput(folder, fx.luminanceMaterial, 'threshold', { min: 0, max: 1 })
    } else if (effect instanceof SepiaEffect) {
      folder.dispose()
    } else if (effect instanceof TextureEffect) {
      const fx = effect as TextureEffect
      debugImage(folder, 'Texture', {
        texture: true,
        onChange: (value: Texture) => {
          value.wrapS = RepeatWrapping
          value.wrapT = RepeatWrapping
          value.needsUpdate = true
          fx.texture = value
        },
      })
    } else if (effect instanceof TiltShiftEffect) {
      const fx = effect as TiltShiftEffect
      debugInput(folder, fx, 'feather', { min: 0, max: 1 })
      debugInput(folder, fx, 'focusArea', { min: 0, max: 1 })
      debugInput(folder, fx, 'offset', { min: -1, max: 1 })
      debugInput(folder, fx, 'rotation', { min: -HPI, max: HPI })
      debugInput(folder, fx, 'resolutionScale', { min: 0, max: 1 })
    } else if (effect instanceof ToneMappingEffect) {
      //
    } else if (effect instanceof VignetteEffect) {
      const fx = effect as VignetteEffect
      debugInput(folder, fx, 'darkness', { min: 0, max: 1 })
      debugInput(folder, fx, 'offset', { min: 0, max: 1 })
    }
  }

  debugPass(pass: Pass) {
    // const folder = debugFolder(pass.name, this.debugFolder)
    // if (pass instanceof GaussianBlurPass) {
    // } else {
    //   folder.dispose()
    // }
  }
}
