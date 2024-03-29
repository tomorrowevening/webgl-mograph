// Models
import { debugDispatcher } from '@/models/constants'
// Views
import Dropdown from '../components/Dropdown'
// Controllers
import scenes from '@/controllers/SceneController'
// Tools / Utils
import Inspector from '@/tools/Inspector'
import { copyToClipboard } from '@/utils/dom'

const icon = `
<svg width="14" height="14" fill="white">
  <path d="M10.95,4.67c-0.58,0-1.05,0.46-1.05,1.04V5.19c0-0.57-0.47-1.04-1.05-1.04S7.79,4.61,7.79,5.19V4.67
    c0-0.57-0.47-1.04-1.05-1.04S5.68,4.09,5.68,4.67V1.04C5.68,0.46,5.21,0,4.63,0S3.58,0.46,3.58,1.04v5.33
    C3.42,6.28,3.25,6.22,3.05,6.22C2.47,6.22,2,6.69,2,7.26v1.56c0,0.24,0.08,0.46,0.23,0.65l1.87,2.98h6.32l1.21-1.71
    c0.2-0.2,0.37-0.6,0.37-0.89V5.7C12,5.13,11.53,4.67,10.95,4.67z M4.11,12.96v0.52c0,0.29,0.24,0.52,0.53,0.52h5.26
    c0.29,0,0.53-0.23,0.53-0.52v-0.52H4.11z"/>
</svg>
`

const traverse = (obj: any) => {
  delete obj.layers
  delete obj.metadata

  // Traverse children
  const children = obj.children
  if (children !== undefined) {
    const total = children.length
    for (let i = 0; i < total; i++) {
      const child = children[i]
      if (child.type.search('Helper') < 0) {
        if (child.updateMatrix !== undefined) child.updateMatrix()
        traverse(child)
      } else {
        children.splice(i, 1)
      }
    }
  } else if (obj.object !== undefined) {
    if (obj.object.type.search('Helper') < 0) {
      if (obj.object.updateMatrix !== undefined) obj.object.updateMatrix()
      traverse(obj.object)
    }
  }
}

export default function TransformSelector() {
  const exportScene = () => {
    const current = scenes.currentScene
    if (current === undefined) return

    current.updateWorldMatrix(false, true)

    let lightsJSON = current.lights.toJSON()
    traverse(lightsJSON)
    lightsJSON = lightsJSON.object.children

    const worldJSON = current.world.toJSON()
    traverse(worldJSON)
    worldJSON.children = worldJSON.object.children
    delete worldJSON.object

    const output = {
      lights: lightsJSON,
      post: current.post.export(),
      world: worldJSON,
    }
    copyToClipboard(output)
  }

  const selectItem = (value: string) => {
    switch (value) {
      case 'select':
        debugDispatcher.dispatchEvent({ type: Inspector.TOGGLE_CLICK })
        break
      case 'translate':
        debugDispatcher.dispatchEvent({ type: Inspector.CONTROLS_TRANSLATE })
        break
      case 'rotate':
        debugDispatcher.dispatchEvent({ type: Inspector.CONTROLS_ROTATE })
        break
      case 'scale':
        debugDispatcher.dispatchEvent({ type: Inspector.CONTROLS_SCALE })
        break
      case 'export':
        exportScene()
        break
    }
  }

  return (
    <Dropdown
      title={icon}
      options={[
        {
          title: 'Select',
          value: 'select',
          type: 'option',
        },
        {
          title: 'Translate',
          value: 'translate',
          type: 'option',
        },
        {
          title: 'Rotate',
          value: 'rotate',
          type: 'option',
        },
        {
          title: 'Scale',
          value: 'scale',
          type: 'option',
        },
        {
          title: 'Export',
          value: 'export',
          type: 'option',
        },
      ]}
      onSelect={selectItem}
    />
  )
}
