// Libs
import { Clock, Mesh, MeshBasicMaterial, OrthographicCamera, ShaderMaterial } from 'three'
import { gsap } from 'gsap'
// Views
import BaseScene from '../BaseScene'
import vertex from '../../glsl/default.vert'
import fragment from './lobby.frag'
// Utils
import { triangle } from '../../utils/three'

class LobbyMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        brightness: {
          value: 1,
        },
        time: {
          value: 0,
        },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    })
  }

  get brightness(): number {
    return this.uniforms.brightness.value
  }

  set brightness(value: number) {
    this.uniforms.brightness.value = value
  }

  get time(): number {
    return this.uniforms.time.value
  }

  set time(value: number) {
    this.uniforms.time.value = value
  }
}

export default class LobbyScene extends BaseScene {
  private mat!: LobbyMaterial
  private clock: Clock

  constructor() {
    super('lobby')
    this.camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1)
    this.camera.name = 'lobbyCam'
    this.clock = new Clock()
  }

  protected override initMesh(): Promise<void> {
    return new Promise((resolve) => {
      this.mat = new LobbyMaterial()
      const mesh = new Mesh(triangle.clone(), this.mat)
      this.world.add(mesh)
      resolve()
    })
  }

  override show(): void {
    super.show()
    this.clock.start()
    this.mat.brightness = 0
    gsap.to(this.mat, {
      brightness: 1,
      duration: 2,
      delay: 0.5,
    })
  }

  override hide(): void {
    this.disable()

    gsap.to(this, {
      duration: 1,
      ease: 'expo.inOut',
      transitionProgress: 1,
      onComplete: () => this.onHidden(),
    })
  }

  override update(): void {
    this.mat.time = this.clock.getElapsedTime()
  }
}
