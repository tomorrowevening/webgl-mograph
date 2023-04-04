import { Events, debugDispatcher, threeDispatcher } from '@/models/constants'
import Inspector from './Inspector'

const svgIcon = `
<svg viewBox="0 0 20 20">
<path d="M9.09,15.83L6.1,18.82C5.93,19,5.7,19.09,5.45,19.09H1.82c-0.5,0-0.91-0.41-0.91-0.91v-3.64
	c0-0.24,0.1-0.47,0.27-0.64l2.99-2.99l-3.9-3.9c-0.36-0.36-0.36-0.93,0-1.29l5.45-5.45c0.36-0.36,0.93-0.36,1.29,0l3.9,3.9l3.9-3.9
	c0.35-0.36,0.93-0.36,1.29,0l3.64,3.64c0.36,0.36,0.36,0.93,0,1.29l-3.9,3.9l3.9,3.9c0.36,0.36,0.36,0.93,0,1.29l-5.45,5.45
	c-0.36,0.36-0.93,0.36-1.29,0L9.09,15.83z M10.38,14.55l0.99,0.99l0.72-0.72c0.36-0.36,0.93-0.36,1.29,0c0.36,0.35,0.36,0.93,0,1.29
	l-0.72,0.72l0.99,0.99l4.17-4.17l-3.26-3.26L10.38,14.55z M13.18,4.47L2.73,14.92v2.35h2.35L15.53,6.82L13.18,4.47z M14.47,3.18
	l2.35,2.35l0.99-0.99l-2.35-2.35L14.47,3.18z M9.62,5.45L6.36,2.19L2.19,6.36l0.99,0.99L3.9,6.63c0.36-0.36,0.93-0.36,1.29,0
	c0.36,0.36,0.36,0.93,0,1.29L4.47,8.64l0.99,0.99L9.62,5.45z" fill="white" />
</svg>
`

export const InspectorExtension = {
  id: '@tomorrowevening/InspectorExtension',
  toolbars: {
    // @ts-ignore
    global(set) {
      const updateToolset = () =>
        set([
          {
            type: 'Flyout',
            label: '🛠',
            svgSource: svgIcon,
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
            svgSource: svgIcon,
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
      updateToolset()
    },
  },
  panes: [],
}
