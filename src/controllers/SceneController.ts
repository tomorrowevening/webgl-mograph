// Libs
import { Material, Mesh, PerspectiveCamera, OrthographicCamera, Texture, Vector2 } from 'three'
// Models
import { Events, IS_DEV, threeDispatcher } from '../models/constants'
import webgl from '../models/webgl'
import { Scenes, Transitions, UIAlign } from '../types'
// Views
import BaseScene from '../scenes/BaseScene'
import CompositeScene from '../scenes/composite'
import IntroScene from '../scenes/intro'
import CreditsScene from '../scenes/credits'
import UIScene from '../scenes/ui'
import UIMesh from '../mesh/UIMesh'
import TextMesh from '../mesh/TextMesh'
// Transitions
import Transition from '../materials/transitions/Transition'
import WipeTransition from '../materials/transitions/WipeTransition'
// Tools
import MultiCams from '../tools/MultiCams'
import SplineEditor from '../tools/SplineEditor'
// Utils
import { debugButton, debugLerp, debugOptions, scenesTab } from '../utils/debug'
import { dispose, orthoCamera, renderToTexture, triangle } from '../utils/three'
import Transformer from '../tools/Transformer'

class SceneController {
  // Scenes
  currentScene?: BaseScene | undefined
  previousScene?: BaseScene | undefined
  composite!: CompositeScene
  ui!: UIScene

  // Transitioning
  transition?: Transition | undefined
  transitionMesh?: Mesh | undefined

  // Tools
  multiCams?: MultiCams
  splineEditor?: SplineEditor

  init() {
    if (IS_DEV) this.initDebug()
    this.ui = new UIScene()
    this.composite = new CompositeScene()

    // Events
    threeDispatcher.addEventListener(Events.SCENE_SHOW, this.onSceneShow)
    threeDispatcher.addEventListener(Events.SCENE_HIDE, this.onSceneHide)
    threeDispatcher.addEventListener(Events.SCENE_HIDDEN, this.onSceneHidden)
  }

  initDebug() {
    const sceneOptions = [
      {
        text: '',
        value: '',
      },
      {
        text: 'Intro',
        value: 'intro',
      },
      {
        text: 'Credits',
        value: 'credits',
      },
    ]
    const transitionOptions = [
      {
        text: '',
        value: '',
      },
      {
        text: 'Wipe',
        value: 'wipe',
      },
    ]
    const transitionTo = {
      scene: '',
      transition: '',
    }
    debugOptions(scenesTab, 'Scene', sceneOptions, (value: any) => {
      transitionTo.scene = value
    })
    debugOptions(scenesTab, 'Transition', transitionOptions, (value: any) => {
      transitionTo.transition = value
    })
    debugButton(scenesTab, 'Transition', () => {
      if (transitionTo.scene.length > 0 && transitionTo.transition.length > 0) {
        console.log(`transition to: ${transitionTo.scene} with: ${transitionTo.transition}`)
        // @ts-ignore
        this.showScene(transitionTo.scene, transitionTo.transition)
      }
    })
    debugLerp(scenesTab, 'Progress', (progress: number) => {
      this.transitionProgress = progress
    })

    this.multiCams = new MultiCams((camera: PerspectiveCamera | OrthographicCamera) => {
      this.splineEditor!.camera = camera
      Transformer.updateCamera(camera)
      this.currentScene!.updateCamera(camera)
    })
    this.splineEditor = new SplineEditor()
  }

  dispose() {
    if (this.currentScene !== undefined) dispose(this.currentScene)
    if (this.previousScene !== undefined) dispose(this.previousScene)
    if (this.composite !== undefined) dispose(this.composite)
    if (this.ui !== undefined) dispose(this.ui)
    if (IS_DEV) {
      this.splineEditor?.dispose()
    }
  }

  update() {
    this.previousScene?.update()
    this.currentScene?.update()
    if (IS_DEV) this.multiCams?.update()
  }

