// Libs
import {
  ACESFilmicToneMapping,
  AddEquation,
  BackSide,
  Camera,
  CineonToneMapping,
  ClampToEdgeWrapping,
  Color,
  CustomBlending,
  DirectionalLight,
  DirectionalLightHelper,
  DoubleSide,
  DstColorFactor,
  FrontSide,
  HemisphereLight,
  Light,
  Line,
  LinearToneMapping,
  Material,
  Mesh,
  MirroredRepeatWrapping,
  NormalBlending,
  NoToneMapping,
  OneFactor,
  OneMinusDstColorFactor,
  OneMinusSrcAlphaFactor,
  OrthographicCamera,
  PerspectiveCamera,
  PointLight,
  PointLightHelper,
  RawShaderMaterial,
  RectAreaLight,
  ReinhardToneMapping,
  RepeatWrapping,
  ShaderMaterial,
  SpotLight,
  SpotLightHelper,
  SrcAlphaFactor,
  Texture,
  Vector2,
  Vector3,
} from 'three'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import { Pane } from 'tweakpane'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'
// @ts-ignore
import * as TweakpaneImagePlugin from 'tweakpane-image-plugin'
// Models
import { Events, threeDispatcher } from '../models/constants'
import { settings } from '../models/settings'
import webgl from '../models/webgl'
// Views
import DebugMaterial from '../materials/utils/DebugMaterial'
// Utils
import { clamp } from './math'
import Transformer from '../tools/Transformer'

let gui: Pane
let tabs: any
let stats: any // performance
let canvas: HTMLCanvasElement
let context: CanvasRenderingContext2D
export let appTab: any
export let scenesTab: any
export let systemTab: any
export let toolsTab: any
const timers: Array<any> = []

//////////////////////////////////////////////////
//

export function initDebug() {
  gui = new Pane()
  gui.registerPlugin(EssentialsPlugin)
  gui.registerPlugin(TweakpaneImagePlugin)

  const guiElement = gui.element.parentElement as HTMLElement
  guiElement.style.right = '130px'
  guiElement.style.top = '12px'
  guiElement.style.width = '300px'

  // @ts-ignore
  const container = gui.addFolder({ title: 'GUI', expanded: false })
  tabs = container.addTab({
    pages: [{ title: 'App' }, { title: 'Scenes' }, { title: 'System' }, { title: 'Tools' }],
  })

  // Tabs
  appTab = tabs.pages[0]
  scenesTab = tabs.pages[1]
  systemTab = tabs.pages[2]
  toolsTab = tabs.pages[3]

  stats = systemTab.addBlade({
    view: 'fpsgraph',
  })

  // Required to draw images (ImageBitmap, etc)
  canvas = document.createElement('canvas')
  context = canvas.getContext('2d')!
}

export function debugWebGL() {
  // Performance
  const performanceFolder = debugFolder('Performance', systemTab)
  const speed = 250
  debugMonitor(performanceFolder, webgl.renderer.info.render, 'calls', {
    interval: speed,
    label: 'DrawCalls',
  })
  debugMonitor(performanceFolder, webgl.renderer.info.render, 'lines', {
    interval: speed,
    label: 'Lines',
  })
  debugMonitor(performanceFolder, webgl.renderer.info.render, 'points', {
    interval: speed,
    label: 'Points',
  })
  debugMonitor(performanceFolder, webgl.renderer.info.render, 'triangles', {
    interval: speed,
    label: 'Tris',
  })
  debugMonitor(performanceFolder, webgl.renderer.info.memory, 'geometries', {
    interval: speed,
    label: 'Geom',
  })
  debugMonitor(performanceFolder, webgl.renderer.info.memory, 'textures', {
    interval: speed,
    label: 'Textures',
  })
  debugMonitor(performanceFolder, webgl.renderer.info.programs, 'length', {
    interval: speed,
    label: 'Programs',
  })

  // Renderer
  const folder = debugFolder('Renderer', systemTab)
  debugInput(folder, webgl.renderer, 'physicallyCorrectLights', { label: 'Physical Lights' })
  const toneOptions = [NoToneMapping, LinearToneMapping, ReinhardToneMapping, CineonToneMapping, ACESFilmicToneMapping]
  debugOptions(
    folder,
    'Tone Mapping',
    [
      {
        text: 'None',
        value: 0,
      },
      {
        text: 'Linear',
        value: 1,
      },
      {
        text: 'Reinhard',
        value: 2,
      },
      {
        text: 'Cineon',
        value: 3,
      },
      {
        text: 'ACES Filmic',
        value: 4,
      },
    ],
    (result: number) => {
      webgl.renderer.toneMapping = toneOptions[result]
    },
  )
  debugInput(folder, webgl.renderer, 'toneMappingExposure', {
    min: 0,
    max: 10,
  })
}

