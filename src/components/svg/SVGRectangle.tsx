import { Component, ReactNode } from 'react'
import { SVGProps } from './types'

export interface SVGRectangleProps extends SVGProps {
  x?: number | string | undefined
  y?: number | string | undefined
  width?: number | string | undefined
  height?: number | string | undefined
  roundness?: number | string | undefined
}

export default class SVGRectangle extends Component<SVGRectangleProps> {
  constructor(props: SVGRectangleProps) {
    super(props)
    this.state = {
      ...this.state,
      ...props,
    }
  }

  render(): ReactNode {
    const {
      x,
      y,
      width,
      height,
      roundness,
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
    } = this.state as SVGRectangleProps
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={roundness}
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
      ></rect>
    )
  }
}
