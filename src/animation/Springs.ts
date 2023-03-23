import { Vector2, Vector3 } from 'three'

export class Spring {
  value = 0
  target = 0
  velocity = 0
  mass: number
  damping: number

  constructor(value: number, mass = 100, damping = 0.9875) {
    this.value = value
    this.mass = mass
    this.damping = damping
  }

  update(delta: number) {
    const acceleration = (this.target - this.value) / this.mass
    this.velocity += acceleration * delta
    this.velocity *= this.damping
    this.value += this.velocity * delta
  }
}

export class Spring2 extends Vector2 {
  target = new Vector2()
  velocity = new Vector2()
  mass: number
  damping: number

  constructor(x?: number, y?: number, mass = 100, damping = 0.9875) {
    super(x, y)
    this.mass = mass
    this.damping = damping
  }

  update(delta: number) {
    const acceleration = new Vector2().subVectors(this.target, this)
    acceleration.divideScalar(this.mass)
    this.velocity.add(acceleration.multiplyScalar(delta))
    this.velocity.multiplyScalar(this.damping)
    this.add(this.velocity.multiplyScalar(delta))
  }
}

export class Spring3 extends Vector3 {
  target = new Vector3()
  velocity = new Vector3()
  mass: number
  damping: number

  constructor(x?: number, y?: number, z?: number, mass = 100, damping = 0.9875) {
    super(x, y, z)
    this.mass = mass
    this.damping = damping
  }

  update(delta: number) {
    const acceleration = new Vector3().subVectors(this.target, this)
    acceleration.divideScalar(this.mass)
    this.velocity.add(acceleration.multiplyScalar(delta))
    this.velocity.multiplyScalar(this.damping)
    this.add(this.velocity.multiplyScalar(delta))
  }
}
