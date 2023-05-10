// Libs
import { useEffect } from 'react'
// Models
import { Events, debugDispatcher, threeDispatcher } from '@/models/constants'
// Views
import Dropdown from '../components/Dropdown'
import { DropdownOption } from '../components/types'
// Controllers
import scenes from '@/controllers/SceneController'
import { Object3D } from 'three'

const icon = `
<svg width="14" height="14" fill="none" stroke="white">
  <path d="M11.3,3.7c0.4,0,0.6,0,0.7,0c0.5,0.1,0.9,0.5,1,1c0,0.2,0,0.3,0,0.7v4.3c0,1.3,0,1.9-0.4,2.3s-1,0.4-2.3,0.4
	H9.7H4.3H3.7c-1.3,0-1.9,0-2.3-0.4C1,11.6,1,10.9,1,9.7V5.4C1,5,1,4.8,1,4.7c0.1-0.5,0.5-0.9,1-1c0.2,0,0.3,0,0.7,0l0,0
	c0.2,0,0.3,0,0.4,0c0.3,0,0.6-0.2,0.8-0.4C4,3.2,4.1,3.1,4.2,2.9l0.2-0.2c0.3-0.4,0.4-0.6,0.6-0.7C5,1.9,5.1,1.8,5.3,1.7
	c0.2-0.1,0.5-0.1,0.9-0.1h1.6c0.5,0,0.7,0,0.9,0.1c0.1,0,0.3,0.1,0.4,0.2c0.2,0.1,0.3,0.3,0.6,0.7l0.2,0.2c0.1,0.2,0.2,0.3,0.2,0.3
	c0.2,0.2,0.5,0.4,0.8,0.4C10.9,3.7,11.1,3.7,11.3,3.7L11.3,3.7z"/>
  <path d="M9,7.7c0,1.1-0.9,2-2,2s-2-0.9-2-2s0.9-2,2-2S9,6.6,9,7.7z"/>
</svg>
`

const viewOptions: DropdownOption[] = [
  {
    type: 'option',
    title: 'Default',
    value: 'render_default',
  },
  {
    type: 'option',
    title: 'Depth',
    value: 'render_depth',
  },
  {
    type: 'option',
    title: 'Normals',
    value: 'render_normals',
  },
  {
    type: 'option',
    title: 'UVs',
    value: 'render_uvs',
  },
]

export default function Cameras() {
  const onSelect = (value: string) => {
    if (value.search('camera_') > -1) {
      switch (value) {
        case 'camera_add':
          debugDispatcher.dispatchEvent({ type: Events.UPDATE_MULTICAMS, value: value })
          break
        default:
        case 'camera_main':
        case 'camera_debug':
          const cameraName = value.slice(7, value.length)
          debugDispatcher.dispatchEvent({ type: Events.SET_MULTICAMS_CAMERA, value: cameraName })
          break
      }
    } else if (value.search('render_') > -1) {
      switch (value) {
        default:
        case 'render_default':
        case 'render_depth':
        case 'render_normals':
        case 'render_uvs':
          debugDispatcher.dispatchEvent({ type: Events.UPDATE_MULTICAMS, value: value })
          break
      }
    } else {
      switch (value) {
        case 'takeScreenshot':
          debugDispatcher.dispatchEvent({ type: Events.TAKE_SCREENSHOT })
          break
        case 'toggleOrbit':
          debugDispatcher.dispatchEvent({ type: Events.TOGGLE_ORBIT })
          break
        case 'quadView':
        case 'singleView':
        case 'toggleGrid':
          debugDispatcher.dispatchEvent({ type: Events.UPDATE_MULTICAMS, value: value })
          break
      }
    }
  }

  const cameraOptions: DropdownOption[] = [
    {
      type: 'option',
      title: 'Debug',
      value: 'camera_debug',
    },
    {
      type: 'option',
      title: 'Top',
      value: 'camera_top',
    },
    {
      type: 'option',
      title: 'Left',
      value: 'camera_left',
    },
    {
      type: 'option',
      title: 'Front',
      value: 'camera_front',
    },
    {
      type: 'option',
      title: 'Ortho',
      value: 'camera_ortho',
    },
  ]

  useEffect(() => {
    const onReady = () => {
      const scene = scenes.currentScene
      if (scene !== undefined) {
        scene.cameras.children.forEach((camera: Object3D) => {
          cameraOptions.splice(0, 0, {
            type: 'option',
            title: camera.name,
            value: `camera_${camera.name}`,
          })
        })
      }
    }
    threeDispatcher.addEventListener(Events.SCENE_READY, onReady)
    return () => {
      threeDispatcher.removeEventListener(Events.SCENE_READY, onReady)
    }
  }, [])

  const options: DropdownOption[] = [
    {
      type: 'dropdown',
      title: 'Cameras',
      value: cameraOptions,
    },
    {
      type: 'option',
      title: 'Single View',
      value: 'singleView',
    },
    {
      type: 'option',
      title: 'Quad View',
      value: 'quadView',
    },
    {
      type: 'option',
      title: 'Toggle Orbit',
      value: 'toggleOrbit',
    },
    {
      type: 'option',
      title: 'Toggle Grid',
      value: 'toggleGrid',
    },
    {
      type: 'option',
      title: 'Take Screenshot',
      value: 'takeScreenshot',
    },
    {
      type: 'dropdown',
      title: 'View Modes',
      value: viewOptions,
    },
  ]
  return <Dropdown title={icon} options={options} onSelect={onSelect} />
}
