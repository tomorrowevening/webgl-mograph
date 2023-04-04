// Libs
import { useEffect, useState } from 'react'
import { Material, MeshBasicMaterial, Vector2 } from 'three'
// Models
import assets from '@/models/assets'
import { Events, threeDispatcher } from '@/models/constants'
// Views
import './header.scss'
import TextButton from '../ux/TextButton'
import LogoMaterial from '@/materials/ui/LogoMaterial'
import TextMesh from '@/mesh/TextMesh'
import UIMesh from '@/mesh/UIMesh'
// Controllers
import scenes from '@/controllers/SceneController'
// Utils
import { sin } from '@/utils/math'

export default function Header() {
  const font = 'anurati'
  // States
  const [ready, setReady] = useState(false)
  const [logoMat, setLogoMat] = useState<LogoMaterial | undefined>(undefined)

  // RAF handler
  const onUpdate = (evt: any) => {
    if (!ready) return
    if (logoMat !== undefined) {
      logoMat.time = evt.value
      logoMat.intensity = sin(1, 4, logoMat.time)
    }
  }

  useEffect(() => {
    const onAppReady = () => {
      // Logo
      setLogoMat(
        new LogoMaterial({
          map: assets.textures.get(font).clone(),
          resolution: new Vector2(1 / 256, 1 / 75).multiplyScalar(10),
        }),
      )

      // Refresh components
      setReady(true)
    }

    scenes.addEventListener(Events.UPDATE, onUpdate)
    threeDispatcher.addEventListener(Events.APP_READY, onAppReady)
    return () => {
      scenes.removeEventListener(Events.UPDATE, onUpdate)
      threeDispatcher.removeEventListener(Events.APP_READY, onAppReady)
    }
  }, [onUpdate])

  return (
    <header>
      {ready ? (
        <>
          <TextButton
            name="logo"
            width={148}
            height={44}
            left={20}
            top={20}
            align="TL"
            material={logoMat}
            params={{
              font: assets.json.get(font),
              fontSize: 24,
              text: 'TOMORROW\nEVENING',
            }}
            onInit={(mesh: TextMesh | UIMesh) => {
              mesh.position.set(0, -10, 0)
            }}
            onClick={() => {
              console.log('TextButton::onClick')
            }}
          />
        </>
      ) : null}
    </header>
  )
}
