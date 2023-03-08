// Libs
import { Texture } from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
// Models
import { IS_DEV } from '../models/constants'

// Add your own resources
/*
 {
   file: '/models/.gltf',
   type: 'gltf'
 }
*/
type FileType = 'json'
  | 'cubeTexture'
  | 'texture'
  | 'gltf'
  | 'draco'

export type File = {
  file: string
  type: FileType
}

export const assets = {
  audio: new Map(),
  images: new Map(),
  json: new Map(),
  models: new Map(),
  textures: new Map(),
}

const draco = new DRACOLoader()
draco.setDecoderPath('/libs/draco/')

export default class Preloader {
  async createAssets(loaded: any) {
    return new Promise((resolve) => {
      if (IS_DEV) console.log('Convert loaded assets to WebGL')
      const promises = []
      const startTime = Date.now()

      // Textures
      for (let [key, value] of loaded.textures) {
        const texture = new Texture(value)
        assets.textures.set(key, texture)
      }

      // Models
      for (let [key, value] of loaded.models) {
        const model = new GLTFLoader()
        model.setDRACOLoader(draco)
        promises.push(
          model.parseAsync(value, '').then((gltf) => {
            assets.models.set(key, gltf)
            if (IS_DEV) console.log((Date.now() - startTime) / 1000, key)
          })
        )
      }

      Promise.all(promises).then(() => {
        if (IS_DEV) console.log('Assets complete:', (Date.now() - startTime) / 1000)
        resolve(assets)
      })
    })
  }

  load(assetList: Array<File>, onProgress: (progress: number) => void, onComplete: () => void) {
    if (IS_DEV) console.log('Begin preload')
    // WebGL compression
    draco.preload()

    const worker = new Worker('worker.js')
    const onMessage = (event: any) => {
      const msg = event.data
      switch (msg.type) {
        case 'loadProgress':
          onProgress(msg.data)
          break
        case 'loadComplete':
          worker.removeEventListener('message', onMessage)
          worker.terminate()
          this.createAssets(msg.data).then(onComplete)
          break
      }
    }

    // Begin load
    worker.addEventListener('message', onMessage)
    worker.postMessage({
      type: 'loadStart',
      data: assetList,
    })
  }
}