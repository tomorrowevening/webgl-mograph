import { useEffect } from 'react'
import studio from '@theatre/studio'
import { IS_DEV } from '@/models/constants'
import { initDebug } from '@/utils/debug'

if (IS_DEV) studio.initialize()

export default function DebugInit() {
  useEffect(() => {
    initDebug()
  }, [])

  return null
}
