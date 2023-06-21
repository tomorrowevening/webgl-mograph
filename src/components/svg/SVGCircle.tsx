import { Component, ReactNode } from 'react'
import { SVGProps } from './types'

export interface SVGCircleProps extends SVGProps {
  radius?: number | string | undefined
  x?: number | string | undefined
  y?: number | string | undefined
}

export default class SVGCircle extends Component<SVGCircleProps> {
  constructor(props: SVGCircleProps) {
    super(props)
    this.state = {
      ...this.state,
      ...props,
    }
  }

  render(): ReactNode {
    const {
      radius,
      x,
      y,
      fill,
      fillOpacity,
      stroke,
      strokeDasharray,
      strokeDashoffset,
      strokeLinecap,
      strokeLinejoin,
      strokeMiterlimit,
      strokeOpacity,
      strokeWidth,
    } = this.state as SVGCircleProps
    return (
      <circle
        cx={x}
        cy={y}
        r={radius}
        // BaseSVG
        fill={fill}
        fillOpacity={fillOpacity}
        stroke={stroke}
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
        strokeMiterlimit={strokeMiterlimit}
        strokeOpacity={strokeOpacity}
        strokeWidth={strokeWidth}
      ></circle>
    )
  }
}
