// Models
import animation from '../models/animation'
import { IS_DEV } from '../models/constants'
import webgl from '../models/webgl'
// Controllers
import scenes from './SceneController'
// Utils
import { startDebug, endDebug, debugWebGL } from '../utils/debug'

export default class App {
  private playing = false
  private afRef = -1

  constructor(canvas: HTMLCanvasElement) {
    // Singletons
    webgl.init(canvas)
    animation.init()

    // Listeners
    window.addEventListener('resize', this.resize, false)
    document.addEventListener('visibilitychange', this.visibilityChange, false)
    this.resize()

    if (IS_DEV) debugWebGL()
  }

  init() {
    scenes.init()
    scenes.showScene('intro')
  }

  update() {
    scenes.update()
  }

  draw() {
    scenes.draw()
  }

  private cycle = () => {
    this.update()
    this.draw()
  }

  private debugRAFUpdate = () => {
    webgl.renderer.info.reset()
    startDebug()
    this.cycle()
    endDebug()
    this.afRef = window.requestAnimationFrame(this.debugRAFUpdate)
  }

  private rafUpdate = () => {
    this.cycle()
    this.afRef = window.requestAnimationFrame(this.rafUpdate)
  }

  play() {
    if (this.playing) return
    this.playing = true
    IS_DEV ? this.debugRAFUpdate() : this.rafUpdate()
  }

  pause() {
    if (!this.playing) return
    this.playing = false
    window.cancelAnimationFrame(this.afRef)
    this.afRef = -1
  }

  resize = () => {
    const width = window.innerWidth
    const height = window.innerHeight
    webgl.resize(width, height)
    scenes.resize(width, height)
  }

  protected visibilityChange = () => {
    // Toggle animation when changing tabs
    const visible = !document.hidden
    if (this.playing && !visible) {
      this.pause()
    } else if (!this.playing && visible) {
      this.play()
    }
  }
}
