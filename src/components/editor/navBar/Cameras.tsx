// Models
import { Events, threeDispatcher } from '@/models/constants'
// Views
import Dropdown from '../components/Dropdown'

const icon = `
<svg width="14" height="14" fill="none" stroke="white">
  <path d="M11.3,3.7c0.4,0,0.6,0,0.7,0c0.5,0.1,0.9,0.5,1,1c0,0.2,0,0.3,0,0.7v4.3c0,1.3,0,1.9-0.4,2.3s-1,0.4-2.3,0.4
	H9.7H4.3H3.7c-1.3,0-1.9,0-2.3-0.4C1,11.6,1,10.9,1,9.7V5.4C1,5,1,4.8,1,4.7c0.1-0.5,0.5-0.9,1-1c0.2,0,0.3,0,0.7,0l0,0
	c0.2,0,0.3,0,0.4,0c0.3,0,0.6-0.2,0.8-0.4C4,3.2,4.1,3.1,4.2,2.9l0.2-0.2c0.3-0.4,0.4-0.6,0.6-0.7C5,1.9,5.1,1.8,5.3,1.7
	c0.2-0.1,0.5-0.1,0.9-0.1h1.6c0.5,0,0.7,0,0.9,0.1c0.1,0,0.3,0.1,0.4,0.2c0.2,0.1,0.3,0.3,0.6,0.7l0.2,0.2c0.1,0.2,0.2,0.3,0.2,0.3
	c0.2,0.2,0.5,0.4,0.8,0.4C10.9,3.7,11.1,3.7,11.3,3.7L11.3,3.7z"/>
  <path d="M9,7.7c0,1.1-0.9,2-2,2s-2-0.9-2-2s0.9-2,2-2S9,6.6,9,7.7z"/>
</svg>
`

export default function Cameras() {
  const onSelect = (value: string) => {
    console.log('Cameras:', value)
  }
  return (
    <Dropdown
      title={icon}
      options={[
        {
          title: 'Main Camera',
          value: 'mainCamera',
          type: 'option',
        },
        {
          title: 'Quad Cameras',
          value: 'quadCameras',
          type: 'option',
        },
        {
          title: 'Add Camera',
          value: 'addCamera',
          type: 'option',
        },
      ]}
      onSelect={onSelect}
    />
  )
}
