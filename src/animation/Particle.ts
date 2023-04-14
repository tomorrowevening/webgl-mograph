// Libs
import { Vector3 } from 'three'
// Utils
import { random } from '@/utils/math'

export default class Particle extends Vector3 {
  acc = new Vector3()
  vel = new Vector3()
  mass: number

  constructor(mass = random(1, 5), x?: number, y?: number, z?: number) {
    super(x, y, z)
    this.mass = mass
  }

  applyForce(force: Vector3) {
    this.acc.x += force.x / this.mass
    this.acc.y += force.y / this.mass
    this.acc.z += force.z / this.mass
  }

  update(delta: number, friction: number) {
    this.vel.add(this.acc)
    this.x += this.vel.x * delta
    this.y += this.vel.y * delta
    this.z += this.vel.z * delta
    this.vel.x -= this.vel.x * delta * friction
    this.vel.y -= this.vel.y * delta * friction
    this.vel.z -= this.vel.z * delta * friction
    this.acc.setScalar(0)
  }

  wrapParticle(bounds: Vector3) {
    if (this.x > bounds.x) this.x -= bounds.x * 2
    if (this.y > bounds.y) this.y -= bounds.y * 2
    if (this.z > bounds.z) this.z -= bounds.z * 2
    if (this.x < -bounds.x) this.x += bounds.x * 2
    if (this.y < -bounds.y) this.y += bounds.y * 2
    if (this.z < -bounds.z) this.z += bounds.z * 2
  }
}
