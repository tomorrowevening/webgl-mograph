// Libs
import React from 'react'
import ReactDOM from 'react-dom/client'
// eslint-disable-next-line
import { } from '@theatre/core'
import studio from '@theatre/studio'
// Models
import { IS_DEV } from '@/models/constants'
// Components
import './index.scss'
import Footer from './footer'
import Header from './header'
import Main from './main'
// Utils
import Editor from './editor'
import AddObjects from './editor/navBar/AddObjects'
import Cameras from './editor/navBar/Cameras'
import PostComponent from './editor/navBar/PostComponent'
import Scenes from './editor/navBar/Scenes'
import TransformSelector from './editor/navBar/TransformSelector'

if (IS_DEV) {
  studio.initialize()
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <>
    {IS_DEV ? (
      <>
        <Editor>
          <Scenes />
          <Cameras />
          <TransformSelector />
          <AddObjects />
          <PostComponent />
        </Editor>
        <Header />
        <Main />
        <Footer />
      </>
    ) : (
      <React.StrictMode>
        <Header />
        <Main />
        <Footer />
      </React.StrictMode>
    )}
  </>,
)
