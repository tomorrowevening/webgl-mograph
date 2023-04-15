// Libs
import {
  Camera,
  CameraHelper,
  Color,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  Scene,
  Vector2,
  Vector4,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FolderApi } from 'tweakpane'
// Models
import webgl from '@/models/webgl'
// Views
import BaseScene from '@/scenes/BaseScene'
// Tools / Utils
import Transformer, { TransformController } from './Transformer'
import {
  debugBlade,
  debugButton,
  debugCamera,
  debugColor,
  debugFolder,
  debugInput,
  debugOptions,
  debugToggle,
  toolsTab,
} from '@/utils/debug'
import { dispose } from '@/utils/three'
import { Events, debugDispatcher } from '@/models/constants'
import InfiniteGridHelper from '@/mesh/helpers/InfiniteGridHelper'
import scenes from '@/controllers/SceneController'

export type WindowParams = {
  index: number
  name: string
  camera?: PerspectiveCamera | OrthographicCamera
  pos: Vector2
  size: number
}

export type MultiCamsMode = 'default' | 'quadCam'

export default class MultiCams extends Object3D {
  onChange?: (camera: PerspectiveCamera | OrthographicCamera) => void
  orbits: Map<string, OrbitControls> = new Map()
  cameras: Map<string, PerspectiveCamera | OrthographicCamera> = new Map()
  helpers: Map<string, CameraHelper> = new Map()
  debugFolder!: FolderApi
  windowColor = new Color(0x242529)
  mode: MultiCamsMode = 'default'

  // Quad Cameras
  tlCam?: Camera
  trCam?: Camera
  blCam?: Camera
  brCam?: Camera

  private _activeCamera?: PerspectiveCamera | OrthographicCamera
  private multiCamContainer: Object3D
  private camerasContainer: Object3D
  private helperContainer: Object3D
  private _enabled = false
  private orbitEnabled = false
  private orbitScreenSpace = true
  private currentOrbit?: OrbitControls
  private debugIndex: number
  private windows: Array<WindowParams> = []
  private addedCameras: Array<string> = []
  private grid: InfiniteGridHelper
  private gridPanel: any = undefined

