// Libs
import { Vector3 } from 'three'
// Animation
import Particle from './Particle'

export default class Magnet extends Vector3 {
  radius: number
  strength: number

  constructor(radius: number, strength: number, x?: number, y?: number, z?: number) {
    super(x, y, z)
    this.radius = radius
    this.strength = strength
  }

  calculateForce(particle: Particle): Vector3 {
    const force = new Vector3()
    const radius = this.radius + particle.mass
    const dist = particle.distanceTo(this)
    if (dist > radius) return force

    // Distance-based force
    const distToCenter = 1 - dist / radius
    const strength = distToCenter * this.strength
    force.copy(particle)
    force.sub(this)
    force.normalize()
    force.multiplyScalar(strength)

    return force
  }
}
