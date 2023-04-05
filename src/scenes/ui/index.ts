// Libs
import { Material, Object3D, OrthographicCamera, Scene, Texture, Vector2 } from 'three'
// Models
import webgl from '@/models/webgl'
import { UIAlign } from '@/types'
// Views
import UIMesh from '@/mesh/ui/UIMesh'
import TextMesh from '@/mesh/ui/TextMesh'
// Utils
import { dispose, updateCameraOrtho } from '@/utils/three'

export default class UIScene extends Scene {
  camera: OrthographicCamera

  private childrenCount = 0

  constructor() {
    super()
    this.camera = new OrthographicCamera(0, 1, 0, 1, 0.1, 101)
    this.camera.position.z = 100
    this.resize(window.innerWidth, window.innerHeight)
  }

  draw(redraw = false): void {
    const total = this.children.length
    // Only render when updated
    if ((total > 0 && this.childrenCount !== total) || redraw) {
      const renderTarget = webgl.renderTargets.get('ui')
      if (renderTarget) webgl.renderer.setRenderTarget(renderTarget)
      webgl.renderer.setClearAlpha(0)
      webgl.renderer.clear()
      webgl.renderer.render(this, this.camera)
    }
    this.childrenCount = total
  }

  resize(width: number, height: number): void {
    updateCameraOrtho(this.camera, width, height)
    this.children.forEach((child: Object3D) => {
      const mesh = child as UIMesh
      mesh.reposition(width, height)
    })
    this.draw(true)
  }

  clearUI(): void {
    this.children.forEach((child: Object3D) => dispose(child))
  }

  addMesh(
    name: string,
    width: number,
    height: number,
    texture: Texture | null,
    align: UIAlign = 'TL',
    anchor = new Vector2(),
    material?: Material,
  ): UIMesh {
    const mesh = new UIMesh(name, width, height, texture, align, anchor, material)
    this.add(mesh)
    const resolution = new Vector2()
    webgl.renderer.getSize(resolution)
    mesh.reposition(resolution.x, resolution.y)
    return mesh
  }

  addText(name: string, options: any): TextMesh {
    const mesh = new TextMesh(name, options.map, options.align, options.anchor, options.material)
    mesh.update(options)
    this.add(mesh)
    const resolution = new Vector2()
    webgl.renderer.getSize(resolution)
    mesh.reposition(resolution.x, resolution.y)
    return mesh
  }
}