export function startDebug() {
  stats.begin()
}

export function endDebug() {
  stats.end()
}

export function debugSettings() {
  const gpuFolder = systemTab.addFolder({ title: 'GPU', expanded: false })
  gpuFolder.addInput(settings.gpu, 'FLOAT_TEXTURES', { disabled: true })
  gpuFolder.addInput(settings.gpu, 'HALF_FLOAT_TEXTURES', { disabled: true })
  gpuFolder.addInput(settings.gpu, 'FLOAT_TEX_LINEAR', { disabled: true })
  gpuFolder.addInput(settings.gpu, 'HALF_FLOAT_TEX_LINEAR', { disabled: true })
  gpuFolder.addInput(settings.gpu, 'FLOAT_FBO', { disabled: true })
  gpuFolder.addInput(settings.gpu, 'HALF_FLOAT_FBO', { disabled: true })
  gpuFolder.addInput(settings.gpu, 'shaderTextureLOD', { disabled: true })

  const settingsFolder = systemTab.addFolder({ title: 'Settings', expanded: false })
  settingsFolder.addInput(settings, 'mobile', { disabled: true })
  settingsFolder.addInput(settings, 'quality', { disabled: true })
}

export function clearAppTab() {
  const total = appTab.children.length - 1
  for (let i = total; i > -1; i--) {
    appTab.children[i].dispose()
  }
}

//////////////////////////////////////////////////
// Debug Types

export const debugFolder = (name: string, parentFolder?: any, params?: any): any => {
  const usedGUI = parentFolder !== undefined ? parentFolder : appTab
  const folder = usedGUI.addFolder({
    title: name,
    expanded: false,
    ...params,
  })
  return folder
}

export const debugFile = (parentFolder: any, label: string, onLoad: (result: any, file: File) => void): any => {
  debugButton(parentFolder !== undefined ? parentFolder : appTab, label, () => {
    const fileInput = document.createElement('input')
    // fileInput.accept = type
    fileInput.style.display = 'none'
    fileInput.type = 'file'
    fileInput.name = 'file'
    fileInput.onchange = () => {
      const fileReader = new FileReader()
      // @ts-ignore
      fileReader.onload = () => {
        console.log('file:', fileReader)
        // @ts-ignore
        return onLoad(fileReader.result, fileInput.files[0])
      }
      // @ts-ignore
      fileReader.readAsText(fileInput.files[0])
    }
    document.body.appendChild(fileInput)
    fileInput.click()
    document.body.removeChild(fileInput)
  })
}

export const debugBlade = (parentFolder: any, params: any): any => {
  const pane = parentFolder !== undefined ? parentFolder : appTab
  const added = pane.addBlade(params)
  if (params.onChange !== undefined) {
    // @ts-ignore
    added.on('click', (evt: any) => {
      params.onChange({
        name: evt.cell.title,
        column: evt.index[0],
        row: evt.index[1],
      })
    })
  }
  return added
}

export const debugButton = (parentFolder: any, label: string, callback: () => void, props?: any): any => {
  const pane = parentFolder !== undefined ? parentFolder : appTab
  const btn = pane.addButton({
    title: label,
    ...props,
  })
  btn.on('click', callback)
  return btn
}

