// Libs
import { Camera, Light, Mesh, Object3D, SkeletonHelper } from 'three'
import { degToRad } from 'three/src/math/MathUtils'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FolderApi } from 'tweakpane'
// Models
import { debugDispatcher, Events } from '@/models/constants'
// Tools
import ClickToInspect from './ClickToInspect'
import Transformer from './Transformer'
// Utils
import {
  debugButton,
  debugCamera,
  debugFile,
  debugFolder,
  debugInput,
  debugLight,
  debugMaterial,
  toolsTab,
} from '@/utils/debug'
import { dispose } from '@/utils/three'
import { delay } from '@/utils/dom'
import BaseScene from '@/scenes/BaseScene'

const transformControlsName = 'Transform Controls'

export default class Inspector extends Object3D {
  static SELECT = 'Inspector::select'
  static SINGLE_CLICK = 'Inspector::singleClick'
  static TOGGLE_CLICK = 'Inspector::toggleClick'
  static CONTROLS_TRANSLATE = 'Inspector::controlsTranslate'
  static CONTROLS_ROTATE = 'Inspector::controlsRotate'
  static CONTROLS_SCALE = 'Inspector::controlsScale'
  static SET_MATERIAL = 'Inspector::setMaterial'

  transformControls!: TransformControls

  debugFolder!: FolderApi
  currentObject?: Object3D
  private skeletonHelper?: SkeletonHelper
  private posPane: any = undefined
  private rotPane: any = undefined
  private sclPane: any = undefined
  private clickInspector: ClickToInspect
  private singleClick = false

  constructor() {
    super()
    this.name = 'Inspector'
    this.clickInspector = new ClickToInspect()
    this.debugFolder = debugFolder('Inspector', toolsTab)
    debugDispatcher.addEventListener(Inspector.SELECT, this.insectorSelected)
    debugDispatcher.addEventListener(Inspector.SINGLE_CLICK, this.onSingleClick)
    debugDispatcher.addEventListener(Inspector.TOGGLE_CLICK, this.onToggleClick)
    debugDispatcher.addEventListener(Inspector.CONTROLS_ROTATE, this.onToggleRotate)
    debugDispatcher.addEventListener(Inspector.CONTROLS_SCALE, this.onToggleScale)
    debugDispatcher.addEventListener(Inspector.CONTROLS_TRANSLATE, this.onToggleTranslate)
    debugDispatcher.addEventListener(Inspector.SET_MATERIAL, this.onSetMaterial)
  }

  dispose() {
    document.body.removeEventListener('keydown', this.onKeyboardDown)
    document.body.removeEventListener('keyup', this.onKeyboardUp)
    debugDispatcher.removeEventListener(Inspector.SELECT, this.insectorSelected)
    debugDispatcher.removeEventListener(Inspector.SINGLE_CLICK, this.onSingleClick)
    debugDispatcher.removeEventListener(Inspector.TOGGLE_CLICK, this.onToggleClick)
    debugDispatcher.removeEventListener(Inspector.CONTROLS_ROTATE, this.onToggleRotate)
    debugDispatcher.removeEventListener(Inspector.CONTROLS_SCALE, this.onToggleScale)
    debugDispatcher.removeEventListener(Inspector.CONTROLS_TRANSLATE, this.onToggleTranslate)
    debugDispatcher.removeEventListener(Inspector.SET_MATERIAL, this.onSetMaterial)
    this.debugFolder.dispose()
  }

  private removeCurrent = () => {
    if (this.skeletonHelper !== undefined) {
      dispose(this.skeletonHelper)
      this.skeletonHelper = undefined
    }
    // @ts-ignore
    if (this.transformControls) {
      document.body.removeEventListener('keydown', this.onKeyboardDown)
      document.body.removeEventListener('keyup', this.onKeyboardUp)
      Transformer.remove(transformControlsName)
    }
    this.currentObject = undefined
    this.posPane = undefined
    this.rotPane = undefined
    this.sclPane = undefined

    // Remove folder
    // this.debugFolder.expanded = false
    const total = this.debugFolder.children.length - 1
    for (let i = total; i > -1; --i) {
      this.debugFolder.remove(this.debugFolder.children[i])
    }
  }

