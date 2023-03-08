// Libs
import React from 'react'
import ReactDOM from 'react-dom/client'
import { } from '@theatre/core'
import studio from '@theatre/studio'
// Models
import { IS_DEV } from '../models/constants'
// Components
import '../scss/index.scss'
import Footer from './footer'
import Header from './header'
import Main from './main'
// Utils
import { initDebug } from '../utils/debug'

if (IS_DEV) {
  studio.initialize()
  initDebug()
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Header />
    <Main />
    <Footer />
  </React.StrictMode>,
)
