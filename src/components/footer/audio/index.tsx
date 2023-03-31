// Libs
import { useEffect, useRef, useState } from 'react'
// @ts-ignore
import Spritesheet from 'react-responsive-spritesheet'
// Style
import './audio.scss'
// Models
import { Events, threeDispatcher } from '../../../models/constants'

let playing = false
export default function AudioBtn() {
  const btnRef = useRef<HTMLButtonElement>(null)
  const spritesheetRef = useRef<Spritesheet>(null)
  const [selected, setSelected] = useState(playing)

  const onToggle = () => {
    const value = !selected
    setSelected(value)
    threeDispatcher.dispatchEvent({ type: Events.TOGGLE_MUTE, playing: value })
  }

  const onAudioEvent = (evt: any) => {
    if (evt.playing) {
      playing = true
      spritesheetRef.current.goToAndPlay(1)
    } else {
      playing = false
    }
    setSelected(playing)
  }

  useEffect(() => {
    threeDispatcher.addEventListener(Events.TOGGLE_MUTE, onAudioEvent)
    return () => {
      threeDispatcher.removeEventListener(Events.TOGGLE_MUTE, onAudioEvent)
    }
  }, [])

  return (
    <button className={'audio hideText'} ref={btnRef} onClick={onToggle}>
      <Spritesheet
        image={'/images/audio.png'}
        widthFrame={40}
        heightFrame={40}
        steps={30}
        fps={30}
        autoplay={false}
        loop={true}
        onEachFrame={(spritesheet: any) => {
          const frame = spritesheet.getInfo('frame')
          if (!playing && frame === 30) spritesheet.pause()
        }}
        ref={spritesheetRef}
      />
    </button>
  )
}
