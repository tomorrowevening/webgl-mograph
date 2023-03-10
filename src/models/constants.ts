import { EventDispatcher } from 'three'

export const IS_DEV = import.meta.env.DEV

export const Events = {
  SCENE_SHOW: 'sceneShow',
  SCENE_HIDE: 'sceneHide',
  SCENE_HIDDEN: 'sceneHidden',
}

export const threeDispatcher = new EventDispatcher()

export type Scenes = 'intro' | 'credits'