export const debugCamera = (parentFolder: any, cam: Camera, helper?: any): any => {
  const folderName = cam.name.length > 0 ? cam.name : 'Camera'
  const cameraFolder = debugFolder(folderName, parentFolder)
  debugInput(cameraFolder, cam, 'type')
  if (cam instanceof PerspectiveCamera) {
    const camera = cam as PerspectiveCamera
    debugInput(cameraFolder, camera, 'near', {
      min: 0,
      max: 100,
      step: 0.001,
      onChange: (value: number) => {
        camera.near = value
        camera.updateProjectionMatrix()
        helper?.update()
      },
    })
    debugInput(cameraFolder, camera, 'far', {
      min: 0,
      max: 10000,
      step: 0.01,
      onChange: (value: number) => {
        camera.far = value
        camera.updateProjectionMatrix()
        helper?.update()
      },
    })
    debugInput(cameraFolder, camera, 'filmOffset', {
      min: -100,
      max: 100,
      step: 0.01,
      onChange: (value: number) => {
        camera.filmOffset = value
        camera.updateProjectionMatrix()
        helper?.update()
      },
    })
    debugInput(cameraFolder, camera, 'focus', {
      min: 0,
      max: 100,
      step: 0.01,
      onChange: (value: number) => {
        camera.focus = value
        camera.updateProjectionMatrix()
      },
    })
    debugInput(cameraFolder, camera, 'fov', {
      min: 0,
      max: 120,
      step: 0.01,
      onChange: (value: number) => {
        camera.fov = value
        camera.updateProjectionMatrix()
        helper?.update()
      },
    })
    debugInput(cameraFolder, camera, 'zoom', {
      min: 0,
      max: 2000,
      step: 0.01,
      onChange: (value: number) => {
        camera.zoom = value
        camera.updateProjectionMatrix()
        helper?.update()
      },
    })
  } else if (cam instanceof OrthographicCamera) {
    const camera = cam as OrthographicCamera
    debugInput(cameraFolder, camera, 'near', {
      min: 0,
      max: 10000,
      step: 0.01,
      onChange: (value: number) => {
        camera.near = value
        camera.updateProjectionMatrix()
        helper?.update()
      },
    })
    debugInput(cameraFolder, camera, 'far', {
      min: 0,
      max: 10000,
      step: 0.01,
      onChange: (value: number) => {
        camera.far = value
        camera.updateProjectionMatrix()
        helper?.update()
      },
    })
    debugInput(cameraFolder, camera, 'zoom', {
      min: 0,
      max: 2000,
      step: 0.01,
      onChange: (value: number) => {
        camera.zoom = value
        camera.updateProjectionMatrix()
        helper?.update()
      },
    })
    debugInput(cameraFolder, camera, 'left', {
      min: -window.innerWidth,
      max: 0,
      step: 0.01,
      onChange: (value: number) => {
        camera.left = value
        camera.updateProjectionMatrix()
        helper?.update()
      },
    })
    debugInput(cameraFolder, camera, 'right', {
      min: 0,
      max: window.innerWidth,
      step: 0.01,
      onChange: (value: number) => {
        camera.right = value
        camera.updateProjectionMatrix()
        helper?.update()
      },
    })
    debugInput(cameraFolder, camera, 'top', {
      min: 0,
      max: window.innerHeight,
      step: 0.01,
      onChange: (value: number) => {
        camera.top = value
        camera.updateProjectionMatrix()
        helper?.update()
      },
    })
    debugInput(cameraFolder, camera, 'bottom', {
      min: -window.innerHeight,
      max: 0,
      step: 0.01,
      onChange: (value: number) => {
        camera.bottom = value
        camera.updateProjectionMatrix()
        helper?.update()
      },
    })
  }
  const posInput = debugInput(cameraFolder, cam, 'position')
  const rotInput = debugInput(cameraFolder, cam, 'rotation')
  const timer = setInterval(() => {
    if (posInput !== undefined) {
      // @ts-ignore
      posInput.refresh()
      // @ts-ignore
      rotInput.refresh()
    } else {
      // Remove from list
      for (let i = 0; i < timers.length; i++) {
        if (timers[i] === timer) {
          timers.splice(i, 1)
          break
        }
      }
      clearInterval(timer)
    }
  }, 250)
  timers.push(timer)
}

