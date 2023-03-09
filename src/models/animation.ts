// Libs
import { getProject, IProject } from '@theatre/core'
// Models
import assets from './assets'

class AnimationSingleton {
  project!: IProject

  init(): void {
    const animationJSON = assets.json.get('animation')
    this.project = getProject('MoGraph', { state: animationJSON })
  }
}

const animation = new AnimationSingleton()
export default animation
