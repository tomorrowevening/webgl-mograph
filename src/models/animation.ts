// Libs
import { getProject, IProject, ISheet, ISheetObject } from '@theatre/core'
// Models
import assets from './assets'
import { Events, IS_DEV, threeDispatcher } from './constants'
// Utils
import { debugButton, debugFolder, debugInput, debugOptions, scenesTab } from '@/utils/debug'

export type TheatreUpdateCallback = (values: any) => void

// Default SheetObject.onValuesChange callback
const noop: TheatreUpdateCallback = (values: any) => {
  //
}

class AnimationSingleton {
  project!: IProject
  sheets: Map<string, ISheet> = new Map()
  sheetObjects: Map<string, ISheetObject> = new Map()
  sheetObjectCBs: Map<string, TheatreUpdateCallback> = new Map()
  sheetObjectUnsubscribe: Map<string, any> = new Map()

  private debugFolder: any

  init(): void {
    const animationJSON = assets.json.get('animation')
    this.project = getProject('MoGraph', { state: animationJSON })

    // Main sheet to trigger events and overall changes
    const appTriggers = {
      scene: '',
      transition: '',
      marker: '',
      event: {
        name: '',
        value: '',
      },
    }
    this.sheet('app')
    this.sheetObject('app', 'App', {
      scene: '',
      marker: '',
      event: {
        name: '',
        value: '',
      },
    })!.onValuesChange((values: any) => {
      // Check for changes..

      // Scene change?
      if (appTriggers.scene !== values.scene) {
        if (values.scene.length > 0) {
          threeDispatcher.dispatchEvent({
            type: Events.SCENE_SHOW,
            scene: values.scene,
            transition: values.transition.length > 0 ? values.transition : undefined,
          })
        }
      }

      // Marker change?
      if (appTriggers.marker !== values.marker) {
        if (values.marker.length > 0) {
          threeDispatcher.dispatchEvent({ type: Events.MARKER, value: values.marker })
        }
      }

      // Event change?
      if (appTriggers.event.name !== values.event.name || appTriggers.event.value !== values.event.value) {
        if (values.marker.length > 0) {
          threeDispatcher.dispatchEvent({
            type: Events.APP_EVENT,
            name: values.event.name,
            value: values.event.value,
          })
        }
      }

      // Set values
      appTriggers.scene = values.scene
      appTriggers.transition = values.transition
      appTriggers.marker = values.marker
      appTriggers.event.name = values.event.name
      appTriggers.event.value = values.event.value
    })

    this.refresh()
  }

  get sheetOptions(): Array<any> {
    const sheetOptions: Array<any> = [{ text: '', value: '' }]
    for (const [key] of this.sheets) {
      sheetOptions.push({ text: key, value: key })
    }
    return sheetOptions
  }

  refresh(): void {
    if (!IS_DEV) return
    if (this.debugFolder === undefined) {
      this.debugFolder = debugFolder('Animation', scenesTab)
    }

    // Remove any previously created items
    for (let i = this.debugFolder.children.length - 1; i > -1; i--) {
      const child = this.debugFolder.children[i]
      child.dispose()
    }

    const sheetOptions = this.sheetOptions

    debugButton(this.debugFolder, 'Create Sheet', () => {
      const name = prompt('Name', '')
      if (name === null || name === '') return
      this.sheet(name)
    })
    const params = {
      sheet: '',
      objName: '',
      objParams: '',
    }
    debugInput(this.debugFolder, params, 'objName', { label: 'Object Name' })
    debugInput(this.debugFolder, params, 'objParams', {
      label: 'Object Params',
      view: 'textarea',
      lineCount: 6,
      placeholder: '',
    })
    debugOptions(this.debugFolder, 'Sheet', sheetOptions, (value: string) => {
      params.sheet = value
    })
    debugButton(this.debugFolder, 'Animate Object', () => {
      if (params.objName.length < 1 || params.objParams.length < 1 || params.sheet.length < 1) {
        return
      }
      const objParams = params.objParams.replace(/(\r\n|\n|\r)/gm, '')
      try {
        const data = JSON.parse(objParams)
        this.sheetObject(params.sheet, params.objName, data)
      } catch (error: any) {
        console.log("Couldn't parse json:")
        console.log(error)
      }
    })
  }

  play(): void {
    const app = this.sheets.get('app')
    if (app !== undefined) {
      app.sequence.position = 0
      app.sequence.play()
    }
  }

  sheet(name: string): ISheet {
    let sheet = this.sheets.get(name)
    if (sheet !== undefined) return sheet

    sheet = this.project.sheet(name)
    this.sheets.set(name, sheet)
    this.refresh()
    return sheet
  }

  sheetObject(sheetName: string, key: string, props: any, onUpdate?: TheatreUpdateCallback): ISheetObject {
    const sheet = this.sheet(sheetName)
    const objName = `${sheetName}_${key}`

    // Sheet Object already exist?
    let obj = this.sheetObjects.get(objName)
    if (obj !== undefined) {
      obj = sheet.object(key, { ...props, ...obj.value }, { reconfigure: true })
      return obj
    }

    obj = sheet.object(key, props)
    this.sheetObjects.set(objName, obj)
    this.sheetObjectCBs.set(objName, onUpdate !== undefined ? onUpdate : noop)

    const unsubscribe = obj.onValuesChange((values: any) => {
      const callback = this.sheetObjectCBs.get(objName)
      if (callback !== undefined) callback(values)
    })
    this.sheetObjectUnsubscribe.set(objName, unsubscribe)

    return obj
  }

  unsubscribe(sheet: ISheetObject) {
    const id = `${sheet.address.sheetId}_${sheet.address.objectKey}`
    const unsubscribe = this.sheetObjectUnsubscribe.get(id)
    if (unsubscribe !== undefined) {
      unsubscribe()
    }
  }
}

const animation = new AnimationSingleton()
export default animation
