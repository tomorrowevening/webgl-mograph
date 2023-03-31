// Libs
import { useEffect, useState } from 'react'
// Models
import { Events, threeDispatcher } from '../../../models/constants'
import { settings } from '../../../models/settings'
// Utils
import { preloadAssets } from '../../../utils/preloader'

export default function Loader() {
  // States
  const [percent, setPercent] = useState(0)

  useEffect(() => {
    const startApp = () => {
      threeDispatcher.dispatchEvent({ type: Events.LOAD_COMPLETE })
    }

    // Detect settings & begin load
    window.onload = () => {
      settings.detect().then(() => {
        preloadAssets((progess: number) => setPercent(progess), startApp)
      })
    }
  }, [])

  return (
    <div className="absoluteCenter">
      <p>Loading assets {Math.round(percent * 100)}%</p>
    </div>
  )
}
