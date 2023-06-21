import { Component, ReactNode } from 'react'
import { SVGProps } from './types'

export interface SVGEllipseProps extends SVGProps {
  x?: number | string | undefined
  y?: number | string | undefined
  width?: number | string | undefined
  height?: number | string | undefined
}

export default class SVGEllipse extends Component<SVGEllipseProps> {
  constructor(props: SVGEllipseProps) {
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
    } = this.state as SVGEllipseProps
    return (
      <ellipse
        cx={x}
        cy={y}
        rx={width}
        ry={height}
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
      ></ellipse>
    )
  }
}
