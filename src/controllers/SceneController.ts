// Libs
import { Material, Mesh, PerspectiveCamera, OrthographicCamera, Texture, Vector2, Clock } from 'three'
import gsap from 'gsap'
// Models
import assets from '../models/assets'
import { Events, IS_DEV, threeDispatcher } from '../models/constants'
import webgl from '../models/webgl'
import { Scenes, Transitions, UIAlign } from '../types'
// Views
import LogoMaterial from '../materials/ui/LogoMaterial'
import UIMesh from '../mesh/UIMesh'
import TextMesh from '../mesh/TextMesh'
import BaseScene from '../scenes/BaseScene'
import CompositeScene from '../scenes/composite'
import LobbyScene from '../scenes/lobby'
import IntroScene from '../scenes/intro'
import CreditsScene from '../scenes/credits'
import UIScene from '../scenes/ui'
// Transitions
import Transition from '../materials/transitions/Transition'
import WipeTransition from '../materials/transitions/WipeTransition'
// Tools / Utils
import Inspector from '../tools/Inspector'
import MultiCams from '../tools/MultiCams'
import SplineEditor from '../tools/SplineEditor'
import Transformer from '../tools/Transformer'
import { debugButton, debugInput, debugLerp, debugOptions, scenesTab } from '../utils/debug'
import { sin } from '../utils/math'
import { dispose, orthoCamera, renderToTexture, saveCanvasToPNG, triangle } from '../utils/three'

class SceneController {
  // Scenes
  currentScene?: BaseScene | undefined
  previousScene?: BaseScene | undefined
  composite?: CompositeScene
  ui?: UIScene
  autoUpdateUI = true // true if there's gonna be animation or UI change
  private clock!: Clock
  private logo!: TextMesh

  // Transitioning
  transition?: Transition | undefined
  transitionMesh?: Mesh | undefined

  // Tools
  private inspector?: Inspector
  private multiCams?: MultiCams
  private splineEditor?: SplineEditor
  private saveScreenshot = false
  private currentSceneName = ''
  private currentScenePane?: any

  init() {
    this.ui = new UIScene()
    this.composite = new CompositeScene()

    this.clock = new Clock()
    this.clock.start()

    // Header
    const font = 'anurati'
    const fontData = assets.json.get(font)
    const fontTex = assets.textures.get(font).clone()
    const logoMat = new LogoMaterial({
      map: fontTex,
    })
    this.logo = scenes.addText('Header', {
      font: fontData,
      fontSize: 24,
      text: 'TOMORROW\nEVENING',
      material: logoMat,
    })
    this.logo.name = 'header'
    this.logo.position.set(20, -20, 0)
    logoMat.resolution = new Vector2(1 / this.logo.width, 1 / this.logo.height)
    logoMat.resolution.multiplyScalar(10)

    logoMat.alpha = 0
    gsap.to(logoMat, {
      duration: 3,
      delay: 1,
      alpha: 1,
    })

    // Events
    threeDispatcher.addEventListener(Events.SCENE_SHOW, this.onSceneShow)
    threeDispatcher.addEventListener(Events.SCENE_HIDE, this.onSceneHide)
    threeDispatcher.addEventListener(Events.SCENE_HIDDEN, this.onSceneHidden)

    if (IS_DEV) this.initDebug()
  }

  initDebug() {
    const sceneOptions = [
      {
        text: '',
        value: '',
      },
      {
        text: 'Lobby',
        value: 'lobby',
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
      transition: undefined,
    }
    debugButton(scenesTab, 'Save Screenshot', () => {
      this.saveScreenshot = true
    })
    this.currentScenePane = debugInput(scenesTab, this, 'currentSceneName', {
      label: 'Current Scene',
      disabled: true,
    })
    debugOptions(scenesTab, 'Scene', sceneOptions, (value: any) => {
      transitionTo.scene = value
    })
    debugOptions(scenesTab, 'Transition', transitionOptions, (value: any) => {
      transitionTo.transition = value.length > 0 ? value : undefined
    })
    debugButton(scenesTab, 'Transition', () => {
      if (transitionTo.scene.length > 0) {
        // @ts-ignore
        this.showScene(transitionTo.scene, transitionTo.transition)
      }
    })
    debugLerp(scenesTab, 'Progress', (progress: number) => {
      this.transitionProgress = progress
    })

    // Tools
    this.inspector = new Inspector()

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
      this.inspector?.dispose()
      this.multiCams?.dispose()
      this.splineEditor?.dispose()
    }
  }

  update() {
    const logoMat = this.logo.material as LogoMaterial
    logoMat.time = this.clock.getElapsedTime()
    logoMat.intensity = sin(1, 4, logoMat.time)
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

    this.ui?.draw(this.autoUpdateUI)
    this.composite?.draw()
    if (IS_DEV) {
      if (this.saveScreenshot) {
        saveCanvasToPNG()
        this.saveScreenshot = false
      }
      this.multiCams?.postRender(this.currentScene!)
    }
  }

  resize(width: number, height: number) {
    this.previousScene?.resize(width, height)
    this.currentScene?.resize(width, height)
    this.ui?.resize(width, height)
    this.composite?.resize(width, height)
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
    return this.ui!.addMesh(name, width, height, texture, align, anchor, material)
  }

  addText(name: string, options: any): TextMesh {
    return this.ui!.addText(name, options)
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
      case 'lobby':
        newScene = new LobbyScene()
        break
      case 'intro':
        newScene = new IntroScene()
        break
      case 'credits':
        newScene = new CreditsScene()
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
      if (this.composite !== undefined) this.composite.transitioning = true
    }
    // Ensure there's a scene to be shown
    if (newScene !== undefined) {
      if (this.currentScene !== undefined) {
        this.previousScene = this.currentScene
      }

      this.currentScene = newScene
      this.currentSceneName = newScene.name
      this.currentScene.init().then(() => {
        threeDispatcher.dispatchEvent({ type: Events.SCENE_READY })
        if (IS_DEV) {
          this.currentScenePane?.refresh()
          Transformer.clear()

          // Inspector
          this.inspector?.changeScene(this.currentScene!)

          // Multi-Cameras
          this.multiCams?.changeScene(this.currentScene!)

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
      if (this.composite !== undefined) this.composite.transitioning = false
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
