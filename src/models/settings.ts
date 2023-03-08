import { getGPUTier } from 'detect-gpu'

export type Quality = 'low' | 'medium' | 'high'

export const settings = {
  mobile: false,
  quality: 'low',
  detect: async function () {
    const gpuTier = await getGPUTier()

    // Device
    if (gpuTier.isMobile !== undefined) this.mobile = gpuTier.isMobile

    // Quality
    switch (gpuTier.tier) {
      case 0:
      case 1:
        this.quality = 'low'
        break
      case 2:
        this.quality = 'medium'
        break
      case 3:
        this.quality = 'high'
        break
    }
  }
}
