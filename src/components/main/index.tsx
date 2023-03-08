// Libs
import { useEffect, useRef } from 'react'
// Models
import { settings } from '../../models/settings'
import webgl from '../../models/webgl'
// Controllers
import AppRunner from '../../controllers/AppRunner'

export default function Main() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const onLoad = () => {
      const canvas = canvasRef.current as HTMLCanvasElement
      settings.detect().then(() => {
        webgl.init(canvas)

        const app = new AppRunner()
        app.init()
        app.play()
      })
    }
    window.addEventListener('load', onLoad, false)
    return () => {
      window.removeEventListener('load', onLoad)
    }
  }, [])
  return (
    <main>
      <canvas ref={canvasRef} />
    </main>
  )
}
