import { Pane } from 'tweakpane'
import * as EssentialsPlugin from '@tweakpane/plugin-essentials'
// @ts-ignore
import * as TweakpaneImagePlugin from 'tweakpane-image-plugin'

let gui: Pane

export function initDebug() {
  gui = new Pane()
  gui.registerPlugin(EssentialsPlugin)
  gui.registerPlugin(TweakpaneImagePlugin)

  const guiElement = gui.element.parentElement as HTMLElement
  guiElement.style.right = '130px'
  guiElement.style.top = '12px'
  guiElement.style.width = '300px'
}