  setCurrentObject(obj?: Object3D) {
    if (obj === this.currentObject) return

    this.removeCurrent()
    this.currentObject = obj
    if (obj === undefined) return

    delay(0.1).then(() => {
      this.debugBasic()
      this.debugMaterial()
      this.debugChildren()
      this.debugTransform()
      this.debugCamera()
      this.debugLight()
      this.debugMesh()
      this.debugTransformControls()
      this.debugFolder.expanded = true
    })
  }

  get camera(): Camera | undefined {
    return this.clickInspector.camera
  }

  set camera(value: Camera | undefined) {
    this.clickInspector.camera = value
  }

  get scene(): Object3D | undefined {
    return this.clickInspector.scene
  }

  set scene(value: Object3D | undefined) {
    this.clickInspector.scene = value
  }

  changeScene(scene: BaseScene) {
    this.removeCurrent()
    this.scene = scene
    this.camera = scene.camera
    scene.utils.add(this)
    Transformer.updateCamera(this.camera)
  }

  private debugBasic(): void {
    try {
      debugButton(this.debugFolder, 'Delete', () => {
        if (this.currentObject !== undefined) {
          dispose(this.currentObject)
          this.removeCurrent()
          debugDispatcher.dispatchEvent({ type: Events.UPDATE_HIERARCHY })
        }
      })
      debugButton(this.debugFolder, 'Remove Controls', () => {
        this.removeCurrent()
      })

      debugFile(this.debugFolder, 'Replace Object', (result: any, file: File) => {
        // GLTF loading
        if (file.name.search('.gltf') > -1 || file.name.search('.glb') > -1) {
          new GLTFLoader().parse(
            result,
            '',
            (gltf: GLTF) => {
              // Remove previous
              const container = this.currentObject?.parent
              container?.remove(this.currentObject!)
              // Replace
              const updatedObject = gltf.scene
              container?.add(updatedObject)
              this.setCurrentObject(updatedObject)
            },
            () => {
              console.log('error loading')
            },
          )
        } else {
          console.log('Unsupported type:', file.name.split('.')[1], file.name)
        }
      })

      debugInput(this.debugFolder, this.currentObject, 'name', { label: 'Name' })
      debugInput(this.debugFolder, this.currentObject, 'type', { label: 'Type' })
      debugInput(this.debugFolder, this.currentObject, 'castShadow')
      debugInput(this.debugFolder, this.currentObject, 'receiveShadow')
    } catch (reason: any) {
      console.log('> debugBasic error:', reason)
    }
  }

  private debugMaterial(): void {
    try {
      if (this.currentObject instanceof Mesh) {
        const mesh = this.currentObject as Mesh
        debugInput(this.debugFolder, mesh.material, 'type', { label: 'Material', disabled: true })
      }
    } catch (reason: any) {
      console.log('> debugMaterial error:', reason)
    }
  }

  private debugChildren(): void {
    try {
      const obj = this.currentObject as Object3D
      if (obj.children.length > 0) {
        const childrenFolder = debugFolder('Children', this.debugFolder)
        const debugChild = (obj: Object3D) => {
          // const name = `- ${obj.parent?.name}:${obj.name}`
          let name = '- '
          try {
            if (obj.parent !== null && obj.parent.name.length > 0) {
              name += obj.parent?.name
              if (obj.name.length > 0) {
                name += ':' + obj.name
              }
            } else if (obj.name.length > 0) {
              name += obj.name
            } else {
              name += 'object'
            }
          } catch (_) {
            name += 'object'
          }
          debugButton(childrenFolder, name, () => {
            this.setCurrentObject(obj)
          })
        }
        const cycleChild = (obj: Object3D) => {
          debugChild(obj)
          obj.children.forEach((child: Object3D) => {
            debugChild(child)
            if (child.children.length > 0) cycleChild(child)
          })
        }
        cycleChild(obj)
      }
    } catch (reason: any) {
      console.log('> debugChildren error:', reason)
    }
  }

  private debugTransform(): void {
    try {
      const transformFolder = debugFolder('Transform', this.debugFolder)
      // if (this.sheet !== undefined) {
      //   animateProp(transformFolder, this.currentObject, this.sheet)
      // }
      debugInput(transformFolder, this.currentObject, 'visible')
      this.posPane = debugInput(transformFolder, this.currentObject, 'position')
      this.rotPane = debugInput(transformFolder, this.currentObject, 'rotation')
      this.sclPane = debugInput(transformFolder, this.currentObject, 'scale')
    } catch (reason: any) {
      console.log('> debugTransform error:', reason)
    }
  }

