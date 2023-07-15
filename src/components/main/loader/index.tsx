// Libs
import { useEffect, useState } from 'react'
// Models
import { Events, IS_DEV, threeDispatcher } from '@/models/constants'
import { settings } from '@/models/settings'
// Components
import './loader.scss'
import DebugInit from '@/components/debug/DebugInit'
// Utils
import { preloadAssets } from '@/utils/preloader'
import { roundTo } from '@/utils/math'

function easeTo(start: number, end: number, amt: number): number {
  return (1 - amt) * start + amt * end
}

const noop = () => {
  //
}

export default function Loader() {
  // States
  const [settingsDetected, setSettingsDetected] = useState(false)
  const [percent, setPercent] = useState(0)

  useEffect(() => {
    let rafID = -1

    const stop = () => {
      window.cancelAnimationFrame(rafID)
      rafID = -1
    }

    // Detect settings & begin load
    settings.detect().then(() => {
      setSettingsDetected(true)

      let progressTarget = 0
      let progress = 0
      const speed = 0.2

      const animate = () => {
        progress = easeTo(progress, progressTarget, speed)
        if (Math.round(progress * 100) === 100) {
          stop()
          setPercent(1)
          threeDispatcher.dispatchEvent({ type: Events.LOAD_COMPLETE })
          return
        }

        setPercent(progress)
        rafID = requestAnimationFrame(animate)
      }

      const start = () => {
        animate()
      }

      start()
      preloadAssets((value: number) => {
        progressTarget = value
      }, noop)
    })

    return () => {
      stop()
    }
  }, [])

  return (
    <>
      <div className="loader absoluteCenter">
        <p>Loading assets {Math.round(percent * 100)}%</p>
      </div>
      {IS_DEV && settingsDetected ? <DebugInit /> : null}
    </>
  )
}
