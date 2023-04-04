import type { IExtension, ToolsetConfig } from '@theatre/studio'
import { Events, debugDispatcher, threeDispatcher } from '@/models/constants'
import Inspector from './Inspector'

//////////////////////////////////////////////////
// App

export const AppExtension = {
  id: '@tomorrowevening/AppExtension',
  toolbars: {
    // @ts-ignore
    global(set) {
      const updateOptions = () =>
        set([
          {
            type: 'Flyout',
            label: '🛠',
            items: [
              {
                label: 'Click to Inspect',
                onClick: () => {
                  debugDispatcher.dispatchEvent({ type: Inspector.SINGLE_CLICK })
                },
              },
            ],
          },
          {
            type: 'Flyout',
            label: '🚀',
            items: [
              {
                label: 'Lobby',
                onClick: () => {
                  threeDispatcher.dispatchEvent({
                    type: Events.SCENE_SHOW,
                    scene: 'lobby',
                    transition: 'wipe',
                  })
                },
              },
              {
                label: 'Intro',
                onClick: () => {
                  threeDispatcher.dispatchEvent({
                    type: Events.SCENE_SHOW,
                    scene: 'intro',
                    transition: 'wipe',
                  })
                },
              },
              {
                label: 'Credits',
                onClick: () => {
                  threeDispatcher.dispatchEvent({
                    type: Events.SCENE_SHOW,
                    scene: 'credits',
                    transition: 'wipe',
                  })
                },
              },
            ],
          },
        ])
      updateOptions()
    },
  },
  panes: [],
}

//////////////////////////////////////////////////
// Camera

const getToolsetConfig = (switchValue: string, switchOnChange: (value: string) => void): ToolsetConfig => [
  {
    type: 'Switch',
    value: switchValue,
    onChange: switchOnChange,
    options: [
      {
        label: 'Rendered',
        value: 'rendered',
        svgSource: '🎥',
      },
      {
        label: 'Quad',
        value: 'quadView',
        svgSource: '🎬',
      },
    ],
  },
]

export const CameraExtension: IExtension = {
  id: '@tomorrowevening/CameraExtension',
  toolbars: {
    // @ts-ignore
    global(set) {
      const setSwitchConfig = (value: string) => {
        set(getToolsetConfig(value, setSwitchConfig))
        debugDispatcher.dispatchEvent({ type: Events.UPDATE_MULTICAMS, value: value })
      }
      setSwitchConfig('rendered')
    },
  },
  panes: [],
}
