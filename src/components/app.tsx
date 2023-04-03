// Libs
import React from 'react'
import ReactDOM from 'react-dom/client'
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
import { InspectorExtension } from '@/tools/theatre'

if (IS_DEV) {
  // @ts-ignore
  studio.extend(InspectorExtension)
  studio.initialize()
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <>
    {IS_DEV ? (
      <>
        <Debug />
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