  constructor(onChange?: (camera: PerspectiveCamera | OrthographicCamera) => void, index = 1) {
    super()
    this.name = 'MultiCams'

    const w = window.innerWidth
    const h = window.innerHeight
    const left = w / -2
    const right = w / 2
    const top = h / 2
    const bottom = h / -2
    const near = 0
    const far = 3000
    this.debugIndex = index

    this.multiCamContainer = new Object3D()
    this.multiCamContainer.name = 'container'
    this.add(this.multiCamContainer)

    this.camerasContainer = new Object3D()
    this.camerasContainer.name = 'cameras'
    this.multiCamContainer.add(this.camerasContainer)

    this.helperContainer = new Object3D()
    this.helperContainer.name = 'helpers'
    this.multiCamContainer.add(this.helperContainer)
    this.onChange = onChange

    this.grid = new InfiniteGridHelper()
    this.grid.visible = false
    this.add(this.grid)

    const scale = 1000

    // Debug
    const debugCamera = new PerspectiveCamera(60, w / h, 2, 2000)
    debugCamera.name = 'debug'
    debugCamera.position.set(scale, scale, scale).divideScalar(4)
    debugCamera.lookAt(0, 0, 0)
    this.addCamera(debugCamera, true, false, false)

    // Ortho
    const orthoCamera = new OrthographicCamera(left, right, top, bottom, near, far)
    orthoCamera.name = 'ortho'
    orthoCamera.position.set(scale, scale, scale)
    orthoCamera.lookAt(0, 0, 0)
    this.addCamera(orthoCamera, true, false, false)

    // Left
    const leftCamera = new OrthographicCamera(left, right, top, bottom, near, far)
    leftCamera.name = 'left'
    leftCamera.position.set(-scale, 0, 0)
    leftCamera.lookAt(0, 0, 0)
    this.addCamera(leftCamera, false, false, false)

    // Right
    const rightCamera = new OrthographicCamera(left, right, top, bottom, near, far)
    rightCamera.name = 'right'
    rightCamera.position.set(scale, 0, 0)
    rightCamera.lookAt(0, 0, 0)
    this.addCamera(rightCamera, false, false, false)

    // Top
    const topCamera = new OrthographicCamera(left, right, top, bottom, near, far)
    topCamera.name = 'top'
    topCamera.position.set(0, scale, 0)
    topCamera.lookAt(0, 0, 0)
    this.addCamera(topCamera, false, false, false)

    // Front
    const frontCamera = new OrthographicCamera(left, right, top, bottom, near, far)
    frontCamera.name = 'front'
    frontCamera.position.set(0, 0, scale)
    frontCamera.lookAt(0, 0, 0)
    this.addCamera(frontCamera, false, false, false)

    // Back
    const backCamera = new OrthographicCamera(left, right, top, bottom, near, far)
    backCamera.name = 'back'
    backCamera.position.set(0, 0, -scale)
    backCamera.lookAt(0, 0, 0)
    this.addCamera(backCamera, false, false, false)

    this.trCam = orthoCamera
    this.blCam = leftCamera
    this.brCam = topCamera

    // TransformControls
    Transformer.addEventListener(TransformController.DRAG_START, this.onTransformDrag)
    Transformer.addEventListener(TransformController.DRAG_END, this.onTransformEnd)

    this.initDebug()
    debugDispatcher.addEventListener(Events.UPDATE_MULTICAMS, this.onUpdate)
    debugDispatcher.addEventListener(Events.SET_MULTICAMS_CAMERA, this.onSetCamera)
    debugDispatcher.addEventListener(Events.TOGGLE_ORBIT, this.onToggleOrbit)
  }

  dispose(): void {
    Transformer.removeEventListener(TransformController.DRAG_START, this.onTransformDrag)
    Transformer.removeEventListener(TransformController.DRAG_END, this.onTransformEnd)
    debugDispatcher.removeEventListener(Events.UPDATE_MULTICAMS, this.onUpdate)
    debugDispatcher.removeEventListener(Events.SET_MULTICAMS_CAMERA, this.onSetCamera)
    debugDispatcher.removeEventListener(Events.TOGGLE_ORBIT, this.onToggleOrbit)
    this.debugFolder.dispose()
  }

  changeScene(scene: BaseScene) {
    this.clearCameras()
    this.debugFolder.dispose()

    this.initDebug()
    scene.utils.add(this)
    scene.cameras.children.forEach((obj: Object3D) => {
      if (obj instanceof PerspectiveCamera || obj instanceof OrthographicCamera) {
        this.addCamera(obj)
      }
    })
  }

  resize(width: number, height: number): void {
    const w = width / 2
    const h = height / 2
    for (const camera of this.cameras.values()) {
      // @ts-ignore
      this.updateCamera(camera, w, h)
    }
  }

  addCamera(
    camera: PerspectiveCamera | OrthographicCamera,
    enableRotate = true,
    reloadDebug = true,
    sceneCamera = true,
  ): OrbitControls {
    this.cameras.set(camera.name, camera)

    if (camera.parent === null) {
      this.camerasContainer.add(camera)
    }

    if (sceneCamera) this.addedCameras.push(camera.name)

    // Helper
    const addHelper = enableRotate || reloadDebug
    if (camera.type === 'PerspectiveCamera' && addHelper) {
      const helper = new CameraHelper(camera)
      helper.name = `${camera.name}Helper`
      helper.visible = false
      this.helpers.set(camera.name, helper)
      this.helperContainer.add(helper)
    }

    // Orbit
    const orbit = new OrbitControls(camera, webgl.canvas)
    orbit.enabled = false
    orbit.enableDamping = true
    orbit.enableRotate = enableRotate
    this.orbits.set(camera.name, orbit)
    if (reloadDebug) this.initDebug()
    return orbit
  }

