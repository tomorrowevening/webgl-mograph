// Libs
import { useEffect, useRef, useState } from 'react'
// Models
import { Events, threeDispatcher } from '@/models/constants'
// Controllers
import AppRunner from '@/controllers/AppRunner'
// Components
import './main.scss'
import Loader from './loader'
import Welcome from './welcome'
import scenes from '@/controllers/SceneController'

export default function Main() {
  // References
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // States
  const [loaded, setLoaded] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)

  useEffect(() => {
    const onLoad = () => {
      threeDispatcher.removeEventListener(Events.LOAD_COMPLETE, onLoad)
      const canvas = canvasRef.current as HTMLCanvasElement
      const app = new AppRunner(canvas)
      app.init()
      app.play()
      setLoaded(true)
    }

    const startApp = () => {
      threeDispatcher.removeEventListener(Events.START_APP, startApp)
      scenes.showScene('intro', 'wipe')
      setShowWelcome(false)
    }

    threeDispatcher.addEventListener(Events.LOAD_COMPLETE, onLoad)
    threeDispatcher.addEventListener(Events.START_APP, startApp)
    return () => {
      threeDispatcher.removeEventListener(Events.LOAD_COMPLETE, onLoad)
      threeDispatcher.removeEventListener(Events.START_APP, startApp)
    }
  }, [])

  return (
    <main>
      <canvas ref={canvasRef} />
      {loaded ? showWelcome ? <Welcome /> : null : <Loader />}
    </main>
  )
}
