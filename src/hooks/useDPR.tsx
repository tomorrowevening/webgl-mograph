import { useState } from 'react'

function getDevicePixelRatio(): number {
  return window.devicePixelRatio !== undefined ? Math.floor(window.devicePixelRatio) : 1
}

export default function useDevicePixelRatio() {
  const dpr = getDevicePixelRatio()
  const [currentDpr] = useState(dpr)
  return currentDpr
}
