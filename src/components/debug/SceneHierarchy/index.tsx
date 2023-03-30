// Libs
import { useEffect, useState } from 'react'
import { Object3D } from 'three'
// Models
import { Events, threeDispatcher } from '../../../models/constants'
// Controllers
import scenes from '../../../controllers/SceneController'

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
      <button
        onClick={() => {
          setOpen(!open)
        }}
      >
        {hasChildren ? (
          <span
            className="status"
            style={{
              backgroundPositionX: open ? '-14px' : '2px',
            }}
          ></span>
        ) : null}
        <span
          className="name"
          style={{
            left: hasChildren ? '20px' : '5px',
          }}
        >
          {props.child.name.length > 0 ? props.child.name : `${props.child.type}::${props.child.uuid}`}
        </span>
        {hasChildren ? <span className="children">{props.child.children.length}</span> : null}
      </button>
      {container}
    </div>
  )
}

export default function SceneHierarchy() {
  const [scene, setScene] = useState<Object3D | null>(null)

  useEffect(() => {
    const onSceneReady = () => {
      console.log('Scene ready:', scenes.currentScene?.name)
      setScene(scenes.currentScene!)
    }
    threeDispatcher.addEventListener(Events.SCENE_READY, onSceneReady)
    return () => {
      threeDispatcher.removeEventListener(Events.SCENE_READY, onSceneReady)
    }
  }, [])

  return <div id="SceneHierarchy">{scene !== null ? <ChildObject child={scene} /> : null}</div>
}