export const debugColor = (parentFolder: any, obj: any, value: string, props?: any): any => {
  const pane = parentFolder !== undefined ? parentFolder : appTab
  let object = obj
  let key = value
  const threeColor = obj[value]['isColor'] === true
  if (threeColor) {
    const settings = {
      color: {
        r: clampColor(obj[value]['r'] * 255),
        g: clampColor(obj[value]['g'] * 255),
        b: clampColor(obj[value]['b'] * 255),
      },
    }
    object = settings
    key = 'color'
  }
  const label = props !== undefined && props['label'] ? props['label'] : value
  const added = pane.addInput(object, key, { label })
  added.on('change', (evt: any) => {
    if (threeColor) {
      obj[value].setRGB(evt.value.r / 255, evt.value.g / 255, evt.value.b / 255)
    }
    if (props !== undefined && props['onChange'] !== undefined) {
      props['onChange'](evt.value)
    }
  })

  return added
}

export const debugImage = (parentFolder: any, label: string, props: any): any => {
  const pane = parentFolder !== undefined ? parentFolder : appTab
  const hasImage = props.image !== undefined
  const params = {}
  let type = 'placeholder'
  if (hasImage) {
    type = 'image'
    // @ts-ignore
    params['image'] = props.image
  } else if (props.url !== undefined) {
    type = 'url'
    // @ts-ignore
    params['url'] = props.url
  } else {
    // @ts-ignore
    params['placeholder'] = 'placeholder'
  }
  // @ts-ignore
  const added = pane.addInput(params, type, {
    view: 'input-image',
    label: label,
    ...props,
  })
  if (props !== undefined && props.onChange !== undefined) {
    let changed = false
    let texture = null
    const isTexture = props.texture !== undefined
    added.on('change', (evt: any) => {
      if (changed) {
        if (isTexture) {
          texture = new Texture(evt.value)
          texture.wrapS = RepeatWrapping
          texture.wrapT = RepeatWrapping
          texture.needsUpdate = true
          // TODO: Assign original filename somehow
          // @ts-ignore
          texture.userData = { url: evt.value.src }
          props.onChange(texture)
        } else {
          props.onChange(evt.value)
        }
      }
      changed = true
    })
  }
  return added
}

export const debugInput = (parentFolder: any, obj: any, value: string, props?: any): any => {
  const pane = parentFolder !== undefined ? parentFolder : appTab
  const properties = {}
  if (props !== undefined) {
    // @ts-ignore
    if (props.label !== undefined) properties['label'] = props.label
    if (props.min !== undefined) {
      // @ts-ignore
      properties['min'] = props.min
      // @ts-ignore
      properties['max'] = props.max
      // @ts-ignore
      if (props.step !== undefined) properties['step'] = props.step
    }
    // @ts-ignore
    if (props.x !== undefined) properties['x'] = props.x
    // @ts-ignore
    if (props.y !== undefined) properties['y'] = props.y
    // @ts-ignore
    if (props.z !== undefined) properties['z'] = props.z
    // @ts-ignore
    if (props.w !== undefined) properties['w'] = props.w
    // @ts-ignore
    if (props.disabled !== undefined) properties['disabled'] = props.disabled
  }
  try {
    const added = pane.addInput(obj, value, properties)
    if (props !== undefined && props.onChange !== undefined) {
      added.on('change', (evt: any) => {
        if (props.onChange) props.onChange(evt.value)
      })
    }

    return added
  } catch {
    console.log('> debugInput error:', obj, value)
    return null
  }
}

