import { ACESFilmicToneMapping, CineonToneMapping, LinearToneMapping, NoToneMapping, ReinhardToneMapping } from 'three'
import { Pane } from 'tweakpane'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'
// @ts-ignore
import * as TweakpaneImagePlugin from 'tweakpane-image-plugin'
import { Camera, OrthographicCamera, PerspectiveCamera, RepeatWrapping, Texture } from 'three'
//
import { clamp } from './math'
import { settings } from '../models/settings'
import webgl from '../models/webgl'

let gui: Pane
let tabs: any
let stats: any // performance
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

// Utils

function clampColor(value: number): number {
  return clamp(Math.round(value), 0, 255)
}
