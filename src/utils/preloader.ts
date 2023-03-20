// Libs
import { Texture } from 'three'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
// Models
import assetList from '../models/assetList'
import assets from '../models/assets'

type FileType = 'json' | 'cubeTexture' | 'texture' | 'gltf' | 'draco'

export type File = {
  name: string
  file: string
  type: FileType
}

const draco = new DRACOLoader()
draco.setDecoderPath('/libs/draco/')

async function createAssets(loaded: any) {
  return new Promise((resolve) => {
    const promises = []

    // JSON
    for (const [key, value] of loaded.json) {
      assets.json.set(key, value)
    }

    // Models
    for (const [key, value] of loaded.models) {
      const model = new GLTFLoader()
      model.setDRACOLoader(draco)
      promises.push(
        model.parseAsync(value, '').then((gltf) => {
          assets.models.set(key, gltf)
        }),
      )
    }

    // Textures
    for (const [key, value] of loaded.textures) {
      const texture = new Texture(value)
      assets.textures.set(key, texture)
    }

    Promise.all(promises).then(() => {
      resolve(assets)
    })
  })
}

export function preloadAssets(onProgress: (progress: number) => void, onComplete: () => void) {
  // WebGL compression
  draco.preload()

  const worker = new Worker('loading-worker.js')
  const onMessage = (event: any) => {
    const msg = event.data
    switch (msg.type) {
      case 'loadProgress':
        onProgress(msg.data)
        break
      case 'loadComplete':
        worker.removeEventListener('message', onMessage)
        worker.terminate()
        createAssets(msg.data).then(onComplete)
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
