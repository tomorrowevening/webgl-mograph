import { Vector2 } from 'three'

export type Scenes = 'intro' | 'credits'

// Transitions

export type Transitions = 'wipe'

// UI

export type UIAlign =
  | 'TL'
  | 'TC'
  | 'TR'
  | 'CL'
  | 'CC'
  | 'CR'
  | 'BL'
  | 'BC'
  | 'BR'

export interface BaseUI {
  align: UIAlign
  anchor: Vector2
  width: number
  height: number
  reposition(width: number, height: number): void
}
