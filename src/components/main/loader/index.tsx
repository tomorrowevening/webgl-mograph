// Libs
import { useEffect, useState } from 'react'
// Models
import { Events, IS_DEV, threeDispatcher } from '@/models/constants'
import { settings } from '@/models/settings'
// Components
import './loader.scss'
// Utils
import { preloadAssets } from '@/utils/preloader'
import { initDebug } from '@/utils/debug'

export default function Loader() {
  // States
  const [percent, setPercent] = useState(0)

  useEffect(() => {
    const startApp = () => {
      threeDispatcher.dispatchEvent({ type: Events.LOAD_COMPLETE })
    }

    // Detect settings & begin load
    settings.detect().then(() => {
      if (IS_DEV) initDebug()
      preloadAssets((progess: number) => setPercent(progess), startApp)
    })
  }, [])

  return (
    <div className="loader absoluteCenter">
      <p>Loading assets {Math.round(percent * 100)}%</p>
    </div>
  )
}
