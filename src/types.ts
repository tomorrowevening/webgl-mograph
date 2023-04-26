import { Material, Vector2 } from 'three'
import { BlendFunction } from 'postprocessing'
import TextMesh from './mesh/ui/TextMesh'
import UIMesh from './mesh/ui/UIMesh'

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
  params?: any
  width: number
  height: number
  left?: number
  top?: number
  right?: number
  bottom?: number
  align?: UIAlign
  material?: Material
  onInit?: (mesh: TextMesh | UIMesh) => void
  onRollOver?: () => void
  onRollOut?: () => void
  onClick?: () => void
}

export const BlendOptions = [
  {
    text: 'ADD',
    value: BlendFunction.ADD,
  },
  {
    text: 'ALPHA',
    value: BlendFunction.ALPHA,
  },
  {
    text: 'AVERAGE',
    value: BlendFunction.AVERAGE,
  },
  {
    text: 'COLOR',
    value: BlendFunction.COLOR,
  },
  {
    text: 'COLOR_BURN',
    value: BlendFunction.COLOR_BURN,
  },
  {
    text: 'COLOR_DODGE',
    value: BlendFunction.COLOR_DODGE,
  },
  {
    text: 'DARKEN',
    value: BlendFunction.DARKEN,
  },
  {
    text: 'DIFFERENCE',
    value: BlendFunction.DIFFERENCE,
  },
  {
    text: 'DIVIDE',
    value: BlendFunction.DIVIDE,
  },
  {
    text: 'DST',
    value: BlendFunction.DST,
  },
  {
    text: 'EXCLUSION',
    value: BlendFunction.EXCLUSION,
  },
  {
    text: 'HARD_LIGHT',
    value: BlendFunction.HARD_LIGHT,
  },
  {
    text: 'HARD_MIX',
    value: BlendFunction.HARD_MIX,
  },
  {
    text: 'HUE',
    value: BlendFunction.HUE,
  },
  {
    text: 'INVERT',
    value: BlendFunction.INVERT,
  },
  {
    text: 'INVERT_RGB',
    value: BlendFunction.INVERT_RGB,
  },
  {
    text: 'LIGHTEN',
    value: BlendFunction.LIGHTEN,
  },
  {
    text: 'LINEAR_BURN',
    value: BlendFunction.LINEAR_BURN,
  },
  {
    text: 'LINEAR_DODGE',
    value: BlendFunction.LINEAR_DODGE,
  },
  {
    text: 'LINEAR_LIGHT',
    value: BlendFunction.LINEAR_LIGHT,
  },
  {
    text: 'LUMINOSITY',
    value: BlendFunction.LUMINOSITY,
  },
  {
    text: 'MULTIPLY',
    value: BlendFunction.MULTIPLY,
  },
  {
    text: 'NEGATION',
    value: BlendFunction.NEGATION,
  },
  {
    text: 'NORMAL',
    value: BlendFunction.NORMAL,
  },
  {
    text: 'OVERLAY',
    value: BlendFunction.OVERLAY,
  },
  {
    text: 'PIN_LIGHT',
    value: BlendFunction.PIN_LIGHT,
  },
  {
    text: 'REFLECT',
    value: BlendFunction.REFLECT,
  },
  {
    text: 'SATURATION',
    value: BlendFunction.SATURATION,
  },
  {
    text: 'SCREEN',
    value: BlendFunction.SCREEN,
  },
  {
    text: 'SOFT_LIGHT',
    value: BlendFunction.SOFT_LIGHT,
  },
  {
    text: 'SRC',
    value: BlendFunction.SRC,
  },
  {
    text: 'SUBTRACT',
    value: BlendFunction.SUBTRACT,
  },
  {
    text: 'VIVID_LIGHT',
    value: BlendFunction.VIVID_LIGHT,
  },
]
