// Utils
import Editor from './debug/editor'
import AddObjects from './debug/editor/navBar/AddObjects'
import Cameras from './debug/editor/navBar/Cameras'
import PostComponent from './debug/editor/navBar/PostComponent'
import Scenes from './debug/editor/navBar/Scenes'
import TransformSelector from './debug/editor/navBar/TransformSelector'

export default function EditorComponents() {
  return (
    <Editor>
      <Scenes />
      <Cameras />
      <TransformSelector />
      <AddObjects />
      <PostComponent />
    </Editor>
  )
}