  removeCamera(name: string) {
    const camera = this.camerasContainer.getObjectByName(name)
    if (camera !== undefined) this.camerasContainer.remove(camera)
    const helper = this.helperContainer.getObjectByName(`${name}Helper`)
    if (helper !== undefined) {
      this.helperContainer.remove(helper)
      dispose(helper)
    }
    this.helpers.get(name)?.dispose()
    this.helpers.delete(name)
    this.orbits.get(name)?.dispose()
    this.orbits.delete(name)
    this.cameras.delete(name)
  }

  clearCameras() {
    this.addedCameras.forEach((name: string) => {
      this.removeCamera(name)
    })
    this.addedCameras = []
    this.activeCamera = undefined
  }

  update(): void {
    this.currentOrbit?.update()
  }

  private renderScene(scene: Scene, camera: Camera, size: number, x: number, y: number): void {
    const renderer = webgl.renderer
    const maxWidth = renderer.domElement.width / webgl.dpr
    const maxHeight = renderer.domElement.height / webgl.dpr
    const aspect = maxWidth / maxHeight
    const height = Math.round((1 / aspect) * size)
    const _x = Math.round(x)
    const _y = Math.round(maxHeight - height - y)

    // Other camera
    renderer.setViewport(_x, _y, size, height)
    renderer.setScissor(_x, _y, size, height)
    renderer.render(scene, camera)
  }

  quadCams(scene: BaseScene) {
    if (this.tlCam === undefined || this.trCam === undefined || this.blCam === undefined || this.brCam === undefined) {
      return
    }

    // Store original
    const scissor = new Vector4()
    const viewport = new Vector4()
    const scissorTest = webgl.renderer.getScissorTest()
    const clearColor = new Color()
    webgl.renderer.getViewport(viewport)
    webgl.renderer.getScissor(scissor)
    webgl.renderer.getClearColor(clearColor)
    //
    const w = webgl.width / 2
    const y = webgl.height - webgl.height / 2
    // const debug = this.cameras.get('debug')!
    // const top = this.cameras.get('top')!
    // const right = this.cameras.get('right')!
    // scene.camera
    this.renderScene(scene, this.tlCam, w, 0, 0)
    this.renderScene(scene, this.trCam, w, w, 0)
    this.renderScene(scene, this.blCam, w, 0, y)
    this.renderScene(scene, this.brCam, w, w, y)

    // Reset
    webgl.renderer.setViewport(viewport)
    webgl.renderer.setScissor(scissor)
    webgl.renderer.setScissorTest(scissorTest)
    webgl.renderer.setClearColor(clearColor)
  }

  postRender(scene: Scene): void {
    if (this.windows.length < 0) return
    if (this.mode === 'quadCam') return

    // Reset values
    const scissor = new Vector4()
    const viewport = new Vector4()
    const scissorTest = webgl.renderer.getScissorTest()
    const clearColor = new Color()
    webgl.renderer.getViewport(viewport)
    webgl.renderer.getScissor(scissor)
    webgl.renderer.getClearColor(clearColor)

    // Contain windows
    Transformer.hide()
    webgl.renderer.setScissorTest(true)
    webgl.renderer.setClearColor(this.windowColor)
    this.windows.forEach((_window: WindowParams) => {
      const { camera, size, pos } = _window
      if (camera !== undefined) {
        this.renderScene(scene, camera, size, pos.x, pos.y)
      }
    })

    // Reset
    Transformer.show()
    webgl.renderer.setViewport(viewport)
    webgl.renderer.setScissor(scissor)
    webgl.renderer.setScissorTest(scissorTest)
    webgl.renderer.setClearColor(clearColor)
  }

