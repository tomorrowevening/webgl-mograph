// Libs
import { useEffect, useState } from 'react'
import studio from '@theatre/studio'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
// Models
import { Events, debugDispatcher, threeDispatcher } from '@/models/constants'
import fonts from '@/models/fonts'
import assets from '@/models/assets'
// Views
import './scss/index.scss'
import SceneHierarchy from './components/SceneHierarchy'
import TextMesh from '@/mesh/ui/TextMesh'
// Controllers
import scenes from '@/controllers/SceneController'
// Tools
import Inspector from '@/tools/Inspector'
import { toggleDebugPanel } from '@/utils/debug'
import { randomID } from '@/utils/dom'

type EditorProps = {
  children?: JSX.Element | JSX.Element[]
}

export default function Editor(props: EditorProps) {
  const [visible, setVisible] = useState(!studio.ui.isHidden)

  // Key Events
  useEffect(() => {
    const onKey = (evt: KeyboardEvent) => {
      if (evt.altKey && (evt.key === '\\' || evt.code === 'Backslash' || evt.code === 'IntlBackslash')) {
        toggleDebugPanel(visible)
        setVisible(!visible)
      }
    }
    window.addEventListener('keydown', onKey, false)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [visible])

  // Event handling
  useEffect(() => {
    const onAddGLTF = (gltf: GLTF) => {
      scenes.currentScene?.world.add(gltf.scene)
      debugDispatcher.dispatchEvent({ type: Inspector.SELECT, value: gltf.scene })
      threeDispatcher.dispatchEvent({ type: Events.UPDATE_HIERARCHY })
    }

    const onAddText = () => {
      const font = fonts.default
      const fontData = assets.json.get(font)
      const texture = assets.textures.get(font).clone()
      const id = `Text ${randomID()}`
      const mesh = new TextMesh(id, texture)
      mesh.update({
        font: fontData,
        map: texture,
        text: 'Hello World',
      })
      scenes.currentScene?.world.add(mesh)
      mesh.initDebug()
    }

    const onEvt = (evt: any) => {
      switch (evt.type) {
        case Events.ADD_GLTF:
          onAddGLTF(evt.value)
          break
        case Events.ADD_TEXT:
          onAddText()
          break
      }
    }

    debugDispatcher.addEventListener(Events.ADD_GLTF, onEvt)
    debugDispatcher.addEventListener(Events.ADD_TEXT, onEvt)
    return () => {
      debugDispatcher.removeEventListener(Events.ADD_GLTF, onEvt)
      debugDispatcher.removeEventListener(Events.ADD_TEXT, onEvt)
    }
  }, [])

  return (
    <div className={`editor ${visible ? '' : 'hidden'}`}>
      <div className="navBar">{props.children}</div>
      <SceneHierarchy />
    </div>
  )
}
