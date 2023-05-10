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
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshMatcapMaterial,
  MeshPhongMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
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
import * as TextareaPlugin from '@pangenerator/tweakpane-textarea-plugin'
// Models
import { Events, threeDispatcher } from '@/models/constants'
import { settings } from '@/models/settings'
import webgl from '@/models/webgl'
// Views
import DebugMaterial from '@/materials/utils/DebugMaterial'
// Utils
import { clamp } from './math'
import Transformer from '@/tools/Transformer'
import { fileName } from './dom'
import scenes from '@/controllers/SceneController'
import animation from '@/models/animation'
import { types } from '@theatre/core'
import { setMaterialBlendAdd, setMaterialBlendMultiply, setMaterialBlendNormal, setMaterialBlendScreen } from './three'

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
  gui.registerPlugin(TextareaPlugin)

  const guiElement = gui.element.parentElement as HTMLElement
  guiElement.style.right = settings.mobile ? '12px' : '130px'
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
  debugInput(folder, webgl.renderer, 'useLegacyLights', { label: 'Physical Lights' })
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

export function toggleDebugPanel(value: boolean) {
  // @ts-ignore
  gui.hidden = value
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
    // Animation
    debugOptions(cameraFolder, 'Animate', animation.sheetOptions, (value: any) => {
      animation
        .animateObject(value, camera.name, {
          camera: {
            near: camera.near,
            far: camera.far,
            filmOffset: camera.filmOffset,
            focus: camera.focus,
            fov: camera.fov,
            zoom: camera.zoom,
          },
        })!
        .onValuesChange((values: any) => {
          camera.near = values.camera.near
          camera.far = values.camera.far
          camera.filmOffset = values.camera.filmOffset
          camera.focus = values.camera.focus
          camera.fov = values.camera.fov
          camera.zoom = values.camera.zoom
          camera.updateProjectionMatrix()
        })
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
    // Animation
    debugOptions(cameraFolder, 'Animate', animation.sheetOptions, (value: any) => {
      animation
        .animateObject(value, camera.name, {
          camera: {
            near: camera.near,
            far: camera.far,
            zoom: camera.zoom,
          },
        })!
        .onValuesChange((values: any) => {
          console.log(values)
        })
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
          if (props.url !== undefined) texture.name = fileName(props.url)
          texture.wrapS = RepeatWrapping
          texture.wrapT = RepeatWrapping
          texture.needsUpdate = true
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
    // @ts-ignore
    if (props.view !== undefined) properties['view'] = props.view
    // @ts-ignore
    if (props.lineCount !== undefined) properties['lineCount'] = props.lineCount
    // @ts-ignore
    if (props.placeholder !== undefined) properties['placeholder'] = props.placeholder
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
    console.log('> debugInput error:', value, obj, properties)
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
    label: label,
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

    // Animation
    debugOptions(lightFolder, 'Animate', animation.sheetOptions, (value: any) => {
      animation
        .animateObject(value, light.name, {
          light: {
            color: types.rgba({
              r: light.color.r * 255,
              g: light.color.g * 255,
              b: light.color.b * 255,
              a: 1,
            }),
            intensity: light.intensity,
          },
        })!
        .onValuesChange((values: any) => {
          light.color.copy(values.light.color)
          light.intensity = values.light.intensity
        })
    })

    // Helper
    helper = new DirectionalLightHelper(directionalLight, 100)
    helper.name = `${light.name}:helper`
    helper.onBeforeRender = () => {
      helper.update()
      helper.lookAt(0, 0, 0)
    }
    helper.visible = false
    scenes.currentScene?.utils.add(helper)
    debugInput(lightFolder, helper, 'visible', {
      label: 'Show Helper',
      onChange: (value: boolean) => {
        value ? light.parent?.add(helper) : light.parent?.remove(helper)
      },
    })
  } else if (light instanceof HemisphereLight) {
    const hemisphereLight = light as HemisphereLight
    debugColor(lightFolder, hemisphereLight, 'groundColor')

    // Animation
    debugOptions(lightFolder, 'Animate', animation.sheetOptions, (value: any) => {
      animation
        .animateObject(value, light.name, {
          light: {
            color: types.rgba({
              r: light.color.r * 255,
              g: light.color.g * 255,
              b: light.color.b * 255,
              a: 1,
            }),
            groundColor: types.rgba({
              r: light.groundColor.r * 255,
              g: light.groundColor.g * 255,
              b: light.groundColor.b * 255,
              a: 1,
            }),
            intensity: light.intensity,
          },
        })!
        .onValuesChange((values: any) => {
          light.color.copy(values.light.color)
          light.groundColor.copy(values.light.groundColor)
          light.intensity = values.light.intensity
        })
    })
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

    // Animation
    debugOptions(lightFolder, 'Animate', animation.sheetOptions, (value: any) => {
      animation
        .animateObject(value, light.name, {
          light: {
            color: types.rgba({
              r: light.color.r * 255,
              g: light.color.g * 255,
              b: light.color.b * 255,
              a: 1,
            }),
            intensity: light.intensity,
            decay: light.decay,
            distance: light.distance,
          },
        })!
        .onValuesChange((values: any) => {
          light.color.copy(values.light.color)
          light.intensity = values.light.intensity
          light.decay = values.light.decay
          light.distance = values.light.distance
        })
    })

    // Helper
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
    scenes.currentScene?.utils.add(helper)
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

    // Animation
    debugOptions(lightFolder, 'Animate', animation.sheetOptions, (value: any) => {
      animation
        .animateObject(value, light.name, {
          light: {
            color: types.rgba({
              r: light.color.r * 255,
              g: light.color.g * 255,
              b: light.color.b * 255,
              a: 1,
            }),
            intensity: light.intensity,
            width: light.width,
            height: light.height,
          },
        })!
        .onValuesChange((values: any) => {
          light.color.copy(values.light.color)
          light.intensity = values.light.intensity
          light.width = values.light.width
          light.height = values.light.height
        })
    })

    // Helper
    helper = new RectAreaLightHelper(rectAreaLight)
    helper.name = `${light.name}:helper`
    helper.visible = false
    scenes.currentScene?.utils.add(helper)
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

    // Animation
    debugOptions(lightFolder, 'Animate', animation.sheetOptions, (value: any) => {
      animation
        .animateObject(value, light.name, {
          light: {
            color: types.rgba({
              r: light.color.r * 255,
              g: light.color.g * 255,
              b: light.color.b * 255,
              a: 1,
            }),
            intensity: light.intensity,
            angle: spotLight.angle,
            decay: spotLight.decay,
            distance: spotLight.distance,
            pernumbra: spotLight.penumbra,
          },
        })!
        .onValuesChange((values: any) => {
          light.color.copy(values.light.color)
          light.intensity = values.light.intensity
          spotLight.angle = values.light.angle
          spotLight.decay = values.light.decay
          spotLight.distance = values.light.distance
          spotLight.penumbra = values.light.pernumbra
        })
    })

    // Helper
    helper = new SpotLightHelper(spotLight)
    helper.name = `${light.name}:helper`
    helper.onBeforeRender = helper.update
    helper.visible = false
    scenes.currentScene?.utils.add(helper)

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
          scenes.currentScene?.utils.add(helper)
          scenes.currentScene?.utils.add(transform!)
        } else {
          scenes.currentScene?.utils.remove(helper)
          scenes.currentScene?.utils.remove(transform!)
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

const debugOptTexture = (parentFolder: any, material: Material, label: string) => {
  const folder = debugFolder(label, parentFolder)
  debugImage(folder, label, {
    texture: true,
    onChange: (value: Texture) => {
      // @ts-ignore
      material[label] = value
    },
  })
  debugButton(folder, 'Clear', () => {
    // @ts-ignore
    material[label] = null
  })
}

const debugMaterialCore = (parentFolder: any, material: Material) => {
  const folder = debugFolder('Core', parentFolder)
  const extra = {
    defines: JSON.stringify(material.defines),
  }
  debugButton(folder, 'Update', () => {
    material.needsUpdate = true
  })
  debugInput(folder, material, 'type', { label: 'Material', disabled: true })
  debugInput(folder, extra, 'defines', { label: 'Defines', disabled: true })
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
          setMaterialBlendNormal(material)
          break
        case 1:
          setMaterialBlendAdd(material)
          break
        case 2:
          setMaterialBlendScreen(material)
          break
        case 3:
          setMaterialBlendMultiply(material)
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
    (value: any) => {
      material.side = value
    },
  )
  debugInput(folder, material, 'alphaTest', { min: 0, max: 1 })
  debugInput(folder, material, 'opacity', { min: 0, max: 1 })
  debugInput(folder, material, 'dithering')
  debugInput(folder, material, 'depthTest')
  debugInput(folder, material, 'depthWrite')
  debugInput(folder, material, 'stencilWrite')
  debugInput(folder, material, 'transparent')
  // @ts-ignore
  if (material['wireframe'] !== undefined) debugInput(folder, material, 'wireframe')
}

const debugMeshBasicMaterial = (parentFolder: any, material: MeshBasicMaterial) => {
  const folder = debugFolder('Basic', parentFolder)
  debugOptTexture(folder, material, 'alphaMap')
  debugOptTexture(folder, material, 'aoMap')
  debugInput(folder, material, 'aoMapIntensity', { min: 0, max: 1 })
  debugColor(folder, material, 'color')
  debugOptTexture(folder, material, 'envMap')
  debugInput(folder, material, 'fog')
  debugOptTexture(folder, material, 'lightMap')
  debugInput(folder, material, 'lightMapIntensity', { min: 0, max: 1 })
  debugOptTexture(folder, material, 'map')
  debugInput(folder, material, 'reflectivity', { min: 0, max: 1 })
  debugInput(folder, material, 'refractionRatio', { min: 0, max: 1 })
  debugOptTexture(folder, material, 'specularMap')
}

const debugMeshLambertMaterial = (parentFolder: any, material: MeshLambertMaterial) => {
  const folder = debugFolder('Lambert', parentFolder)
  debugOptTexture(folder, material, 'alphaMap')
  debugOptTexture(folder, material, 'aoMap')
  debugInput(folder, material, 'aoMapIntensity', { min: 0, max: 1 })
  debugOptTexture(folder, material, 'bumpMap')
  debugInput(folder, material, 'bumpScale')
  debugColor(folder, material, 'color')
  debugOptTexture(folder, material, 'displacementMap')
  debugInput(folder, material, 'displacementScale', { min: 0, max: 1 })
  debugColor(folder, material, 'emissive')
  debugOptTexture(folder, material, 'emissiveMap')
  debugInput(folder, material, 'emissiveIntensity', { min: 0, max: 1 })
  debugOptTexture(folder, material, 'envMap')
  debugInput(folder, material, 'flatShading')
  debugInput(folder, material, 'fog')
  debugOptTexture(folder, material, 'lightMap')
  debugInput(folder, material, 'lightMapIntensity', { min: 0, max: 1 })
  debugOptTexture(folder, material, 'map')
  debugOptTexture(folder, material, 'normalMap')
  debugInput(folder, material, 'normalScale')
  debugInput(folder, material, 'reflectivity', { min: 0, max: 1 })
  debugInput(folder, material, 'refractionRatio', { min: 0, max: 1 })
  debugOptTexture(folder, material, 'specularMap')
}

const debugMeshMatcapMaterial = (parentFolder: any, material: MeshMatcapMaterial) => {
  const folder = debugFolder('Matcap', parentFolder)
  debugOptTexture(folder, material, 'alphaMap')
  debugOptTexture(folder, material, 'bumpMap')
  debugInput(folder, material, 'bumpScale')
  debugColor(folder, material, 'color')
  debugOptTexture(folder, material, 'displacementMap')
  debugInput(folder, material, 'displacementScale', { min: 0, max: 1 })
  debugInput(folder, material, 'flatShading')
  debugInput(folder, material, 'fog')
  debugOptTexture(folder, material, 'map')
  debugOptTexture(folder, material, 'matcap')
  debugOptTexture(folder, material, 'normalMap')
  debugInput(folder, material, 'normalScale')
}

const debugMeshPhongMaterial = (parentFolder: any, material: MeshPhongMaterial) => {
  const folder = debugFolder('Phong', parentFolder)
  debugOptTexture(folder, material, 'alphaMap')
  debugOptTexture(folder, material, 'aoMap')
  debugInput(folder, material, 'aoMapIntensity', { min: 0, max: 1 })
  debugOptTexture(folder, material, 'bumpMap')
  debugInput(folder, material, 'bumpScale')
  debugColor(folder, material, 'color')
  debugOptTexture(folder, material, 'displacementMap')
  debugInput(folder, material, 'displacementScale', { min: 0, max: 1 })
  debugColor(folder, material, 'emissive')
  debugOptTexture(folder, material, 'emissiveMap')
  debugInput(folder, material, 'emissiveIntensity', { min: 0, max: 1 })
  debugOptTexture(folder, material, 'envMap')
  debugInput(folder, material, 'flatShading')
  debugInput(folder, material, 'fog')
  debugOptTexture(folder, material, 'lightMap')
  debugInput(folder, material, 'lightMapIntensity', { min: 0, max: 1 })
  debugOptTexture(folder, material, 'map')
  debugOptTexture(folder, material, 'normalMap')
  debugInput(folder, material, 'normalScale')
  debugInput(folder, material, 'reflectivity', { min: 0, max: 1 })
  debugInput(folder, material, 'refractionRatio', { min: 0, max: 1 })
  debugInput(folder, material, 'shininess', { min: 0, max: 1 })
  debugColor(folder, material, 'specular')
  debugOptTexture(folder, material, 'specularMap')
}

const debugMeshPhysicalMaterial = (parentFolder: any, material: MeshPhysicalMaterial) => {
  debugMeshStandardMaterial(parentFolder, material)
  const folder = debugFolder('Physical', parentFolder)
  debugColor(folder, material, 'attenuationColor')
  debugInput(folder, material, 'clearcoat', { min: 0, max: 1 })
  debugOptTexture(folder, material, 'clearcoatMap')
  debugOptTexture(folder, material, 'clearcoatNormalMap')
  debugInput(folder, material, 'clearcoatNormalScale')
  debugInput(folder, material, 'clearcoatRoughness')
  debugOptTexture(folder, material, 'clearcoatRoughnessMap')
  debugInput(folder, material, 'ior', { min: 1, max: 2.333 })
  debugInput(folder, material, 'reflectivity', { min: 0, max: 1 })
  debugInput(folder, material, 'sheen', { min: 0, max: 1 })
  debugInput(folder, material, 'sheenRoughness', { min: 0, max: 1 })
  debugOptTexture(folder, material, 'sheenRoughnessMap')
  debugColor(folder, material, 'sheenColor')
  debugOptTexture(folder, material, 'sheenColorMap')
  debugInput(folder, material, 'specularIntensity', { min: 0, max: 1 })
  debugOptTexture(folder, material, 'specularIntensityMap')
  debugColor(folder, material, 'specularColor')
  debugOptTexture(folder, material, 'specularColorMap')
  debugInput(folder, material, 'thickness', { min: 0, max: 1 })
  debugOptTexture(folder, material, 'thicknessMap')
  debugInput(folder, material, 'transmission', { min: 0, max: 1 })
  debugOptTexture(folder, material, 'transmissionMap')
}

const debugMeshStandardMaterial = (parentFolder: any, material: MeshStandardMaterial | MeshPhysicalMaterial) => {
  const folder = debugFolder('Standard', parentFolder)
  debugOptTexture(folder, material, 'alphaMap')
  debugOptTexture(folder, material, 'aoMap')
  debugInput(folder, material, 'aoMapIntensity', { min: 0, max: 1 })
  debugOptTexture(folder, material, 'bumpMap')
  debugInput(folder, material, 'bumpScale', { min: 0, max: 1 })
  debugColor(folder, material, 'color')
  debugOptTexture(folder, material, 'displacementMap')
  debugInput(folder, material, 'displacementScale', { min: 0, max: 1 })
  debugColor(folder, material, 'emissive')
  debugOptTexture(folder, material, 'emissiveMap')
  debugInput(folder, material, 'emissiveIntensity', { min: 0, max: 1 })
  debugOptTexture(folder, material, 'envMap')
  debugInput(folder, material, 'envMapIntensity', { min: 0, max: 1 })
  debugInput(folder, material, 'fog')
  debugOptTexture(folder, material, 'lightMap')
  debugInput(folder, material, 'lightMapIntensity', { min: 0, max: 1 })
  debugOptTexture(folder, material, 'map')
  debugInput(folder, material, 'metalness', { min: 0, max: 1 })
  debugOptTexture(folder, material, 'metalnessMap')
  debugOptTexture(folder, material, 'normalMap')
  debugInput(folder, material, 'normalScale')
  debugInput(folder, material, 'roughness', { min: 0, max: 1 })
  debugOptTexture(folder, material, 'roughnessMap')
}

const debugShaderMaterial = (parentFolder: any, material: ShaderMaterial | RawShaderMaterial) => {
  const folder = debugFolder('Uniforms', parentFolder)
  for (const i in material.uniforms) {
    const uniform = material.uniforms[i].value
    if (typeof uniform === 'number') {
      debugInput(folder, material.uniforms[i], 'value', { label: i })
    } else if (uniform instanceof Vector2 || uniform instanceof Vector3) {
      debugInput(folder, material.uniforms[i], 'value', { label: i })
    } else if (uniform instanceof Color) {
      debugColor(folder, material.uniforms[i], 'value', { label: i })
    } else if (uniform === null || uniform instanceof Texture) {
      debugImage(folder, i, {
        texture: true,
        onChange: (value: Texture) => {
          // @ts-ignore
          material.uniforms[i]['value'] = value
        },
      })
    }
  }
}

export const debugMaterial = (parentFolder: any, mesh: Mesh | Line, props?: any): any => {
  const pane = parentFolder !== undefined ? parentFolder : scenesTab
  const folder = debugFolder('Material', pane)
  const material = mesh.material as Material
  debugMaterialCore(folder, material)
  if (material instanceof MeshBasicMaterial) {
    debugMeshBasicMaterial(folder, material)
  } else if (material instanceof MeshLambertMaterial) {
    debugMeshLambertMaterial(folder, material)
  } else if (material instanceof MeshMatcapMaterial) {
    debugMeshMatcapMaterial(folder, material)
  } else if (material instanceof MeshPhongMaterial) {
    debugMeshPhongMaterial(folder, material)
  } else if (material instanceof MeshPhysicalMaterial) {
    debugMeshPhysicalMaterial(folder, material)
  } else if (material instanceof MeshStandardMaterial) {
    debugMeshStandardMaterial(folder, material)
  } else if (material instanceof ShaderMaterial || material instanceof RawShaderMaterial) {
    debugShaderMaterial(folder, material)
  }

  const debugMaterialFolder: any = debugFolder('Debug Material', folder)
  const debugMaterial = new DebugMaterial()
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
    name === 'attenuationDistance' ||
    name.slice(0, 5) === 'blend' ||
    name.slice(0, 4) === 'clip' ||
    name.slice(0, 7) === 'polygon' ||
    name.slice(0, 7) === 'stencil' ||
    name.slice(0, 2) === 'is'
  )
}