  private debugCamera(): void {
    try {
      const obj = this.currentObject as Object3D
      // @ts-ignore
      if (obj['isCamera']) {
        debugCamera(this.debugFolder, obj as Camera)
      }
    } catch (reason: any) {
      console.log('> debugCamera error:', reason)
    }
  }

  private debugLight(): void {
    try {
      // @ts-ignore
      if (this.currentObject['isLight']) {
        debugLight(this.debugFolder, this.currentObject as Light)
      }
    } catch (reason: any) {
      console.log('> debugLight error:', reason)
    }
  }

  private debugMesh(): void {
    try {
      const mesh = this.currentObject as Object3D
      // @ts-ignore
      let hasSkin = mesh['isSkinnedMesh']
      for (let i = 0; i < mesh.children.length; i++) {
        const child = mesh.children[i]
        // @ts-ignore
        if (child['isSkinnedMesh']) {
          hasSkin = true
          break
        }
      }
      if (hasSkin) {
        this.skeletonHelper = new SkeletonHelper(mesh)
        this.add(this.skeletonHelper)
      }
      // @ts-ignore
      if (mesh['isMesh'] !== undefined || mesh['isLine'] !== undefined) {
        // @ts-ignore
        debugMaterial(this.debugFolder, mesh, { sheet: this.sheet })
      }
    } catch (reason: any) {
      console.log('> debugMesh error:', reason)
    }
  }

  private debugTransformControls(): void {
    try {
      this.transformControls = Transformer.add(transformControlsName, this.debugFolder)
      this.transformControls.setSpace('local')
      this.add(this.transformControls)
      this.transformControls.addEventListener('change', () => {
        this.posPane.refresh()
        this.rotPane.refresh()
        this.sclPane.refresh()
      })
      this.transformControls.attach(this.currentObject!)
      document.body.addEventListener('keydown', this.onKeyboardDown, false)
      document.body.addEventListener('keyup', this.onKeyboardUp, false)
    } catch (reason: any) {
      console.log('> debugTransformControls error:', reason)
    }
  }

  // Events

  private insectorSelected = (evt: any) => {
    this.setCurrentObject(evt.value)
    if (this.singleClick) {
      this.singleClick = false
      this.clickInspector.enabled = false
    }
  }

  private onKeyboardDown = (evt: KeyboardEvent) => {
    if (!this.transformControls) return
    switch (evt.key) {
      case 't':
        this.transformControls.setMode('translate')
        break
      case 'r':
        this.transformControls.setMode('rotate')
        break
      case 's':
        this.transformControls.setMode('scale')
        break
      case 'q':
        this.transformControls.setSpace(this.transformControls.space === 'local' ? 'world' : 'local')
        break
      case 'Shift':
        this.transformControls.setTranslationSnap(1)
        this.transformControls.setRotationSnap(degToRad(15))
        this.transformControls.setScaleSnap(1)
        break
      case 'Escape':
        this.removeCurrent()
        break
    }
  }

  private onKeyboardUp = (evt: KeyboardEvent) => {
    if (!this.transformControls) return
    if (evt.key === 'Shift') {
      this.transformControls.setRotationSnap(null)
      this.transformControls.setScaleSnap(null)
      this.transformControls.setTranslationSnap(null)
    }
  }

  private onSingleClick = () => {
    this.singleClick = true
    this.clickInspector.enabled = true
  }

  private onToggleClick = () => {
    this.clickInspector.enabled = !this.clickInspector.enabled
    if (!this.clickInspector.enabled) this.removeCurrent()
  }

  private onToggleTranslate = () => {
    this.clickInspector.enabled = false
    this.transformControls.setMode('translate')
  }

  private onToggleRotate = () => {
    this.clickInspector.enabled = false
    this.transformControls.setMode('rotate')
  }

  private onToggleScale = () => {
    this.clickInspector.enabled = false
    this.transformControls.setMode('scale')
  }

  private onSetMaterial = (evt: any) => {
    if (this.currentObject !== undefined) {
      if (this.currentObject.type.search('Mesh') > -1) {
        // @ts-ignore
        this.currentObject.material = evt.value
        // Refresh GUI
        const prev = this.currentObject
        this.setCurrentObject(undefined)
        this.setCurrentObject(prev)
      }
    }
  }
}
