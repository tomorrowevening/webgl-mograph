// Libs
import { useEffect, useState } from 'react'
// Views
import Dropdown from '../components/Dropdown'
import { DropdownOption } from '../components/types'
import { Events, threeDispatcher } from '@/models/constants'
import scenes from '@/controllers/SceneController'

const icon = `
<svg width="14" height="14" fill="white" stroke="none">
  <path d="M5.6,1.5C5.6,1.2,5.4,1,5.1,1C4.8,1,4.6,1.2,4.6,1.5v0.3c0,0.3,0.2,0.5,0.5,0.5c0.3,0,0.5-0.2,0.5-0.5V1.5z
M2.9,2.2C2.7,2,2.4,2,2.2,2.2C2,2.4,2,2.7,2.2,2.9l0.5,0.5c0.2,0.2,0.5,0.2,0.7,0c0.2-0.2,0.2-0.5,0-0.7L2.9,2.2z M8,2.9
c0.2-0.2,0.2-0.5,0-0.7C7.8,2,7.5,2,7.3,2.2L6.7,2.7c-0.2,0.2-0.2,0.5,0,0.7c0.2,0.2,0.5,0.2,0.7,0L8,2.9z M1.5,4.6
C1.2,4.6,1,4.8,1,5.1s0.2,0.5,0.5,0.5h0.3c0.3,0,0.5-0.2,0.5-0.5S2,4.6,1.8,4.6H1.5z M8.6,4.6c-0.3,0-0.5,0.2-0.5,0.5
s0.2,0.5,0.5,0.5h0.3c0.3,0,0.5-0.2,0.5-0.5S9.2,4.6,8.9,4.6H8.6z M3.4,7.5c0.2-0.2,0.2-0.5,0-0.7c-0.2-0.2-0.5-0.2-0.7,0L2.2,7.3
C2,7.5,2,7.8,2.2,8c0.2,0.2,0.5,0.2,0.7,0L3.4,7.5z M5.6,8.6c0-0.3-0.2-0.5-0.5-0.5S4.6,8.4,4.6,8.6v0.3c0,0.3,0.2,0.5,0.5,0.5
s0.5-0.2,0.5-0.5V8.6z M5.8,3.5c-0.4-0.4-1-0.4-1.4,0L3.5,4.4c-0.4,0.4-0.4,1,0,1.4L4.7,7l5.7,5.7c0.4,0.4,1,0.4,1.4,0l0.8-0.8
c0.4-0.4,0.4-1,0-1.4L7,4.7L5.8,3.5z M4.3,5.1l0.8-0.8l0.8,0.8L5.1,5.9L4.3,5.1z M5.8,6.6l0.8-0.8l5.4,5.4L11.2,12L5.8,6.6z"/>
</svg>
`

const effectList: DropdownOption[] = [
  {
    type: 'option',
    title: 'Bloom',
    value: 'Bloom',
  },
  {
    type: 'option',
    title: 'Color Adjustments',
    value: 'Color Adjustments',
  },
  {
    type: 'option',
    title: 'Copy',
    value: 'Copy',
  },
  {
    type: 'option',
    title: 'Depth Of Field',
    value: 'Depth Of Field',
  },
  {
    type: 'option',
    title: 'Texture',
    value: 'Texture',
  },
  {
    type: 'option',
    title: 'Vignette',
    value: 'Vignette',
  },
]

export default function PostComponent() {
  const [sceneEffects, setSceneEffects] = useState<string[]>([])

  useEffect(() => {
    const onReady = () => {
      const scene = scenes.currentScene
      console.log(scene)
    }
    threeDispatcher.addEventListener(Events.SCENE_READY, onReady)
    return () => {
      threeDispatcher.removeEventListener(Events.SCENE_READY, onReady)
    }
  }, [])

  return (
    <Dropdown
      title={icon}
      options={[
        {
          type: 'dropdown',
          title: 'Add Effects',
          value: effectList,
        },
        {
          type: 'draggable',
          title: 'Effects',
          value: sceneEffects,
          onDragComplete: (list: string[]) => {
            console.log('Post effects updated:', list)
          },
        },
      ]}
      onSelect={(value: string) => {
        const newArr = [...sceneEffects]
        newArr.push(value)
        setSceneEffects(newArr)
      }}
    />
  )
}
