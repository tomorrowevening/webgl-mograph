// Models
import { Events, IS_DEV, threeDispatcher } from '../models/constants'
import webgl from '../models/webgl'
import { Scenes, Transitions } from '../types'
// Scenes
import BaseScene from '../scenes/BaseScene'
import CompositeScene from '../scenes/composite'
import IntroScene from '../scenes/intro'
import CreditsScene from '../scenes/credits'
import UIScene from '../scenes/ui'
// Transitions
import Transition from '../materials/transitions/Transition'
import WipeTransition from '../materials/transitions/WipeTransition'
// Utils
import { dispose, orthoCamera, renderToTexture, triangle } from '../utils/three'
import { debugButton, debugLerp, debugOptions, scenesTab } from '../utils/debug'
import { Mesh } from 'three'

class SceneController {
  // Scenes
  currentScene?: BaseScene | undefined
  previousScene?: BaseScene | undefined
  composite!: CompositeScene
  ui!: UIScene

  // Transitioning
  transition?: Transition | undefined
  transitionMesh?: Mesh | undefined

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
  }

  update() {
    this.previousScene?.update()
    this.currentScene?.update()
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
  }

  resize(width: number, height: number) {
    this.previousScene?.resize(width, height)
    this.currentScene?.resize(width, height)
    this.ui.resize(width, height)
    this.composite.resize(width, height)
  }

  showScene(name: Scenes, transition?: Transitions): void {
    threeDispatcher.dispatchEvent({ type: Events.SCENE_SHOW, scene: name, transition: transition })
  }

  //////////////////////////////////////////////////
  // Events

  /**
   * Create the new scene instance.
   * If a `currentScene` exists, move to `previousScene` and prepare for hiding.
   */
  private onSceneShow = (evt: any) => {
    console.log('SceneController::onSceneShow', evt)
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