  draw() {
    if (this.previousScene !== undefined) {
      const prevRT = webgl.renderTargets.get('previousScene')!
      this.previousScene?.draw(prevRT)
    }

    const currentRT = webgl.renderTargets.get('currentScene')!
    this.currentScene?.draw(currentRT)

    if (this.transition !== undefined) {
      const transitionRT = webgl.renderTargets.get('transition')!
      renderToTexture(this.transitionMesh!, orthoCamera, transitionRT)
    }

    this.ui.draw()
    this.composite.draw()
    this.currentScene?.postDraw()
  }

  resize(width: number, height: number) {
    this.previousScene?.resize(width, height)
    this.currentScene?.resize(width, height)
    this.ui.resize(width, height)
    this.composite.resize(width, height)
    if (IS_DEV) {
      this.multiCams?.resize(width, height)
    }
  }

  showScene(name: Scenes, transition?: Transitions): void {
    threeDispatcher.dispatchEvent({ type: Events.SCENE_SHOW, scene: name, transition: transition })
  }

  //////////////////////////////////////////////////
  // UI

  addMesh(
    name: string,
    width: number,
    height: number,
    texture: Texture | null,
    align: UIAlign = 'TL',
    anchor = new Vector2(),
    material?: Material,
  ): UIMesh {
    return this.ui.addMesh(name, width, height, texture, align, anchor, material)
  }

  addText(name: string, options: any): TextMesh {
    return this.ui.addText(name, options)
  }

  //////////////////////////////////////////////////
  // Events

  /**
   * Create the new scene instance.
   * If a `currentScene` exists, move to `previousScene` and prepare for hiding.
   */
  private onSceneShow = (evt: any) => {
    const sceneName = evt.scene as Scenes
    let newScene: BaseScene | undefined = undefined
    switch (sceneName) {
      case 'credits':
        newScene = new CreditsScene()
        break
      case 'intro':
        newScene = new IntroScene()
        break
    }

    if (evt.transition !== undefined) {
      const transitionName = evt.transition as Transitions
      switch (transitionName) {
        case 'wipe':
          this.transition = new WipeTransition()
          break
      }

      this.transitionMesh = new Mesh(triangle.clone(), this.transition)
      this.composite.transitioning = true
    }
    // Ensure there's a scene to be shown
    if (newScene !== undefined) {
      if (this.currentScene !== undefined) {
        this.previousScene = this.currentScene
      }

      this.currentScene = newScene
      this.currentScene.init().then(() => {
        if (IS_DEV) {
          Transformer.clear()

          // Multi-Cameras
          this.multiCams?.clearCameras()
          this.currentScene!.utils.add(this.multiCams!)
          this.multiCams?.addCamera(this.currentScene!.camera)

          // Splines
          this.splineEditor!.dispose()
          this.currentScene!.utils.add(this.splineEditor!)
          this.splineEditor!.camera = this.currentScene!.camera
          this.splineEditor!.initDebug()
        }
        threeDispatcher.dispatchEvent({ type: Events.SCENE_HIDE })
        this.currentScene!.show()
      })
    }
  }

  /**
   * Either transition-out or prepare to dispose
   */
  private onSceneHide = (evt: any) => {
    this.previousScene?.hide()
  }

  /**
   * Clear from memory
   */
  private onSceneHidden = (evt: any) => {
    if (this.previousScene !== undefined) {
      dispose(this.previousScene)
    }
    if (this.transition !== undefined) {
      dispose(this.transitionMesh!)
      this.transition = undefined
      this.transitionMesh = undefined
      this.composite.transitioning = false
    }
    this.previousScene = undefined
  }

  //////////////////////////////////////////////////
  // Getters / Setters

  get transitionProgress(): number {
    return this.transition !== undefined ? this.transition.progress : 0
  }

  set transitionProgress(value: number) {
    if (this.transition !== undefined) this.transition.progress = value
  }
}

const scenes = new SceneController()
export default scenes
