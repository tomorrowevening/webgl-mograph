const assets = {
  audio: new Map(),
  images: new Map(),
  json: new Map(),
  models: new Map(),
  textures: new Map(),
}

//////////////////////////////////////////////////
// Load Functions

async function loadImage(path, objType) {
  const response = await fetch(path)
  const content = await response.blob()
  assets[objType].set(path, content)
}

async function loadFile(path, objType, responseType) {
  await fetch(path)
    .then(response => {
      if (response.status === 200 || response.status === 0) {
        // Some browsers return HTTP Status 0 when using non-http protocol
        // e.g. 'file://' or 'data://'. Handle as success.

        if (response.status === 0) {
          console.warn('FileLoader: HTTP Status 0 received.')
        }

        // Workaround: Checking if response.body === undefined for Alipay browser #23548
        if (typeof ReadableStream === 'undefined' || response.body === undefined || response.body.getReader === undefined) {
          return response
        }

        const reader = response.body.getReader()
        // periodically read data into the new stream tracking while download progress
        const stream = new ReadableStream({
          start(controller) {
            function readData() {
              reader.read().then(({ done, value }) => {
                if (done) {
                  controller.close()
                } else {
                  controller.enqueue(value)
                  readData()
                }
              })
            }
            readData()
          }
        })
        return new Response(stream)
      } else {
        throw new HttpError(`fetch for "${response.path}" responded with ${response.status}: ${response.statusText}`, response)
      }
    })
    .then(response => {
      switch (responseType) {
        case 'arraybuffer':
          return response.arrayBuffer()
        case 'blob':
          return response.blob()
        case 'document':
          return response.text()
            .then(text => {
              const parser = new DOMParser()
              return parser.parseFromString(text, mimeType)
            })
        case 'json':
          return response.json()
        default:
          if (mimeType === undefined) {
            return response.text()
          } else {
            // sniff encoding
            const re = /charset="?([^"\s]*)"?/i
            const exec = re.exec(mimeType)
            const label = exec && exec[1] ? exec[1].toLowerCase() : undefined
            const decoder = new TextDecoder(label)
            return response.arrayBuffer().then(ab => decoder.decode(ab))
          }
      }
    })
    .then(data => {
      assets[objType].set(path, data)
    })
    .catch(err => {
      console.log('err:', err)
    })
}

function loadAssets(files) {
  const total = files.length
  return new Promise((resolve, reject) => {
    let index = 0

    const loadComplete = () => {
      index++
      const progress = index / total
      self.postMessage({
        type: 'loadProgress',
        data: progress
      })
      if (index >= files.length) {
        resolve()
      } else {
        loadNext()
      }
    }

    const loadNext = () => {
      const item = files[index]
      const file = item.file
      const type = item.type
      switch (type) {
        // Audio
        case 'audio':
          loadFile(file, 'audio', 'arraybuffer')
            .then(loadComplete)
            .catch(reject)
          break
        // Images
        case 'image':
          loadImage(file, 'images')
            .then(loadComplete)
            .catch(reject)
          break
        // Textures
        case 'texture':
          loadImage(file, 'textures')
            .then(loadComplete)
            .catch(reject)
          break
        // JSON
        case 'json':
          loadFile(file, 'json', 'json')
            .then(loadComplete)
            .catch(reject)
          break
        // Models
        case 'gltf':
          loadFile(file, 'models', 'arraybuffer')
            .then(loadComplete)
            .catch(reject)
          break
      }
    }

    loadNext()
  })
}

function assetsComplete() {
  self.postMessage({
    type: 'loadComplete',
    data: assets,
  })
}

function startLoad(assetList) {
  if (assetList.length > 0) {
    loadAssets(assetList).then(assetsComplete)
  } else {
    assetsComplete()
  }
}

//////////////////////////////////////////////////
// Webworker

self.addEventListener('message', event => {
  if (event.data.type === 'loadStart') {
    startLoad(event.data.data)
  }
})
