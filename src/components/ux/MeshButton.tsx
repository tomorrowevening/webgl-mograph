// Libs
import { CSSProperties, useEffect } from 'react'
import { Vector2 } from 'three'
// Models
import type { MeshUX } from '@/types'
// Views
import './button.scss'
// Controllers
import scenes from '@/controllers/SceneController'

export default function MeshButton(props: MeshUX) {
  const style: CSSProperties = {
    width: `${props.width}px`,
    height: `${props.height}px`,
  }
  if (props.left !== undefined) style.left = `${props.left}px`
  if (props.right !== undefined) style.right = `${props.right}px`
  if (props.top !== undefined) style.top = `${props.top}px`
  if (props.bottom !== undefined) style.bottom = `${props.bottom}px`

  useEffect(() => {
    const mesh = scenes.addMesh(
      props.name,
      props.width,
      props.height,
      null,
      props.align,
      new Vector2(
        props?.left !== undefined ? props?.left : props?.right,
        props?.top !== undefined ? props?.top : props?.bottom,
      ),
      props?.material,
    )
    if (props.onInit !== undefined) props.onInit(mesh)
  }, [])

  return (
    <button
      className="uxButton"
      style={style}
      onClick={props.onClick}
      onMouseOver={props.onRollOver}
      onMouseOut={props.onRollOut}
    ></button>
  )
}
