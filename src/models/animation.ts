// Libs
import { getProject, IProject, ISheet } from '@theatre/core'
// Models
import assets from './assets'
import { threeDispatcher } from './constants'
import { Events } from './constants'

class AnimationSingleton {
  project!: IProject
  // Create sheets once so they can be globally accessible
  sheets: Map<string, ISheet> = new Map()

  init(): void {
    const animationJSON = assets.json.get('animation')
    this.project = getProject('MoGraph', { state: animationJSON })

    // Main sheet to trigger events and overall changes
    const app = this.project.sheet('app')
    const appTriggers = {
      scene: '',
      transition: '',
      marker: '',
      event: {
        name: '',
        value: '',
      },
    }
    app
      .object('App', {
        scene: '',
        marker: '',
        event: {
          name: '',
          value: '',
        },
      })
      .onValuesChange((values: any) => {
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
    this.sheets.set('app', app) // entire duration

    // Scene sheets
    this.sheets.set('lobby', this.project.sheet('lobby'))
  }

  play(): void {
    const app = this.sheets.get('app')
    if (app !== undefined) {
      app.sequence.position = 0
      app.sequence.play()
    }
  }
}

const animation = new AnimationSingleton()
export default animation
