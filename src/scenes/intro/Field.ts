// Libs
import {
  BoxGeometry,
  DynamicDrawUsage,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Object3D,
  SphereGeometry,
  Vector3,
} from 'three'
// Animation
import Magnet from '@/animation/Magnet'
import Particle from '@/animation/Particle'
// Tools / Utils
import { random, random3 } from '@/utils/math'
import { debugFolder, debugInput } from '@/utils/debug'

const totalMagnets = 5
const totalParticles = 100
const maxGravity = 9.87 * 10
const dummy = new Object3D()

export default class Field extends Object3D {
  gravity = new Vector3(0, -9.87, 0)

  magnets: Array<Magnet> = []
  magnetMesh!: InstancedMesh

  particles: Array<Particle> = []
  particleMesh!: InstancedMesh
  particleFriction = 0.05
  wrapParticles = true
  particleBounds = new Vector3(1000, 500, 1000)
  particleBoundsMesh!: Mesh

  constructor() {
    super()
    this.name = 'field'
    this.initMagnets()
    this.initParticles()
  }

  private initMagnets() {
    const magnetGeom = new SphereGeometry()
    const magnetMaterial = new MeshBasicMaterial({ color: 0x0000ff, opacity: 0.2, transparent: true })
    this.magnetMesh = new InstancedMesh(magnetGeom, magnetMaterial, totalMagnets)
    this.magnetMesh.name = 'magnets'
    this.magnetMesh.instanceMatrix.setUsage(DynamicDrawUsage)
    this.add(this.magnetMesh)

    for (let i = 0; i < totalMagnets; i++) {
      const radius = random(100, 300)
      const magnet = new Magnet(radius, radius)
      magnet.copy(random3(-500, 500))
      this.magnets.push(magnet)

      dummy.position.copy(magnet)
      dummy.scale.setScalar(magnet.radius)
      dummy.updateMatrix()
      this.magnetMesh.setMatrixAt(i, dummy.matrix)
    }
    this.magnetMesh.instanceMatrix.needsUpdate = true
  }

  private initParticles() {
    const particleGeom = new SphereGeometry()
    const particleMaterial = new MeshPhysicalMaterial({ depthWrite: false })
    this.particleMesh = new InstancedMesh(particleGeom, particleMaterial, totalParticles)
    this.particleMesh.name = 'particles'
    this.particleMesh.instanceMatrix.setUsage(DynamicDrawUsage)
    this.add(this.particleMesh)

    for (let i = 0; i < totalParticles; i++) {
      const x = random(-this.particleBounds.x, this.particleBounds.x)
      const y = random(-this.particleBounds.y, this.particleBounds.y)
      const z = random(-this.particleBounds.z, this.particleBounds.z)
      const particle = new Particle(random(1, 20), x, y, z)
      this.particles.push(particle)

      // Mesh
      dummy.position.copy(particle)
      dummy.scale.setScalar(particle.mass)
      dummy.updateMatrix()
      this.particleMesh.setMatrixAt(i, dummy.matrix)
    }

    this.particleBoundsMesh = new Mesh(
      new BoxGeometry(2, 2, 2),
      new MeshBasicMaterial({ depthWrite: false, wireframe: true }),
    )
    this.particleBoundsMesh.name = 'particleBounds'
    this.particleBoundsMesh.scale.copy(this.particleBounds)
    this.add(this.particleBoundsMesh)
  }

  initDebug() {
    const folder = debugFolder('Field')
    debugInput(folder, this, 'particleFriction', {
      min: 0,
      max: 1,
    })
    debugInput(folder, this, 'gravity', {
      x: {
        min: -maxGravity,
        max: maxGravity,
      },
      y: {
        min: -maxGravity,
        max: maxGravity,
      },
      z: {
        min: -maxGravity,
        max: maxGravity,
      },
    })
    debugInput(folder, this, 'particleBounds', {
      onChange: () => {
        this.particleBoundsMesh.scale.copy(this.particleBounds)
      },
    })
    debugInput(folder, this, 'wrapParticles')

    const magnetFolder = debugFolder('Magnets', folder)
    const step = 5
    this.magnets.forEach((magnet: Magnet, index: number) => {
      const magFolder = debugFolder(`Magnet ${index + 1}`, magnetFolder)
      const params = {
        pos: magnet,
      }
      debugInput(magFolder, params, 'pos', {
        x: {
          step: step,
        },
        y: {
          step: step,
        },
        z: {
          step: step,
        },
        onChange: () => {
          magnet.copy(params.pos)
          dummy.position.copy(magnet)
          dummy.scale.setScalar(magnet.radius)
          dummy.updateMatrix()
          this.magnetMesh.setMatrixAt(index, dummy.matrix)
          this.magnetMesh.instanceMatrix.needsUpdate = true
        },
      })
      debugInput(magFolder, magnet, 'radius', {
        min: 1,
        max: 500,
        step: 1,
        onChange: () => {
          dummy.position.copy(magnet)
          dummy.scale.setScalar(magnet.radius)
          dummy.updateMatrix()
          this.magnetMesh.setMatrixAt(index, dummy.matrix)
          this.magnetMesh.instanceMatrix.needsUpdate = true
        },
      })
      debugInput(magFolder, magnet, 'strength', {
        min: -500,
        max: 500,
      })
    })
  }

  update(delta: number) {
    // Update particles + mesh
    this.particles.forEach((particle: Particle, index: number) => {
      // Physics
      this.magnets.forEach((magnet: Magnet) => {
        particle.applyForce(magnet.calculateForce(particle))
      })
      particle.applyForce(this.gravity)
      particle.update(delta, this.particleFriction)
      if (this.wrapParticles) particle.wrapParticle(this.particleBounds)
      // Mesh
      dummy.position.copy(particle)
      dummy.scale.setScalar(particle.mass)
      dummy.updateMatrix()
      this.particleMesh.setMatrixAt(index, dummy.matrix)
    })
    this.particleMesh.instanceMatrix.needsUpdate = true
  }
}
