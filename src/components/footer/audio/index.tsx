// Libs
import { useEffect, useRef, useState } from 'react'
// Models
import { Events, threeDispatcher } from '@/models/constants'
// Components
import './audio.scss'
import Spritesheet, { SpritesheetRef } from '@/components/animation/Spritesheet'
import useDevicePixelRatio from '@/hooks/useDPR'

let playing = false
export default function AudioBtn() {
  const btnRef = useRef<HTMLButtonElement>(null)
  const spritesheetRef = useRef<SpritesheetRef>(null)
  const [selected, setSelected] = useState(playing)

  const onToggle = () => {
    const value = !selected
    setSelected(value)
    threeDispatcher.dispatchEvent({ type: Events.TOGGLE_MUTE, playing: value })
  }

  const onAudioEvent = (evt: any) => {
    if (evt.playing) {
      playing = true
      spritesheetRef.current?.play()
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
        image={`/images/audio@${useDevicePixelRatio()}x.png`}
        width={20}
        height={20}
        steps={30}
        fps={30}
        onUpdate={(frame: number) => {
          if (!playing && frame === 0) spritesheetRef.current?.pause()
        }}
        ref={spritesheetRef}
      />
    </button>
  )
}
