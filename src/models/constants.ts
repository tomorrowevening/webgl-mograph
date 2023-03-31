import { EventDispatcher } from 'three'

// export const IS_DEV = import.meta.env.DEV
export const IS_DEV = true

export const Events = {
  SCENE_READY: 'sceneReady',
  SCENE_SHOW: 'sceneShow',
  SCENE_HIDE: 'sceneHide',
  SCENE_HIDDEN: 'sceneHidden',
  // App
  LOAD_START: 'loadStart',
  LOAD_COMPLETE: 'loadComplete',
  START_APP: 'startApp',
  TOGGLE_MUTE: 'toggleMute',
  // Tools
  UPDATE_HIERARCHY: 'updateHierarchy',
}

export const threeDispatcher = new EventDispatcher()
export const debugDispatcher = new EventDispatcher()
