// Libs
import { useEffect, useRef, useState } from 'react'
// Models
import { settings } from '../../models/settings'
// Controllers
import AppRunner from '../../controllers/AppRunner'
import { preloadAssets } from '../../utils/preloader'
// Components
import '../../scss/main.scss'

export default function Main() {
  // References
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // States
  const [percent, setPercent] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const preload = () => {
      preloadAssets((progess: number) => setPercent(progess), startApp)
    }

    const startApp = () => {
      setLoaded(true)
      const canvas = canvasRef.current as HTMLCanvasElement
      const app = new AppRunner(canvas)
      app.init()
      app.play()
    }

    const onLoad = () => {
      window.removeEventListener('load', onLoad)
      settings.detect().then(() => {
        preload()
      })
    }
    window.addEventListener('load', onLoad, false)
  }, [])

  return (
    <main>
      <canvas ref={canvasRef} />
      {!loaded && (
        <div className='absoluteCenter'>
          <p>Loading assets {Math.round(percent * 100)}%</p>
        </div>
      )}
    </main>
  )
}
