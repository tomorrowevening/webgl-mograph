import { Color, Object3D, Mesh, Texture, Vector2 } from 'three'
import TextGeometry from '../geometry/TextGeometry'
import TextMaterial from '../materials/ui/TextMaterial'
import { BaseUI, UIAlign } from '../types/ui'

export default class TextMesh extends Object3D implements BaseUI {
  align: UIAlign

  anchor: Vector2

  width: number

  height: number

  geometry: TextGeometry

  material: TextMaterial

  mesh: Mesh

  container: Object3D = new Object3D()

  options: any = {
    flipY: true,
    font: undefined,
    fontSize: 42,
    text: '',
    letterSpacing: 0,
  }

  private yOffset = 0

  constructor(name: string, texture: Texture | null = null, align: UIAlign = 'TL', anchor = new Vector2()) {
    super()
    this.name = name
    this.align = align
    this.anchor = anchor
    this.width = 0
    this.height = 0
    this.add(this.container)

    this.geometry = new TextGeometry()
    this.material = new TextMaterial({ map: texture })
    this.mesh = new Mesh(this.geometry, this.material)
    this.mesh.name = 'txtSprite'
    this.mesh.position.y = 5
    this.mesh.rotation.x = Math.PI
    this.container.add(this.mesh)
  }

  update(options: any) {
    if (options.align !== undefined) this.align = options.align
    if (options.anchor !== undefined) this.anchor = options.anchor
    if (options.flipY !== undefined) this.options.flipY = options.flipY
    if (options.font !== undefined) this.options.font = options.font
    if (options.fontSize !== undefined) this.fontSize = options.fontSize
    if (options.letterSpacing !== undefined) this.options.letterSpacing = options.letterSpacing
    if (options.map !== undefined) this.map = options.map
    if (options.text !== undefined) this.options.text = options.text
    if (options.width !== undefined) this.width = options.width

    const geomOptions = { ...this.options }
    switch (this.align) {
      case 'TL':
      case 'CL':
      case 'BL':
        geomOptions.align = 'left'
        break
      case 'TC':
      case 'CC':
      case 'BC':
        geomOptions.align = 'center'
        break
      case 'TR':
      case 'CR':
      case 'BR':
        geomOptions.align = 'right'
        break
    }
    this.geometry.update(geomOptions)
    this.width = this.geometry.width
    this.height = this.geometry.height

    const { layout } = this.geometry
    this.yOffset = layout.height

    const scale = this.options.fontSize / this.options.font.info.size
    this.mesh.scale.setScalar(scale)
  }

  reposition(width: number, height: number): void {
    const cw = width / 2
    const ch = height / 2
    let x = 0
    let y = 0
    const scale = this.mesh.scale.x
    const meshWidth = this.width * scale

    const left = this.anchor.x
    const centerX = cw - (this.width / 2 + this.anchor.x) * scale
    const right = width - meshWidth - this.anchor.x
    const top = (this.yOffset + this.anchor.y) * -scale
    const centerY = -(ch - (this.height / 2 + this.anchor.y) * scale)
    const bottom = -(height - this.anchor.y)
    switch (this.align) {
      case 'TL':
        x = left
        y = top
        break
      case 'TC':
        x = centerX
        y = top
        break
      case 'TR':
        x = right
        y = top
        break
      case 'CL':
        x = left
        y = centerY
        break
      case 'CC':
        x = centerX
        y = centerY
        break
      case 'CR':
        x = right
        y = centerY
        break
      case 'BL':
        x = left
        y = bottom
        break
      case 'BC':
        x = centerX
        y = bottom
        break
      case 'BR':
        x = right
        y = bottom
        break
    }
    this.container.position.set(x, y, 0)
  }

  private checkToUpdate() {
    if (this.options.font !== undefined) {
      this.update(this.options)
    }
  }

  // @ts-ignore
  get color(): Color {
    return this.material.color
  }

  // @ts-ignore
  get fontSize(): number {
    return this.options.fontSize
  }

  // @ts-ignore
  get map(): Texture | null {
    return this.material.map
  }

  // @ts-ignore
  get opacity(): number {
    return this.material.alpha
  }

  // @ts-ignore
  get letterSpacing(): number {
    return this.options.letterSpacing
  }

  // @ts-ignore
  get text(): string {
    return this.options.text
  }

  // @ts-ignore
  set color(value: Color) {
    this.material.color = value
  }

  // @ts-ignore
  set fontSize(value: number) {
    this.options.fontSize = value
    // const scale = normalize(0, 42, value)
    // this.container.scale.setScalar(scale)
  }

  // @ts-ignore
  set map(value: Texture | null) {
    this.material.map = value
  }

  // @ts-ignore
  set opacity(value: number) {
    this.material.alpha = value
  }

  // @ts-ignore
  set letterSpacing(value: number) {
    this.options.letterSpacing = value
    this.checkToUpdate()
  }

  // @ts-ignore
  set text(value: string) {
    this.options.text = value
    this.checkToUpdate()
  }
}