export const debugLerp = (parentFolder: any, label: string, callback: (progress: number) => void, props?: any): any => {
  const pane = parentFolder !== undefined ? parentFolder : appTab
  const progress = { value: 0 }
  return debugInput(pane, progress, 'value', {
    min: 0,
    max: 1,
    onChange: (value: number) => {
      callback(value)
    },
    ...props,
  })
}

export const debugMonitor = (parentFolder: any, obj: any, value: string, props?: any): any => {
  const pane = parentFolder !== undefined ? parentFolder : appTab
  return pane.addMonitor(obj, value, props)
}

export const debugOptions = (
  parentFolder: any,
  label: string,
  options: Array<any> | any,
  callback: (value: any) => void,
  defaultValue?: any,
): any => {
  const pane = parentFolder !== undefined ? parentFolder : appTab
  const value = Array.isArray(options) ? (defaultValue !== undefined ? defaultValue : options[0].value) : ''
  const added = pane.addBlade({
    view: 'list',
    label: label,
    options,
    value,
  })
  // @ts-ignore
  added.on('change', (evt: any) => {
    callback(evt.value)
  })
  return added
}

export const debugToggle = (
  parentFolder: any,
  label: string,
  defaultValue: boolean,
  onChange: (value: any) => void,
): any => {
  const pane = parentFolder !== undefined ? parentFolder : appTab
  const params = { value: defaultValue }
  const added = pane.addInput(params, 'value', { label })
  added.on('change', (evt: any) => {
    onChange(evt.value)
  })
  return added
}

