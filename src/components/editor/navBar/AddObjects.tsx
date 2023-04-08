// Libs
import {
  AmbientLight,
  BoxGeometry,
  CircleGeometry,
  DirectionalLight,
  Mesh,
  MeshBasicMaterial,
  MeshMatcapMaterial,
  MeshPhysicalMaterial,
  PlaneGeometry,
  PointLight,
  RectAreaLight,
  SphereGeometry,
  SpotLight,
} from 'three'
// Models
import { Events, debugDispatcher } from '@/models/constants'
// Views
import Dropdown from '../components/Dropdown'
import { DropdownOption } from '../components/types'
// Controllers
import scenes from '@/controllers/SceneController'
// Tools / Utils
import Inspector from '@/tools/Inspector'
import { delay } from '@/utils/dom'
import StrokeMaterial from '@/materials/StrokeMaterial'
import TPMeshBasicMaterial from '@/materials/textureProjection/TPMeshBasicMaterial'
import TPMeshPhysicalMaterial from '@/materials/textureProjection/TPMeshPhysicalMaterial'

const icon = `
<svg width="14" height="14" fill="none" stroke="white" stroke-linecap="round">
  <polyline points="12.5,3.67 7,1 1.5,3.67 1.5,10.33 7,13 7,6.33 12.5,3.67 12.5,10.33 7,13 7,6.33 1.5,3.67 "/>
</svg>
`

const lights = ['Ambient', 'Directional', 'Point', 'Rectangle', 'Spot']
const lightOptions: Array<DropdownOption> = []
lights.forEach((option: string) => {
  lightOptions.push({
    title: option,
    value: option,
    type: 'option',
  })
})

function addLight(type: string) {
  let light = undefined
  switch (type) {
    case lights[0]:
      light = new AmbientLight()
      break
    case lights[1]:
      light = new DirectionalLight()
      break
    case lights[2]:
      light = new PointLight()
      break
    case lights[3]:
      light = new RectAreaLight()
      break
    case lights[4]:
      light = new SpotLight()
      break
  }

  if (light !== undefined) {
    light.name = `light_${type.toLowerCase()}`
    scenes.currentScene?.lights.add(light)
    debugDispatcher.dispatchEvent({ type: Events.UPDATE_HIERARCHY })
    debugDispatcher.dispatchEvent({ type: Inspector.SELECT, value: light })
  }
}

const objs = ['Plane', 'Cube', 'Circle', 'Sphere']
const objOptions: Array<DropdownOption> = []
objs.forEach((option: string) => {
  objOptions.push({
    title: option,
    value: option,
    type: 'option',
  })
})

function addObj(type: string) {
  let geom = undefined
  switch (type) {
    case objs[0]:
      geom = new PlaneGeometry()
      break
    case objs[1]:
      geom = new BoxGeometry()
      break
    case objs[2]:
      geom = new CircleGeometry()
      break
    case objs[3]:
      geom = new SphereGeometry()
      break
  }
  if (geom !== undefined) {
    const mesh = new Mesh(geom, new MeshBasicMaterial())
    mesh.name = `mesh_${type}`
    scenes.currentScene?.world.add(mesh)
    debugDispatcher.dispatchEvent({ type: Events.UPDATE_HIERARCHY })
    debugDispatcher.dispatchEvent({ type: Inspector.SELECT, value: mesh })
  }
}

const materials = [
  // Three
  'Basic',
  'MatCap',
  'Physical',
  // Custom
  'Stroke',
  'TPBasic',
  'TPPhysical',
]
const materialOptions: Array<DropdownOption> = []
materials.forEach((option: string) => {
  materialOptions.push({
    title: option,
    value: option,
    type: 'option',
  })
})

function setMaterial(type: string) {
  let material = undefined
  switch (type) {
    // Three
    case materials[0]:
      material = new MeshBasicMaterial()
      break
    case materials[1]:
      material = new MeshMatcapMaterial()
      break
    case materials[2]:
      material = new MeshPhysicalMaterial()
      break
    // Custom
    case materials[3]:
      material = new StrokeMaterial()
      break
    case materials[4]:
      material = new TPMeshBasicMaterial()
      break
    case materials[5]:
      material = new TPMeshPhysicalMaterial()
      break
  }

  if (material !== undefined) {
    debugDispatcher.dispatchEvent({ type: Inspector.SET_MATERIAL, value: material })
  }
}

export default function AddObjects() {
  return (
    <Dropdown
      title={icon}
      options={[
        {
          title: 'Lights',
          type: 'dropdown',
          value: lightOptions,
          onSelect: addLight,
        },
        {
          title: 'Objects',
          type: 'dropdown',
          value: objOptions,
          onSelect: addObj,
        },
        {
          title: 'Materials',
          type: 'dropdown',
          value: materialOptions,
          onSelect: setMaterial,
        },
      ]}
    />
  )
}
