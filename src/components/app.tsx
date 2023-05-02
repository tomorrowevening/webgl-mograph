// Libs
import React from 'react'
import ReactDOM from 'react-dom/client'
// Models
import { IS_DEV } from '@/models/constants'
// Components
import './index.scss'
import Footer from './footer'
import Header from './header'
import Main from './main'
// Utils
import EditorComponents from './EditorComponents'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <>
    {IS_DEV ? (
      <>
        <EditorComponents />
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
