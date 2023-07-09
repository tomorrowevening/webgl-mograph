// Libs
import { Mesh, OrthographicCamera, ShaderMaterial, Vector2 } from 'three'
import { gsap } from 'gsap'
// Models
import animation from '@/models/animation'
import webgl from '@/models/webgl'
// Views
import BaseScene from '../BaseScene'
import vertex from '@/glsl/default.vert'
import fragment from './lobby.frag'
// Utils
import { triangle } from '@/utils/three'

class LobbyMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        opacity: {
          value: 1,
        },
        resolution: {
          value: new Vector2(webgl.width, webgl.height),
        },
        time: {
          value: 0,
        },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
    })
  }

  get matOpacity(): number {
    return this.uniforms.opacity.value
  }

  set matOpacity(value: number) {
    this.uniforms.opacity.value = value
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

  constructor() {
    super('lobby')
    this.camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1)
    this.camera.name = 'lobbyCam'
  }

  protected override initMesh(): Promise<void> {
    return new Promise((resolve) => {
      this.mat = new LobbyMaterial()
      const mesh = new Mesh(triangle.clone(), this.mat)
      mesh.name = 'shaderMesh'
      this.world.add(mesh)
      resolve()
    })
  }

  protected override initAnimation(): Promise<void> {
    return new Promise((resolve) => {
      animation.sheet(this.name)
      resolve()
    })
  }

  override show(): void {
    super.show()
    this.post.enabled = false
    this.mat.matOpacity = 0
    gsap.to(this.mat, {
      matOpacity: 1,
      duration: 1,
      delay: 0.5,
    })
  }

  override hide(): void {
    this.disable()

    gsap.to(this, {
      duration: 2,
      ease: 'expo.inOut',
      transitionProgress: 1,
      onComplete: () => this.onHidden(),
    })
  }

  override update(): void {
    this.mat.time = this.clock.getElapsedTime()
    this.mat.uniforms.resolution.value.set(webgl.width, webgl.height)
  }
}