  private addWindow = (parentFolder: any): WindowParams => {
    const pos = new Vector2(10, 10)
    let size = 160
    let index = 0
    if (this.windows.length > 0) {
      const lastWindow = this.windows[this.windows.length - 1]
      index = lastWindow.index + 1
      size = lastWindow.size
      const nextX = lastWindow.pos.x + lastWindow.size
      const nextY = lastWindow.pos.y + lastWindow.size
      if (nextX < window.innerWidth) {
        pos.set(nextX, lastWindow.pos.y)
      } else {
        pos.set(lastWindow.pos.x, nextY)
      }
    }
    const newWindow = {
      name: `Window #${index}`,
      index: index,
      camera: undefined,
      pos: pos,
      size: size,
    }
    this.windows.push(newWindow)

    // Cameras
    const cameraOptions: Array<any> = [{ text: 'None', value: -1 }]
    index = 0
    for (const camera of this.cameras.values()) {
      cameraOptions.push({
        text: camera.name,
        value: index,
      })
      index++
    }

    const folder = debugFolder(newWindow.name, parentFolder)
    debugOptions(folder, 'Camera', cameraOptions, (value: number) => {
      const camIndex = value + 1
      if (value < 0) {
        newWindow.camera = undefined
      } else {
        // @ts-ignore
        newWindow.camera = this.cameras.get(cameraOptions[camIndex].text)
      }
    })
    debugInput(folder, newWindow, 'pos', {
      x: {
        min: 0,
        max: window.innerWidth,
        step: 1,
      },
      y: {
        min: 0,
        max: window.innerHeight,
        step: 1,
      },
    })
    debugInput(folder, newWindow, 'size', {
      min: 128,
      max: Math.min(window.innerHeight, window.innerWidth),
      step: 1,
    })
    debugButton(folder, 'Remove Window', () => {
      // Remove from array
      const total = this.windows.length
      for (let i = 0; i < total; i++) {
        if (this.windows[i].name === newWindow.name) {
          this.windows.splice(i, 1)
          break
        }
      }
      // Remove from GUI
      folder.dispose()
    })

    return newWindow
  }

  private initDebug() {
    if (this.debugFolder !== undefined) {
      this.debugFolder.dispose()
    }

    this.debugFolder = debugFolder('Cameras', toolsTab, { index: this.debugIndex })
    const cameraOptions: Array<string> = []
    const cameraArr: Array<any> = []
    let longName = false
    for (const camera of this.cameras.values()) {
      if (camera.name.length > 10) longName = true
      cameraOptions.push(camera.name)
      cameraArr.push({
        text: camera.name,
        value: camera.name,
      })
    }
    const totalCameras = this.cameras.size
    const columns = longName ? 1 : 2
    const rows = Math.ceil(totalCameras / columns)
    debugBlade(this.debugFolder, {
      view: 'buttongrid',
      size: [columns, rows],
      cells: (column: number, row: number) => ({
        title: cameraOptions[columns * row + column],
      }),
      label: 'Camera',
      onChange: (value: any) => {
        const name = value.name
        let controlsEnabled = false
        if (this.currentOrbit !== undefined) {
          controlsEnabled = this.currentOrbit.enabled
          this.currentOrbit.enabled = false
        }
        const cam = this.cameras.get(name)
        this.activeCamera = cam

        if (this.currentOrbit !== undefined) {
          this.currentOrbit.enabled = controlsEnabled
          this.currentOrbit.screenSpacePanning = this.orbitScreenSpace
        }
        if (this.onChange !== undefined) this.onChange(this.activeCamera!)
      },
    })
    debugInput(this.debugFolder, this, 'enabled', {
      label: 'Orbit Controls',
    })
    debugInput(this.debugFolder, this, 'screenSpacePanning', {
      label: 'Screen Space',
    })
    debugToggle(this.debugFolder, 'Show Cameras', false, (value: boolean) => {
      for (const helper of this.helpers.values()) {
        helper.visible = value
      }
    })
    this.gridPanel = debugInput(this.debugFolder, this.grid, 'visible', { label: 'Show Infinite Grid' })

    const camerasFolder = debugFolder('Cameras', this.debugFolder)
    for (const camera of this.cameras.values()) {
      const helper = this.helpers.get(camera.name)
      debugCamera(camerasFolder, camera, helper)
    }

    const windowFolder = debugFolder('Windows', this.debugFolder)
    debugColor(windowFolder, this, 'windowColor', { label: 'Background' })
    debugButton(windowFolder, 'Add Window', () => {
      this.addWindow(windowFolder)
    })

    this.tlCam = scenes.currentScene?.camera

    debugOptions(
      this.debugFolder,
      'TL Cam',
      cameraArr,
      (value: string) => {
        const camera = this.cameras.get(value)
        if (camera !== undefined) this.tlCam = camera
      },
      this.tlCam,
    )
    debugOptions(
      this.debugFolder,
      'TR Cam',
      cameraArr,
      (value: string) => {
        const camera = this.cameras.get(value)
        if (camera !== undefined) this.trCam = camera
      },
      this.trCam,
    )
    debugOptions(
      this.debugFolder,
      'BL Cam',
      cameraArr,
      (value: string) => {
        const camera = this.cameras.get(value)
        if (camera !== undefined) this.blCam = camera
      },
      this.blCam,
    )
    debugOptions(
      this.debugFolder,
      'BR Cam',
      cameraArr,
      (value: string) => {
        const camera = this.cameras.get(value)
        if (camera !== undefined) this.brCam = camera
      },
      this.brCam,
    )
  }

