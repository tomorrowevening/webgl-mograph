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
import Debug from './debug'
import Footer from './footer'
import Header from './header'
import Main from './main'
// Utils
import { AppExtension, CameraExtension } from '@/tools/theatre'
import Editor from './editor'
import AddObjects from './editor/navBar/AddObjects'
import TransformSelector from './editor/navBar/TransformSelector'

if (IS_DEV) {
  // @ts-ignore
  studio.extend(AppExtension)
  studio.extend(CameraExtension)
  studio.initialize()
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <>
    {IS_DEV ? (
      <>
        <Debug />
        <Editor>
          <TransformSelector />
          <AddObjects />
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
