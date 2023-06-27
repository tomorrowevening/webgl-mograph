import { Component, ReactNode } from 'react'
import { SVGProps } from './types'
import { roundTo } from '@/utils/math'
import {
  arrayToSVGPath,
  bezierPathDistance,
  getPathBetween,
  getPointInPath,
  lerpArray,
  pathToPoints,
} from '@/utils/svg'

export interface SVGPathProps extends SVGProps {
  d: string
  startPercent?: number
  endPercent?: number
  offsetPercent?: number
}

export default class SVGPath extends Component<SVGPathProps> {
  private points: number[][][] = []
  private originals: number[][][] = []
  private segments: number[] = []
  private refPath: number[][]

  private straightPath = false
  private _startPercent = 0
  private _endPercent = 1
  private _offsetPercent = 0

  constructor(props: SVGPathProps) {
    super(props)

    // Props
    if (props.startPercent !== undefined) this._startPercent = props.startPercent
    if (props.endPercent !== undefined) this._endPercent = props.endPercent
    if (props.offsetPercent !== undefined) this._offsetPercent = props.offsetPercent
    if (props.d !== undefined) {
      this.points = pathToPoints(props.d)
      this.originals = this.points.slice()
      this.segments = bezierPathDistance(this.points[0])
      this.straightPath = props.d.match(/[C|c|S|s]/g) ? false : true
    }

    // Set State
    this.state = {
      ...this.state,
      ...props,
    }

    this.refPath = this.firstPath
  }

  pointAt(percentage: number): number[] {
    return getPointInPath(this.points[0], this.segments, percentage)
  }

  updatePath() {
    let pathToUse = this.originals
    let startP = this._startPercent + this._offsetPercent
    let endP = this._endPercent + this._offsetPercent

    if (startP > 1 || startP < 0) startP %= 1
    if (endP > 1 || endP < 0) endP %= 1

    if (startP === endP) {
      this.setState({ d: '' })
      return
    }

    if (endP === 0 && this._endPercent !== 0) endP = 1

    if (startP > 0 || endP < 1) {
      if (startP > endP) {
        pathToUse = this.updatePathBetween(startP, 1)
        const string = arrayToSVGPath(pathToUse, this.straightPath)
        pathToUse = this.updatePathBetween(0, endP)
        const string2 = arrayToSVGPath(pathToUse, this.straightPath)
        this.setState({ d: string + string2 })
        return
      } else {
        pathToUse = this.updatePathBetween(startP, endP)
        this.setState({ d: arrayToSVGPath(pathToUse, this.straightPath) })
        return
      }
    } else {
      this.points = this.originals.slice()
      this.setState({ d: this.props.d })
      return
    }
  }

  updatePathBetween(start: number, end: number): number[][][] {
    this.refPath = this.refPath || this.firstPath
    this.firstPath = this.refPath.slice()

    if (!this.segments) {
      this.segments = bezierPathDistance(this.points[0])
    }

    const precision = 3
    const seg = this.segments.slice()
    let forceMiddle = null
    const normalStart = roundTo(start, precision)
    const normalEnd = roundTo(end, precision)

    if (normalStart > normalEnd) {
      let middle = lerpArray(0.5, normalStart, 1.0 + normalEnd)
      middle = roundTo(middle - Math.floor(middle), precision)
      if (middle >= start && middle <= end) forceMiddle = middle
    }

    if (this._startPercent > 0 || this._endPercent < 1) {
      this.firstPath = getPathBetween(start, end, this.firstPath, seg, forceMiddle)
    }

    return [this.firstPath]
  }

  render(): ReactNode {
    const {
      d,
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
    } = this.state as SVGPathProps

    return (
      <path
        d={d}
        // BaseSVG
        fill={fill !== undefined ? fill : 'none'}
        fillOpacity={fillOpacity}
        stroke={stroke !== undefined ? stroke : 'none'}
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap={strokeLinecap}
        strokeLinejoin={strokeLinejoin}
        strokeMiterlimit={strokeMiterlimit}
        strokeOpacity={strokeOpacity}
        strokeWidth={strokeWidth}
      ></path>
    )
  }

  // Getters / Setters

  get firstPath(): number[][] {
    return this.points[0]
  }

  set firstPath(value: number[][]) {
    this.points[0] = value
  }

  get startPercent(): number {
    return this._startPercent
  }

  set startPercent(value: number) {
    this._startPercent = value
    this.updatePath()
  }

  get endPercent(): number {
    return this._endPercent
  }

  set endPercent(value: number) {
    this._endPercent = value
    this.updatePath()
  }

  get offsetPercent(): number {
    return this._offsetPercent
  }

  set offsetPercent(value: number) {
    this._offsetPercent = value
    this.updatePath()
  }
}
