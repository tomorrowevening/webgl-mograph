// Libs
import { Material, Mesh, Texture, Vector2 } from 'three'
// Views
import UIMaterial from '../materials/ui/UIMaterial'
import { BaseUI, UIAlign } from '../types'
// Utils
import { planeTL } from '../utils/three'

export default class UIMesh extends Mesh implements BaseUI {
  align: UIAlign

  anchor: Vector2

  width: number

  height: number

  constructor(
    name: string,
    width: number,
    height: number,
    texture: Texture | null,
    align: UIAlign = 'TL',
    anchor = new Vector2(),
    material?: Material,
  ) {
    const mat = material !== undefined ? material : new UIMaterial({ map: texture })
    super(planeTL.clone(), mat)
    this.name = name
    // Visual
    this.align = align
    this.anchor = anchor
    this.width = width
    this.height = height
    this.scale.set(width, height, 1)
  }

  reposition(width: number, height: number): void {
    const cw = width / 2
    const ch = height / 2
    let x = 0
    let y = 0
    switch (this.align) {
      case 'TL':
        x = this.anchor.x
        y = -this.anchor.y
        break
      case 'TC':
        x = cw + this.anchor.x
        y = -this.anchor.y
        break
      case 'TR':
        x = width - this.width - this.anchor.x
        y = -this.anchor.y
        break
      case 'CL':
        x = this.anchor.x
        y = -(ch + this.anchor.y)
        break
      case 'CC':
        x = cw + this.anchor.x
        y = -(ch + this.anchor.y)
        break
      case 'CR':
        x = width - this.width - this.anchor.x
        y = -(ch + this.anchor.y)
        break
      case 'BL':
        x = this.anchor.x
        y = -(height - this.height - this.anchor.y)
        break
      case 'BC':
        x = cw + this.anchor.x
        y = -(height - this.height - this.anchor.y)
        break
      case 'BR':
        x = width - this.width - this.anchor.x
        y = -(height - this.height - this.anchor.y)
        break
    }
    this.position.set(x, y, 0)
  }

  // @ts-ignore
  override onBeforeRender() {
    // @ts-ignore
    this.material.uniforms.opacity.value = this.material.opacity
  }

  get opacity(): number {
    // @ts-ignore
    return this.material.opacity
  }

  set opacity(value: number) {
    // @ts-ignore
    this.material.opacity = value
  }
}
