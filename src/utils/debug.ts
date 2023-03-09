import { Pane } from 'tweakpane'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'
// @ts-ignore
import * as TweakpaneImagePlugin from 'tweakpane-image-plugin'
import { settings } from '../models/settings'

let gui: Pane
let tabs: any
export let appTab: any
export let systemTab: any
let stats: any // performance

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
    pages: [
      { title: 'App', },
      { title: 'System', },
    ],
  })

  // Tabs
  appTab = tabs.pages[0]
  systemTab = tabs.pages[1]

  stats = systemTab.addBlade({
    view: 'fpsgraph',
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
