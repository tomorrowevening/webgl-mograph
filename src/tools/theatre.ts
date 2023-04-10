import type { IExtension, ToolsetConfig } from '@theatre/studio'
import { Events, debugDispatcher, threeDispatcher } from '@/models/constants'

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
