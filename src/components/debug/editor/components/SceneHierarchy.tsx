// Libs
import { useEffect, useState } from 'react'
import { Object3D } from 'three'
// Models
import { debugDispatcher, Events, threeDispatcher } from '@/models/constants'
// Controllers
import scenes from '@/controllers/SceneController'
import Inspector from '@/tools/Inspector'
import { delay } from '@/utils/dom'

function determineIcon(obj: Object3D): string {
  if (obj.name === 'cameras') {
    return 'camera'
  } else if (obj.name === 'interactive') {
    return 'interactive'
  } else if (obj.name === 'lights') {
    return 'light'
  } else if (obj.name === 'ui') {
    return 'ui'
  } else if (obj.name === 'utils') {
    return 'utils'
  }

  const type = obj.type
  if (type.search('Helper') > -1) {
    return 'icon_utils'
  } else if (type.search('Camera') > -1) {
    return 'camera'
  } else if (type.search('Light') > -1) {
    return 'light'
  }
  return 'obj3D'
}

type ChildObjectProps = {
  child: Object3D
}
function ChildObject(props: ChildObjectProps) {
  const [open, setOpen] = useState(false)

  let container = null
  let hasChildren = false
  if (props.child.children.length > 0) {
    hasChildren = true
    const children: Array<any> = []
    props.child.children.map((child: Object3D) => {
      children.push(<ChildObject child={child} key={Math.random()} />)
    })
    container = <div className={`container ${!open ? 'closed' : ''}`}>{children}</div>
  }

  return (
    <div className="childObject" key={Math.random()}>
      <div className="child">
        {hasChildren ? (
          <button
            className="status"
            style={{
              backgroundPositionX: open ? '-14px' : '2px',
            }}
            onClick={() => {
              setOpen(!open)
            }}
          ></button>
        ) : null}
        <button
          className="name"
          style={{
            left: hasChildren ? '20px' : '5px',
          }}
          onClick={() => {
            debugDispatcher.dispatchEvent({ type: Inspector.SELECT, value: props.child })
          }}
        >
          {props.child.name.length > 0
            ? `${props.child.name} (${props.child.type})`
            : `${props.child.type}::${props.child.uuid}`}
        </button>
        <div className={`icon ${determineIcon(props.child)}`}></div>
      </div>
      {container}
    </div>
  )
}

function ContainerObject(props: ChildObjectProps) {
  const children: Array<any> = []
  props.child.children.map((child: Object3D) => {
    children.push(<ChildObject child={child} key={Math.random()} />)
  })

  return <div className="scene">{children}</div>
}

export default function SceneHierarchy() {
  const [open, setOpen] = useState(false)
  const [scene, setScene] = useState<Object3D | null>(null)

  const onSceneReady = () => {
    setScene(scenes.currentScene!)
  }
  const onUpdate = () => {
    setOpen(false)
    setScene(null)
    delay(0.1).then(() => {
      setScene(scenes.currentScene!)
    })
  }

  useEffect(() => {
    threeDispatcher.addEventListener(Events.SCENE_READY, onSceneReady)
    threeDispatcher.addEventListener(Events.UPDATE_HIERARCHY, onUpdate)
    return () => {
      threeDispatcher.removeEventListener(Events.SCENE_READY, onSceneReady)
      threeDispatcher.removeEventListener(Events.UPDATE_HIERARCHY, onUpdate)
    }
  }, [onSceneReady, onUpdate])

  return (
    <div id="SceneHierarchy">
      <div className="header">
        <button
          className="status"
          style={{
            backgroundPositionX: open ? '-14px' : '2px',
          }}
          onClick={() => {
            setOpen(!open)
          }}
        ></button>
        <span>Hierarchy: {scene?.name}</span>
        <button className="refresh hideText" onClick={() => onUpdate()}>
          Refresh
        </button>
      </div>
      {scene !== null && open ? <ContainerObject child={scene} /> : null}
    </div>
  )
}
