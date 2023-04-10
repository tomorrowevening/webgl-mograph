// Libs
import { useEffect, useState } from 'react'
import studio from '@theatre/studio'
// Views
import './scss/index.scss'
import SceneHierarchy from './components/SceneHierarchy'
// Tools
import { toggleDebugPanel } from '@/utils/debug'
import { Events, debugDispatcher } from '@/models/constants'
import TextMesh from '@/mesh/ui/TextMesh'
import { randomID } from '@/utils/dom'
import fonts from '@/models/fonts'
import assets from '@/models/assets'
import scenes from '@/controllers/SceneController'

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
    const onAddGLTF = () => {
      console.log('> add GLTF')
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
          onAddGLTF()
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
