// Libs
import { useEffect, useState } from 'react'
import studio from '@theatre/studio'
// Views
import './scss/index.scss'
import SceneHierarchy from './components/SceneHierarchy'
// Tools
import { toggleDebugPanel } from '@/utils/debug'

type EditorProps = {
  children?: JSX.Element | JSX.Element[]
}

export default function Editor(props: EditorProps) {
  const [visible, setVisible] = useState(!studio.ui.isHidden)

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

  return (
    <div className={`editor ${visible ? '' : 'hidden'}`}>
      <div className="navBar">{props.children}</div>
      <SceneHierarchy />
    </div>
  )
}
