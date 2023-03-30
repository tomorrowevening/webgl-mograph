import { EventDispatcher } from 'three'

// export const IS_DEV = import.meta.env.DEV
export const IS_DEV = true

export const Events = {
  SCENE_READY: 'sceneReady',
  SCENE_SHOW: 'sceneShow',
  SCENE_HIDE: 'sceneHide',
  SCENE_HIDDEN: 'sceneHidden',
}

export const threeDispatcher = new EventDispatcher()
