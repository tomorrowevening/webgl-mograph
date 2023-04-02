// Libs
import { Camera, EventDispatcher } from 'three'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls'
import { FolderApi } from 'tweakpane'
// Models
import webgl from '@/models/webgl'
// Utils
import { debugButton, debugFolder, debugInput, debugOptions } from '@/utils/debug'

export class TransformController extends EventDispatcher {
  static DRAG_START = 'Transform::dragStart'
  static DRAG_END = 'Transform::dragEnd'

  activeCamera!: Camera
  controls: Map<string, TransformControls> = new Map()
  private visibility: Map<string, boolean> = new Map()

  clear(): void {
    for (const controls of this.controls.values()) {
      controls.detach()
      controls.dispose()
      controls.parent?.remove(controls)
    }
    this.controls = new Map()
    this.visibility = new Map()
  }

  add(name: string, parentFolder?: FolderApi): TransformControls {
    let controls = this.controls.get(name)
    if (controls === undefined) {
      controls = new TransformControls(this.activeCamera, webgl.canvas)
      controls.name = name
      this.controls.set(name, controls)
      this.visibility.set(name, controls.visible)

      controls.addEventListener('mouseDown', () => {
        this.dispatchEvent({ type: TransformController.DRAG_START })
      })
      controls.addEventListener('mouseUp', () => {
        this.dispatchEvent({ type: TransformController.DRAG_END })
      })

      // Controls
      const folder = debugFolder('Controls', parentFolder)
      debugInput(folder, controls, 'enabled')
      debugInput(folder, controls, 'visible')
      debugOptions(
        folder,
        'Mode',
        [
          {
            text: 'translate',
            value: 'translate',
          },
          {
            text: 'rotate',
            value: 'rotate',
          },
          {
            text: 'scale',
            value: 'scale',
          },
        ],
        (value: string) => {
          // @ts-ignore
          controls.setMode(value)
        },
      )
      debugOptions(
        folder,
        'Space',
        [
          {
            text: 'world',
            value: 'world',
          },
          {
            text: 'local',
            value: 'local',
          },
        ],
        (value: string) => {
          // @ts-ignore
          controls.setSpace(value)
        },
      )
      debugButton(folder, 'Reset', controls.reset)
    }
    return controls
  }

  get(name: string): TransformControls | undefined {
    return this.controls.get(name)
  }

  remove(name: string): boolean {
    const controls = this.get(name)
    if (controls === undefined) return false
    controls.detach()
    controls.dispose()
    controls.parent?.remove(controls)
    this.controls.delete(name)
    return true
  }

  enabled(value: boolean) {
    this.controls.forEach((controls: TransformControls) => {
      controls.enabled = value
    })
  }

  updateCamera(camera: Camera): void {
    this.activeCamera = camera
    this.controls.forEach((controls: TransformControls) => {
      controls.camera = camera
    })
  }

  show() {
    this.controls.forEach((controls: TransformControls) => {
      const value = this.visibility.get(controls.name)
      if (value !== undefined) controls.visible = value
    })
  }

  hide() {
    this.controls.forEach((controls: TransformControls) => {
      this.visibility.set(controls.name, controls.visible)
      controls.visible = false
    })
  }
}

const Transformer = new TransformController()
export default Transformer
