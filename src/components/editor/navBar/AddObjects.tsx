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
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
// Models
import { Events, debugDispatcher } from '@/models/constants'
// Views
import Dropdown from '../components/Dropdown'
import { DropdownOption } from '../components/types'
// Controllers
import scenes from '@/controllers/SceneController'
// Tools / Utils
import Inspector from '@/tools/Inspector'
import { FileUploadResponse, uploadFile } from '@/utils/dom'
import { strNum } from '@/utils/math'
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
  const prompParams = prompt('Name', '')
  if (prompParams === null || prompParams === '') return
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
    light.name = prompParams
    scenes.currentScene?.lights.add(light)
    debugDispatcher.dispatchEvent({ type: Events.UPDATE_HIERARCHY })
    debugDispatcher.dispatchEvent({ type: Inspector.SELECT, value: light })
  }
}

const objs = ['Plane', 'Cube', 'Sphere', 'GLTF', 'Spline', 'Text']
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
  let prompParams: string | null
  let params: Array<string>
  switch (type) {
    case objs[0]:
      prompParams = prompt('Width, Height, X Segments, Y Segments', '1, 1, 1, 1')
      if (prompParams === null || prompParams === '') return
      params = prompParams.replaceAll(' ', '').split(',')
      geom = new PlaneGeometry(strNum(params[0]), strNum(params[1]), strNum(params[2]), strNum(params[3]))
      break
    case objs[1]:
      prompParams = prompt('Width, Height, Depth, X Segments, Y Segments, Z Segments', '1, 1, 1, 1, 1, 1')
      if (prompParams === null || prompParams === '') return
      params = prompParams.replaceAll(' ', '').split(',')
      geom = new BoxGeometry(
        strNum(params[0]),
        strNum(params[1]),
        strNum(params[2]),
        strNum(params[3]),
        strNum(params[4]),
        strNum(params[5]),
      )
      break
    case objs[2]:
      prompParams = prompt('Radius, Width Segments, Height Segments', '1, 32, 16')
      if (prompParams === null || prompParams === '') return
      params = prompParams.replaceAll(' ', '').split(',')
      geom = new SphereGeometry(strNum(params[0]), strNum(params[1]), strNum(params[2]))
      break
    case objs[3]:
      uploadFile().then((response: FileUploadResponse) => {
        const { file, fileReader } = response
        const result = fileReader.result
        const fileName = file.name.substring(0, file.name.indexOf('.'))
        if (file.name.search('.gltf') > -1 || file.name.search('.glb') > -1) {
          try {
            new GLTFLoader().parse(
              result!,
              '',
              (gltf: GLTF) => {
                const addedObject = gltf.scene
                if (!addedObject) {
                  console.log('> No scene in GLTF:', gltf)
                  return
                }
                if (addedObject.name?.length === 0) addedObject.name = fileName
                debugDispatcher.dispatchEvent({ type: Events.ADD_GLTF, value: gltf })
              },
              () => {
                console.log('error loading')
              },
            )
          } catch (err: any) {
            console.log('Error parsing GLTF, try loading file instead:', fileName)
            console.log('file:', file)
            console.log('result:', result)
          }
        }
      })
      break
    case objs[4]:
      debugDispatcher.dispatchEvent({ type: Events.ADD_SPLINE })
      break
    case objs[5]:
      debugDispatcher.dispatchEvent({ type: Events.ADD_TEXT })
      break
  }
  if (geom !== undefined) {
    prompParams = prompt('Name', '')
    if (prompParams === null || prompParams === '') return
    const mesh = new Mesh(geom, new MeshBasicMaterial())
    mesh.name = prompParams
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
      console.log('StrokeMaterial requires the following attributes: lineMiter, lineNormal, and lineDistance')
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
