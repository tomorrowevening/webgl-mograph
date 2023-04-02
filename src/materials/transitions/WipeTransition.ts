import Transition from './Transition'
import fragment from '@/glsl/transitions/wipe.frag'

export default class WipeTransition extends Transition {
  constructor() {
    super('Wipe', fragment)
  }
}