export const debugLight = (parentFolder: any, light: Light, props?: any): any => {
  const pane = parentFolder !== undefined ? parentFolder : scenesTab
  const lightFolder = debugFolder(light.name, pane)
  const container = props?.container !== undefined ? props?.container : light.parent
  debugInput(lightFolder, light, 'name', {
    onChange: (value: string) => {
      lightFolder.title = value
      threeDispatcher.dispatchEvent({ type: Events.UPDATE_HIERARCHY })
    },
  })
  debugInput(lightFolder, light, 'type')
  debugColor(lightFolder, light, 'color')
  debugInput(lightFolder, light, 'intensity', {
    min: 0,
    max: 2,
  })
  const lightPos = debugInput(lightFolder, light, 'position')
  if (!(light instanceof DirectionalLight)) {
    debugInput(lightFolder, light, 'rotation')
  }
  debugInput(lightFolder, light, 'visible')
  let helper: any
  let transform: TransformControls | undefined = undefined
  if (light instanceof DirectionalLight) {
    const directionalLight = light as DirectionalLight
    debugInput(lightFolder, directionalLight, 'castShadow')

    helper = new DirectionalLightHelper(directionalLight, 100)
    helper.name = `${light.name}:helper`
    helper.onBeforeRender = () => {
      helper.update()
      helper.lookAt(0, 0, 0)
    }
    helper.visible = false
    container.add(helper)
    debugInput(lightFolder, helper, 'visible', {
      label: 'Show Helper',
      onChange: (value: boolean) => {
        value ? light.parent?.add(helper) : light.parent?.remove(helper)
      },
    })
  } else if (light instanceof HemisphereLight) {
    const hemisphereLight = light as HemisphereLight
    debugColor(lightFolder, hemisphereLight, 'groundColor')
    // helper = new HemisphereLightHelper(hemisphereLight, 1)
    // helper.name = `${light.name}:helper`
    // helper.onBeforeRender = helper.update
    // helper.visible = false
    // debugInput(lightFolder, helper, 'visible', {
    //   label: 'Show Helper',
    //   onChange: (value: boolean) => {
    //     value ? light.parent?.add(helper) : light.parent?.remove(helper)
    //   },
    // })
  } else if (light instanceof PointLight) {
    const pointLight = light as PointLight
    debugInput(lightFolder, pointLight, 'decay', {
      min: 0,
      max: 5,
    })
    debugInput(lightFolder, pointLight, 'distance', {
      min: 0,
      max: 1000,
    })
    helper = new PointLightHelper(pointLight)
    helper.name = `${light.name}:helper`
    helper.onBeforeRender = () => {
      if (pointLight.distance > 0) {
        helper.material.color = pointLight.color
        helper.scale.setScalar(pointLight.distance)
        helper.position.copy(pointLight.position)
        helper.updateMatrix()
        helper.updateWorldMatrix()
      }
    }
    helper.visible = false
    container.add(helper)
    debugInput(lightFolder, helper, 'visible', {
      label: 'Show Helper',
      onChange: (value: boolean) => {
        value ? light.parent?.add(helper) : light.parent?.remove(helper)
      },
    })
  } else if (light instanceof RectAreaLight) {
    const rectAreaLight = light as RectAreaLight
    debugInput(lightFolder, rectAreaLight, 'width', {
      min: 0,
      max: 1000,
    })
    debugInput(lightFolder, rectAreaLight, 'height', {
      min: 0,
      max: 1000,
    })
    RectAreaLightUniformsLib.init()
    helper = new RectAreaLightHelper(rectAreaLight)
    helper.name = `${light.name}:helper`
    helper.visible = false
    container.add(helper)
    debugInput(lightFolder, helper, 'visible', {
      label: 'Show Helper',
      onChange: (value: boolean) => {
        value ? light.parent?.add(helper) : light.parent?.remove(helper)
      },
    })
  } else if (light instanceof SpotLight) {
    const spotLight = light as SpotLight
    debugInput(lightFolder, spotLight, 'angle', {
      min: 0,
      max: Math.PI / 2,
    })
    debugInput(lightFolder, spotLight, 'decay', {
      min: 0,
      max: 5,
    })
    debugInput(lightFolder, spotLight, 'distance', {
      min: 0,
      max: 1000,
    })
    debugInput(lightFolder, spotLight, 'penumbra', {
      min: 0,
      max: 1,
    })
    helper = new SpotLightHelper(spotLight)
    helper.name = `${light.name}:helper`
    helper.onBeforeRender = helper.update
    helper.visible = false
    light.parent?.add(helper)
    transform = Transformer.add(helper.name, lightFolder)
    transform.attach(light)
    transform.addEventListener('change', () => {
      // @ts-ignore
      lightPos.refresh()
    })
    debugInput(lightFolder, helper, 'visible', {
      label: 'Show Helper',
      onChange: (value: boolean) => {
        if (value) {
          // @ts-ignore
          light.parent?.add(helper)
          light.parent?.add(transform!)
        } else {
          // @ts-ignore
          light.parent?.remove(helper)
          light.parent?.remove(transform!)
        }
      },
    })
  }
  debugButton(lightFolder, 'Delete', () => {
    light.parent?.remove(light)
    lightFolder.dispose()
    // @ts-ignore
    if (helper !== undefined) Transform.remove(helper.name)
  })
}

