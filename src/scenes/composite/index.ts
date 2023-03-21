// Libs
import { Mesh, Scene } from 'three'
// Models
import webgl from '../../models/webgl'
// Materials
import CompositeMaterial from '../../materials/post/CompositeMaterial'
// Utils
import { orthoCamera, triangle } from '../../utils/three'

export default class CompositeScene extends Scene {
  material: CompositeMaterial

  constructor() {
    super()
    this.material = new CompositeMaterial()
    this.add(new Mesh(triangle, this.material))
  }

  draw(): void {
    webgl.renderer.setRenderTarget(null)
    webgl.renderer.render(this, orthoCamera)
  }

  resize(width: number, height: number): void {
    this.material.setResolution(width, height)
  }

  get transitioning(): boolean {
    return this.material.transitioning
  }

  set transitioning(value: boolean) {
    this.material.transitioning = value
  }
}
