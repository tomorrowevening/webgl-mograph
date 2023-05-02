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

export default function Loader() {
  // States
  const [settingsDetected, setSettingsDetected] = useState(false)
  const [percent, setPercent] = useState(0)

  useEffect(() => {
    const startApp = () => {
      threeDispatcher.dispatchEvent({ type: Events.LOAD_COMPLETE })
    }

    // Detect settings & begin load
    settings.detect().then(() => {
      setSettingsDetected(true)
      preloadAssets((progess: number) => setPercent(progess), startApp)
    })
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
