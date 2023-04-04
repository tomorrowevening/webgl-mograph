import { Material, Vector2 } from 'three'

export type Scenes = 'lobby' | 'intro' | 'credits'

// Transitions

export type Transitions = 'wipe'

// UI

export type UIAlign = 'TL' | 'TC' | 'TR' | 'CL' | 'CC' | 'CR' | 'BL' | 'BC' | 'BR'

export interface BaseUI {
  align: UIAlign
  anchor: Vector2
  width: number
  height: number
  reposition(width: number, height: number): void
}

export interface MeshUX {
  name: string
  width: number
  height: number
  left?: number
  top?: number
  right?: number
  bottom?: number
  align?: UIAlign
  material?: Material
  onRollOver: () => void
  onRollOut: () => void
  onClick: () => void
}
