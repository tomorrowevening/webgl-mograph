import webgl from '../models/webgl'

export default class App {

  private playing = false
  private afRef = -1

  constructor() {
    window.addEventListener('resize', this.resize, false)
    document.addEventListener('visibilitychange', this.visibilityChange, false)
    this.resize()
  }

  init() {
    //
  }

  update() {
    //
  }

  draw() {
    //
  }

  protected rafUpdate = () => {
    this.update()
    this.draw()
    this.afRef = window.requestAnimationFrame(this.rafUpdate)
  }

  play() {
    if (this.playing) return
    this.playing = true
    this.rafUpdate()
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