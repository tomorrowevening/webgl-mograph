// Libs
import { CSSProperties, useEffect } from 'react'
import { Vector2 } from 'three'
// Models
import type { MeshUX } from '@/types'
// Views
import './button.scss'
// Controllers
import scenes from '@/controllers/SceneController'

export default function TextButton(props: MeshUX) {
  const style: CSSProperties = {
    width: `${props.width}px`,
    height: `${props.height}px`,
  }
  if (props.left !== undefined) style.left = `${props.left}px`
  if (props.right !== undefined) style.right = `${props.right}px`
  if (props.top !== undefined) style.top = `${props.top}px`
  if (props.bottom !== undefined) style.bottom = `${props.bottom}px`

  useEffect(() => {
    const mesh = scenes.addText(props.name, {
      // UX
      left: props.left,
      right: props.right,
      top: props.top,
      bottom: props.bottom,
      width: props.width,
      height: props.height,
      align: props.align,
      anchor: new Vector2(
        props.left !== undefined ? props.left : props.right,
        props.top !== undefined ? props.top : props.bottom,
      ),
      material: props.material,
      onRollOver: props.onRollOver,
      onRollOut: props.onRollOut,
      onClick: props.onClick,
      // Font
      map: props.params?.map,
      flipY: props.params?.flipY,
      font: props.params?.font,
      fontSize: props.params?.fontSize,
      text: props.params?.text,
      letterSpacing: props.params?.letterSpacing,
    })
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
