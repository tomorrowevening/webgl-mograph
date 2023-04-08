import './scss/index.scss'

type EditorProps = {
  children?: JSX.Element | JSX.Element[]
}

export default function Editor(props: EditorProps) {
  return (
    <div className="editor">
      <div className="navBar">{props.children}</div>
    </div>
  )
}
