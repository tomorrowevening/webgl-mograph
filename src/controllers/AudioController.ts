import { start } from 'tone'
import { Events, threeDispatcher } from '@/models/constants'

class AudioController {
  private _muted = true

  constructor() {
    threeDispatcher.addEventListener(Events.TOGGLE_MUTE, this.onToggleMute)
  }

  //////////////////////////////////////////////////
  // Basic

  init(): Promise<void> {
    return new Promise((resolve) => {
      start().then(() => {
        threeDispatcher.dispatchEvent({ type: Events.TOGGLE_MUTE, playing: true })
        resolve()
      })
    })
  }

  dispose() {
    threeDispatcher.removeEventListener(Events.TOGGLE_MUTE, this.onToggleMute)
  }

  //////////////////////////////////////////////////
  // Audio

  play = () => {
    //
  }

  //////////////////////////////////////////////////
  // Getters / Setters

  //////////////////////////////////////////////////
  // Private

  private onToggleMute = (evt: any) => {
    this._muted = evt.playing
  }
}

const audio = new AudioController()
export default audio
