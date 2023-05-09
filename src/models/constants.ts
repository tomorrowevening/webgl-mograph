import { EventDispatcher } from 'three'

export const IS_DEV = true // import.meta.env.DEV

export const Events = {
  SCENE_READY: 'sceneReady',
  SCENE_SHOW: 'sceneShow',
  SCENE_HIDE: 'sceneHide',
  SCENE_HIDDEN: 'sceneHidden',
  // App
  LOAD_COMPLETE: 'loadComplete',
  APP_READY: 'appReady',
  APP_START: 'appStart',
  APP_EVENT: 'appEvent',
  MARKER: 'marker',
  UPDATE: 'update',
  // Audio
  AUDIO_START: 'audioStart',
  TOGGLE_MUTE: 'toggleMute',
  // Tools
  ADD_GLTF: 'addGLTF',
  ADD_SPLINE: 'addSpline',
  ADD_TEXT: 'addText',
  UPDATE_HIERARCHY: 'updateHierarchy',
  // multicams
  TAKE_SCREENSHOT: 'takeScreenshot',
  TOGGLE_ORBIT: 'toggleOrbit',
  SET_MULTICAMS_CAMERA: 'setMultiCamsCamera',
  UPDATE_MULTICAMS: 'updateMultiCams',
  // post
  UPDATE_POST: 'updatePost',
}

export const threeDispatcher = new EventDispatcher()
export const debugDispatcher = new EventDispatcher()
