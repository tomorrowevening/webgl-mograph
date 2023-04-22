// Libs
import { getProject, IProject, ISheet, ISheetObject } from '@theatre/core'
// Models
import assets from './assets'
import { IS_DEV, threeDispatcher } from './constants'
import { Events } from './constants'
// Utils
import { debugButton, debugFolder, debugInput, debugOptions, scenesTab } from '@/utils/debug'

class AnimationSingleton {
  project!: IProject
  // Create sheets once so they can be globally accessible
  sheets: Map<string, ISheet> = new Map()
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
    this.createSheet('app')
    this.animateObject('app', 'App', {
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

    // Scene sheets
    this.createSheet('lobby')

    this.refresh()
  }

  private refresh(): void {
    if (!IS_DEV) return
    if (this.debugFolder === undefined) {
      this.debugFolder = debugFolder('Animation', scenesTab)
    }

    // Remove any previously created items
    for (let i = this.debugFolder.children.length - 1; i > -1; i--) {
      const child = this.debugFolder.children[i]
      child.dispose()
    }

    const sheetOptions: Array<any> = [{ text: '', value: '' }]
    for (const [key] of this.sheets) {
      sheetOptions.push({ text: key, value: key })
    }

    debugButton(this.debugFolder, 'Create Sheet', () => {
      const name = prompt('Name', '')
      if (name === null || name === '') return
      this.createSheet(name)
    })
    const params = {
      sheet: '',
      objName: '',
      objParams: '',
    }
    debugInput(this.debugFolder, params, 'objName', { label: 'Key' })
    debugInput(this.debugFolder, params, 'objParams', {
      label: 'Params',
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
        this.animateObject(params.sheet, params.objName, data)
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

  createSheet(name: string): ISheet | undefined {
    if (this.sheets.get(name) !== undefined) return undefined
    const sheet = this.project.sheet(name)
    this.sheets.set(name, sheet)
    this.refresh()
    return sheet
  }

  animateObject(sheetName: string, key: string, props: any): ISheetObject | undefined {
    const sheet = this.sheets.get(sheetName)
    if (sheet === undefined) return undefined
    return sheet.object(key, props)
  }
}

const animation = new AnimationSingleton()
export default animation
