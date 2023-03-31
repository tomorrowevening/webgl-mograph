import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

type SpritesheetProps = {
  image: string
  width: number
  height: number
  steps: number
  fps: number
  onUpdate?: (frame: number) => void
}

export interface SpritesheetRef {
  play: () => void
  pause: () => void
}

const Spritesheet = forwardRef<SpritesheetRef, SpritesheetProps>((props: SpritesheetProps, ref) => {
  // States
  const [playing, setPlaying] = useState(false)
  const [frame, setFrame] = useState(0)
  const delay = (1 / props.fps) * 1000

  const play = () => {
    setPlaying(true)
  }

  const pause = () => {
    setPlaying(false)
  }

  // Handle play / pause
  useEffect(() => {
    let interval = -1
    if (playing) {
      interval = setInterval(() => {
        const nextFrame = (frame + 1) % props.steps
        if (props.onUpdate !== undefined) props.onUpdate(nextFrame)
        setFrame(nextFrame)
      }, delay)
    } else if (!playing && frame > 0) {
      clearInterval(interval)
    }
    return () => {
      clearInterval(interval)
    }
  }, [playing, frame])

  useImperativeHandle(ref, () => ({
    play: play,
    pause: pause,
  }))

  const position = frame * -props.width

  return (
    <div
      style={{
        backgroundImage: `url(${props.image})`,
        backgroundPositionX: `${position}px`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        width: `${props.width}px`,
        height: `${props.height}px`,
      }}
    ></div>
  )
})

export default Spritesheet