  private updateCamera(camera: OrthographicCamera | PerspectiveCamera, width: number, height: number): void {
    if (camera.type === 'OrthographicCamera') {
      const cam = camera as OrthographicCamera
      cam.left = width / -2
      cam.right = width / 2
      cam.top = height / 2
      cam.bottom = height / -2
    } else {
      camera.aspect = width / height
    }
    camera.updateProjectionMatrix()
  }

  private onTransformDrag = () => {
    this.orbitEnabled = this.enabled
    this.enabled = false
  }

  private onTransformEnd = () => {
    this.enabled = this.orbitEnabled
  }

  private onUpdate = (evt: any) => {
    const value = evt.value
    if (value === 'addCamera') {
      const newCamera = scenes.currentScene?.camera.clone()
      if (newCamera !== undefined) {
        if (newCamera.name.length > 0) {
          newCamera.name += ' clone'
        } else {
          newCamera.name = `cam ${newCamera.type}`
        }
        this.addCamera(newCamera)
      }
    } else {
      this.grid.visible = value === 'quadView'
      this.mode = this.grid.visible ? 'quadCam' : 'default'
    }
    this.gridPanel.refresh()
  }

  private onSetCamera = (evt: any) => {
    const camera = this.cameras.get(evt.value)
    if (camera !== undefined) {
      this.activeCamera = camera
      scenes.currentScene?.updateCamera(camera)
    }
  }

  private onToggleOrbit = () => {
    this.enabled = !this.enabled
  }

  set enabled(value: boolean) {
    this._enabled = value
    if (this.currentOrbit !== undefined) this.currentOrbit.enabled = value
  }

  get enabled(): boolean {
    return this._enabled
  }

  set screenSpacePanning(value: boolean) {
    this.orbitScreenSpace = value
    if (this.currentOrbit !== undefined) this.currentOrbit.screenSpacePanning = value
  }

  get screenSpacePanning(): boolean {
    return this.orbitScreenSpace
  }

  get activeCamera(): PerspectiveCamera | OrthographicCamera | undefined {
    return this._activeCamera
  }

  set activeCamera(value: PerspectiveCamera | OrthographicCamera | undefined) {
    this._activeCamera = value
    this.tlCam = value
    if (value !== undefined) {
      Transformer.updateCamera(value)
      this.currentOrbit = this.orbits.get(value.name)
      if (this.currentOrbit !== undefined) {
        this.currentOrbit.enabled = this.orbitEnabled
        this.currentOrbit.screenSpacePanning = this.orbitScreenSpace
      }
    } else {
      this.currentOrbit = undefined
    }
  }
}
