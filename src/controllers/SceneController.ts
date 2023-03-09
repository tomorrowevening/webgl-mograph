// Models
import { dispose } from 'tomorrow_web/utils/three'
import { Events, Scenes, threeDispatcher } from '../models/constants'
import webgl from '../models/webgl'
// Views
import BaseScene from '../scenes/BaseScene'
import IntroScene from '../scenes/intro'
import CreditsScene from '../scenes/credits'

/**
 * #TODO: Add Compositing scene to render both scenes + transition
 */

class SceneController {
  currentScene?: BaseScene | undefined
  previousScene?: BaseScene | undefined

  constructor() {
    threeDispatcher.addEventListener(Events.SCENE_SHOW, this.onSceneShow)
    threeDispatcher.addEventListener(Events.SCENE_HIDE, this.onSceneHide)
    threeDispatcher.addEventListener(Events.SCENE_HIDDEN, this.onSceneHidden)
  }

  initDebug(): void {
    //
  }

  update() {
    this.currentScene?.update()
    this.previousScene?.update()
  }

  draw() {
    if (this.previousScene !== undefined) {
      const prevRT = webgl.renderTargets.get('previousScene')!
      this.previousScene?.draw(prevRT)
    }

    const currentRT = webgl.renderTargets.get('currentScene')!
    this.currentScene?.draw(currentRT)
  }

  resize(width: number, height: number) {
    this.currentScene?.resize(width, height)
    this.previousScene?.resize(width, height)
  }

  showScene(name: Scenes): void {
    threeDispatcher.dispatchEvent({ type: Events.SCENE_SHOW, value: name })
  }

  //////////////////////////////////////////////////
  // Events

  /**
   * Create the new scene instance.
   * If a `currentScene` exists, move to `previousScene` and prepare for hiding.
   */
  private onSceneShow = (evt: any) => {
    console.log('SceneController::onSceneShow', evt)
    const name = evt.value as Scenes
    let newScene: BaseScene | undefined = undefined
    switch (name) {
      case 'credits':
        newScene = new CreditsScene()
        break
      case 'intro':
        newScene = new IntroScene()
        break
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
    this.previousScene = undefined
  }
}

const scenes = new SceneController()
export default scenes
