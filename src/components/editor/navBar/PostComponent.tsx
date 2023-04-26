// Libs
import { useEffect, useState } from 'react'
import { Pass } from 'postprocessing'
// Models
import { Events, threeDispatcher } from '@/models/constants'
// Views
import Dropdown from '../components/Dropdown'
import { DropdownOption } from '../components/types'
// Controllers
import scenes from '@/controllers/SceneController'
import { PostEffects, PostPasses } from '@/controllers/PostController'

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

const effectOptions = [
  'Bloom',
  'BrightnessContrast',
  'ChromaticAberration',
  'ColorAverage',
  'ColorDepth',
  'Depth',
  'DepthOfField',
  'DotScreen',
  'FXAA',
  'Glitch',
  'Grid',
  'HueSaturation',
  'LUT',
  'Noise',
  'Outline',
  'Pixelation',
  'SMAA',
  'SSAO',
  'Scanline',
  'SelectiveBloom',
  'Sepia',
  'Texture',
  'TiltShift',
  'ToneMapping',
  'Vignette',
]
const effectList: DropdownOption[] = []
effectOptions.forEach((value: string) => {
  effectList.push({
    type: 'option',
    title: value,
    value: value,
  })
})

const passOptions = [
  'AdaptiveLuminance',
  'BoxBlur',
  'ClearMask',
  'Copy',
  'DepthCopy',
  'DepthDownsampling',
  'Depth',
  'DepthPicking',
  'GaussianBlur',
  'KawaseBlur',
  'Luminance',
  'Mask',
  'Normal',
  'Render',
  'Shader',
  'TiltShiftBlur',
]
const passList: DropdownOption[] = []
passOptions.forEach((value: string) => {
  passList.push({
    type: 'option',
    title: value,
    value: value,
  })
})

export default function PostComponent() {
  const [scenePasses, setScenePasses] = useState<string[]>([])

  const refreshList = () => {
    const scene = scenes.currentScene
    if (scene !== undefined && scene.post !== undefined) {
      const { post } = scene
      const passList: string[] = []
      post.passes.forEach((pass: Pass, key: string) => {
        passList.push(key)
      })
      setScenePasses(passList)
    }
  }

  useEffect(() => {
    threeDispatcher.addEventListener(Events.UPDATE_POST, refreshList)
    return () => {
      threeDispatcher.removeEventListener(Events.UPDATE_POST, refreshList)
    }
  }, [refreshList])

  return (
    <Dropdown
      title={icon}
      options={[
        {
          type: 'dropdown',
          title: 'Add Effect',
          value: effectList,
          onSelect: (value) => {
            const scene = scenes.currentScene
            if (scene !== undefined) {
              scene.post.addPostEffect(value as PostEffects)
              refreshList()
            }
          },
        },
        {
          type: 'dropdown',
          title: 'Add Pass',
          value: passList,
          onSelect: (value) => {
            const scene = scenes.currentScene
            if (scene !== undefined) {
              scene.post.addPostPass(value as PostPasses)
              refreshList()
            }
          },
        },
        {
          type: 'draggable',
          title: 'Passes',
          value: scenePasses,
          onDragComplete: (list: string[]) => {
            console.log('Rearrage passes:', list)
          },
        },
      ]}
    />
  )
}