export const debugMaterial = (parentFolder: any, mesh: Mesh | Line, props?: any): any => {
  const pane = parentFolder !== undefined ? parentFolder : scenesTab
  const folder = debugFolder('Material', pane)
  const material = mesh.material as Material

  debugOptions(
    folder,
    'Blend Mode',
    [
      {
        text: 'Normal',
        value: 0,
      },
      {
        text: 'Add',
        value: 1,
      },
      {
        text: 'Screen',
        value: 2,
      },
      {
        text: 'Multiply',
        value: 3,
      },
    ],
    (value: number) => {
      switch (value) {
        case 0:
          material.blending = NormalBlending
          material.blendEquation = AddEquation
          material.blendSrc = SrcAlphaFactor
          material.blendDst = OneMinusSrcAlphaFactor
          material.needsUpdate = true
          break
        case 1:
          material.blending = CustomBlending
          material.blendEquation = AddEquation
          material.blendSrc = SrcAlphaFactor
          material.blendDst = OneFactor
          material.needsUpdate = true
          break
        case 2:
          material.blending = CustomBlending
          material.blendEquation = AddEquation
          material.blendSrc = OneMinusDstColorFactor
          material.blendDst = OneFactor
          material.needsUpdate = true
          break
        case 3:
          material.blending = CustomBlending
          material.blendEquation = AddEquation
          material.blendSrc = DstColorFactor
          material.blendDst = OneMinusSrcAlphaFactor
          material.needsUpdate = true
          break
      }
    },
  )
  debugOptions(
    folder,
    'Side',
    [
      {
        text: 'Front',
        value: FrontSide,
      },
      {
        text: 'Back',
        value: BackSide,
      },
      {
        text: 'Double',
        value: DoubleSide,
      },
    ],
    (value: number) => {
      material.side = value
      material.needsUpdate = true
    },
  )

  const propsFolder = debugFolder('Props', folder)
  for (const i in material) {
    // @ts-ignore
    const value = material[i]
    if (i.substring(0, 1) !== '_') {
      if (acceptedMaterialTypes(value) && acceptedMaterialNames(i)) {
        if (
          typeof value === 'boolean' ||
          typeof value === 'number' ||
          value instanceof Vector2 ||
          value instanceof Vector3
        ) {
          const params = { label: i }
          if (typeof value === 'boolean') {
            // @ts-ignore
            params['onChange'] = () => {
              material.needsUpdate = true
            }
          }
          debugInput(propsFolder, material, i, params)
        } else if (value instanceof Color) {
          debugColor(propsFolder, material, i, { label: i })
        } else if (value instanceof Texture || value === null) {
          const textureParams = {
            offset: new Vector2(0, 0),
            repeat: new Vector2(1, 1),
            wrapS: ClampToEdgeWrapping,
            wrapT: ClampToEdgeWrapping,
            flipY: true,
          }
          const imgProps = {
            texture: true,
            onChange: (value: Texture) => {
              value.offset.copy(textureParams.offset)
              value.repeat.copy(textureParams.repeat)
              value.wrapS = textureParams.wrapS
              value.wrapT = textureParams.wrapT
              value.flipY = textureParams.flipY
              value.needsUpdate = true
              // @ts-ignore
              material[i] = value
              // @ts-ignore
              material.needsUpdate = true
            },
          }
          const wrapOptions = [
            {
              text: 'ClampToEdgeWrapping',
              value: ClampToEdgeWrapping,
            },
            {
              text: 'RepeatWrapping',
              value: RepeatWrapping,
            },
            {
              text: 'MirroredRepeatWrapping',
              value: MirroredRepeatWrapping,
            },
          ]
          let defaultWrapS = wrapOptions[0].value
          let defaultWrapT = wrapOptions[0].value
          if (value !== null) {
            defaultWrapS = value.wrapS
            defaultWrapT = value.wrapT
            textureParams.offset.copy(value.offset)
            textureParams.repeat.copy(value.repeat)
            textureParams.wrapS = value.wrapS
            textureParams.wrapT = value.wrapT
            textureParams.flipY = value.flipY
            if (value.source.data !== undefined) {
              // @ts-ignore
              imgProps['url'] = value.source.data.currentSrc
            }
            if (value.source.data instanceof ImageBitmap) {
              const bitmap = value.source.data as ImageBitmap
              canvas.width = bitmap.width
              canvas.height = bitmap.height
              context.drawImage(bitmap, 0, 0)
              const dataURL = canvas.toDataURL()
              // @ts-ignore
              imgProps['url'] = dataURL
            }
          }
          const imgPane = debugImage(propsFolder, i, imgProps)
          debugOptions(
            propsFolder,
            'wrapS',
            wrapOptions,
            (value: number) => {
              textureParams.wrapS = value
              // @ts-ignore
              const texture = material[i] as Texture
              if (texture !== null) {
                texture.wrapS = value
                texture.needsUpdate = true
              }
            },
            defaultWrapS,
          )
          debugOptions(
            propsFolder,
            'wrapT',
            wrapOptions,
            (value: number) => {
              textureParams.wrapT = value
              // @ts-ignore
              const texture = material[i] as Texture
              if (texture !== null) {
                texture.wrapT = value
                texture.needsUpdate = true
              }
            },
            defaultWrapT,
          )
          const repeatParams = {
            x: {
              min: -100,
              max: 100,
            },
            y: {
              min: -100,
              max: 100,
            },
          }
          debugInput(propsFolder, textureParams, 'offset', {
            ...repeatParams,
            onChange: (value: Vector2) => {
              // @ts-ignore
              if (material[i] !== null) {
                // @ts-ignore
                material[i].offset.copy(value)
              }
            },
          })
          debugInput(propsFolder, textureParams, 'repeat', {
            ...repeatParams,
            onChange: (value: Vector2) => {
              // @ts-ignore
              if (material[i] !== null) {
                // @ts-ignore
                material[i].repeat.copy(value)
              }
            },
          })
          debugInput(propsFolder, textureParams, 'flipY', {
            onChange: (value: boolean) => {
              // @ts-ignore
              if (material[i] !== null) {
                // @ts-ignore
                material[i].flipY = value
                // @ts-ignore
                material[i].needsUpdate = true
              }
            },
          })
          debugButton(
            propsFolder,
            'clear',
            () => {
              // @ts-ignore
              imgPane.controller_.valueController.updateImage(emptyImg)
              // @ts-ignore
              material[i] = null
              // @ts-ignore
              material.needsUpdate = true
            },
            { label: i },
          )
        }
      }
    }
  }

  if (material instanceof RawShaderMaterial || material instanceof ShaderMaterial) {
    const uniformsFolder = debugFolder('Uniforms', folder)
    const shader = material as ShaderMaterial
    for (const i in shader.uniforms) {
      const uniform = shader.uniforms[i].value
      if (typeof uniform === 'number') {
        debugInput(uniformsFolder, shader.uniforms[i], 'value', { label: i })
      } else if (uniform === null || uniform instanceof Texture) {
        debugImage(uniformsFolder, i, {
          texture: true,
          onChange: (value: Texture) => {
            // @ts-ignore
            shader.uniforms[i]['value'] = value
          },
        })
      }
    }
  }

  debugButton(folder, 'Update Material', () => {
    // @ts-ignore
    material.needsUpdate = true
  })
  const debugMaterialFolder: any = debugFolder('Debug Material', folder)
  const debugMaterial = new DebugMaterial(material.defines)
  debugMaterial.initDebug(debugMaterialFolder)
  debugToggle(debugMaterialFolder, 'Debug Material', false, (value: any) => {
    if (value) {
      mesh.material = debugMaterial
    } else {
      mesh.material = material
    }
  })
  return folder
}

// Utils

function clampColor(value: number): number {
  return clamp(Math.round(value), 0, 255)
}

export function acceptedMaterialTypes(value: any): boolean {
  return (
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    value instanceof Color ||
    value instanceof Vector2 ||
    value instanceof Vector3 ||
    value instanceof Texture ||
    value === null
  )
}

export function acceptedMaterialNames(name: string): boolean {
  return !(
    name === 'side' ||
    name === 'vertexColors' ||
    name === 'depthFunc' ||
    name === 'colorWrite' ||
    name === 'alphaToCoverage' ||
    name === 'linewidth' ||
    name === 'glslVersion' ||
    name === 'normalMapType' ||
    name === 'premultipliedAlpha' ||
    name === 'shadowSide' ||
    name === 'toneMapped' ||
    name === 'version' ||
    name === 'wireframeLinewidth' ||
    name === 'uniformsNeedUpdate' ||
    name === 'combine' ||
    name === 'precision' ||
    name.slice(0, 5) === 'blend' ||
    name.slice(0, 4) === 'clip' ||
    name.slice(0, 7) === 'polygon' ||
    name.slice(0, 7) === 'stencil' ||
    name.slice(0, 2) === 'is'
  )
}
