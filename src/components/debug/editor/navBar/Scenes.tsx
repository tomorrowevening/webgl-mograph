// Models
import { Events, threeDispatcher } from '@/models/constants'
// Views
import Dropdown from '../components/Dropdown'

const icon = `
<svg width="14" height="14" fill="white" stroke="none">
  <path d="m11.98.29c-.01-.15-.14-.28-.29-.28h0c-2.49-.11-4.71.96-6.68,3.25H1.12c-.14,0-.26.1-.29.23h0S0,6.74,0,6.74c0,.02,0,.05,0,.07,0,.17.14.3.3.31h2.15c-.13.26-.27.51-.4.78-.02.04-.03.08-.03.13,0,.08.03.16.09.22l1.62,1.62c.06.05.13.09.22.09h0c.05,0,.1-.01.14-.03h0c.26-.13.52-.26.78-.4v2.22h0c0,.17.14.3.3.3h0s.05,0,.08,0h0s3.25-.81,3.25-.81c.13-.03.23-.15.23-.3v-3.89c2.07-1.71,3.45-3.84,3.25-6.75h0ZM.69,6.51l.66-2.64h3.15c-.59.77-1.16,1.63-1.67,2.54l-.05.1H.69Zm7.43,4.19l-2.64.66v-2.17c1.02-.56,1.88-1.11,2.7-1.72l-.06.05v3.18Zm-4.1-1.42l-1.31-1.31C5.15,3.02,7.98.61,11.35.61h.04c.13,4.2-3.43,6.66-7.37,8.67h0Zm4.81-7.24c-.62,0-1.12.5-1.12,1.12s.5,1.12,1.12,1.12,1.12-.5,1.12-1.12h0c0-.62-.5-1.12-1.12-1.12h0Zm0,1.62c-.28,0-.51-.23-.51-.51s.23-.51.51-.51.51.23.51.51h0c0,.28-.23.51-.51.51h0Z"/>
</svg>
`

export default function Scenes() {
  const onSelect = (value: string) => {
    threeDispatcher.dispatchEvent({
      type: Events.SCENE_SHOW,
      scene: value,
      transition: 'wipe',
    })
  }
  return (
    <Dropdown
      title={icon}
      options={[
        {
          title: 'Lobby',
          value: 'lobby',
          type: 'option',
        },
        {
          title: 'Intro',
          value: 'intro',
          type: 'option',
        },
        {
          title: 'Credits',
          value: 'credits',
          type: 'option',
        },
      ]}
      onSelect={onSelect}
    />
  )
}
