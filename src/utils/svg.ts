import { CSSProperties } from 'react'
import { clamp, mix, roundTo } from '@/utils/math'

export function remapZeroOne(value: number, minO: number, maxO: number): number {
  if (minO == maxO) return 0
  return (value - minO) / (maxO - minO)
}

export function remapZeroOneClamp(value: number, minO: number, maxO: number): number {
  return Math.min(Math.max(remapZeroOne(value, minO, maxO), 0), 1)
}

export function addArray(a: number[], b: number[]): number[] {
  const array = []
  for (let i = 0, len = a.length; i < len; i++) {
    array.push(a[i] + b[i])
  }
  return array
}

export function subArray(a: number[], b: number[]): number[] {
  const array = []
  for (let i = 0, len = a.length; i < len; i++) {
    array.push(a[i] - b[i])
  }
  return array
}

export function lengthArray(a: number[]): number {
  let count = 0
  for (let i = 0, len = a.length; i < len; i++) {
    count += a[i] * a[i]
  }
  return Math.sqrt(count)
}

// @ts-ignore
export function lerpArray(factor: number, a: any, b: any) {
  if (a instanceof Array) {
    const rArray = []
    for (let i = 0, length = a.length; i < length; i++) {
      rArray.push(lerpArray(factor, a[i], b[i]))
    }
    return rArray
  }
  return mix(a, b, factor)
}

export function firstIndexOfValue(value: number, array: number[]): number {
  for (let i = 0, len = array.length; i < len; i++) {
    if (array[i] == value) return i
  }
  return -1
}

export function lastIndexOfValue(value: number, array: number[]): number {
  let index = -1
  for (let i = 0, len = array.length; i < len; i++) {
    if (array[i] == value) index = i
  }
  return index
}

export function addPointInPathAt(path: number[][], distanceList: any, percentage: number, protectDistances?: boolean) {
  if (firstIndexOfValue(percentage, distanceList) != -1) {
    return
  }

  const changeDistances = protectDistances || true

  percentage = Math.max(Math.min(1.0, percentage), 0.0)

  let stepper = 0
  let cPercentage = 0
  while (cPercentage < percentage) {
    cPercentage = distanceList[stepper++]
    if (cPercentage >= percentage) {
      stepper -= 2
      stepper = Math.max(0, stepper)
    }
  }

  const cIndex = stepper
  const nextIndex = stepper + 1
  const localPercent = remapZeroOneClamp(percentage, distanceList[cIndex], distanceList[nextIndex])
  const nPoint = splitBezierAt(
    localPercent,
    path[cIndex * 3],
    path[cIndex * 3 + 1],
    path[cIndex * 3 + 2],
    path[cIndex * 3 + 3],
  )
  path.splice(stepper * 3 + 1, 2, nPoint[0], nPoint[1], nPoint[2], nPoint[3], nPoint[4])

  if (changeDistances) {
    distanceList.splice(stepper + 1, 0, percentage)
  }

  return path
}

export function bezierPathDistance(path: number[][]): number[] {
  const segmentsList = []
  segmentsList.push(0)

  let length = 0
  const steps = 2
  const step = 1.0 / steps
  const pLength = path.length
  for (let i = 0; i < pLength - 1; i += 3) {
    let lastPoint = path[i]
    let lastP = path[i + 3]
    if (lastP === undefined) lastP = [0, 0]
    for (let j = step; j <= 1.0; j += step) {
      const nPoint = bezierPointAt(j, path[i], path[i + 1], path[i + 2], lastP)
      const cLength = lengthArray(subArray(nPoint, lastPoint))
      length += cLength
      lastPoint = nPoint
    }
    segmentsList.push(length)
  }

  for (let i = 0; i < segmentsList.length; i += 1) {
    segmentsList[i] = segmentsList[i] / length
  }
  return segmentsList
}

export function bezierPointAt(t: number, p0: number[], p1: number[], p2: number[], p3: number[]): number[] {
  const u = 1.0 - t
  const uu = u * u
  const uuu = uu * u
  const tt = t * t
  const ttt = tt * t
  const x = uuu * p0[0] + 3.0 * uu * t * p1[0] + 3.0 * u * tt * p2[0] + ttt * p3[0]
  const y = uuu * p0[1] + 3.0 * uu * t * p1[1] + 3.0 * u * tt * p2[1] + ttt * p3[1]
  return [x, y]
}

export function getPathBetween(start: number, end: number, path: number[][], segments: number[], forceMiddle?: number) {
  const nPath = path.slice()
  const nSegs = segments

  addPointInPathAt(nPath, nSegs, start)
  if (forceMiddle) {
    addPointInPathAt(nPath, nSegs, forceMiddle)
  }
  addPointInPathAt(nPath, nSegs, end)

  const startIndex = lastIndexOfValue(start, nSegs)
  const endIndex = firstIndexOfValue(end, nSegs)
  const finalPath = []
  for (let i = startIndex * 3; i <= endIndex * 3; i++) {
    finalPath.push(nPath[i])
  }
  return finalPath
}

export function getPointInPath(path: number[][], distanceList: number[], percentage: number) {
  if (firstIndexOfValue(percentage, distanceList) != -1) {
    if (percentage < 0.5) return path[0]
    return path[path.length - 1]
  }

  const percent = clamp(0, 1, percentage)
  let stepper = 0
  let cPercentage = 0
  while (cPercentage < percent) {
    cPercentage = distanceList[stepper++]
    if (cPercentage >= percent) {
      stepper -= 2
      stepper = Math.max(0, stepper)
    }
  }

  const cIndex = stepper
  const nextIndex = stepper + 1
  const localPercent = remapZeroOneClamp(percent, distanceList[cIndex], distanceList[nextIndex])
  return bezierPointAt(localPercent, path[cIndex * 3], path[cIndex * 3 + 1], path[cIndex * 3 + 2], path[cIndex * 3 + 3])
}

export function splitBezierAt(p: number, p0: number[], p1: number[], p2: number[], p3: number[]) {
  const p4 = lerpArray(p, p0, p1)
  const p5 = lerpArray(p, p1, p2)
  const p6 = lerpArray(p, p2, p3)
  const p7 = lerpArray(p, p4, p5)
  const p8 = lerpArray(p, p5, p6)
  const p9 = lerpArray(p, p7, p8)
  return [p4, p7, p9, p8, p6]
}

//

export function getMaxBorder(style: CSSProperties) {
  return style.strokeWidth !== undefined ? (style.strokeWidth as number) / 2 : 0
}

export function getDefs(svg: SVGElement) {
  const totalLayers = svg.children.length
  for (let i = 0; i < totalLayers; ++i) {
    const l = svg.children[i]
    if (l.tagName === 'defs') return l
  }
  return undefined
}

export function pointsToArray(path: any) {
  const numbers = path.match(/-?[0-9|.]+/g)
  const array = []
  for (let i = 0, length = numbers.length; i < length; i += 2) {
    array.push([parseFloat(numbers[i]), parseFloat(numbers[i + 1])])
  }
  return array
}

export function pushNumbersForCurve(array: number[][], numbers: number[], anchor: number[]) {
  for (let i = 0; i < numbers.length; i += 2) {
    array.push(addArray(anchor, [numbers[i], numbers[i + 1]]))
  }
}

export function pathToPoints(drawn: string): number[][][] {
  const array: number[][][] = []
  const straightPath = drawn.match(/[C|c|S|s]/g) ? false : true
  const order = drawn.match(/([a-z]|[A-Z])/g)!
  const numbers = drawn.match(/([^a-zA-Z]+)/g)!
  let currentSVG: number[][] = []
  array.push(currentSVG)
  for (let i = 0, length = numbers.length; i < length; i++) {
    const s = numbers[i]
    const subString = s.match(/-?[0-9|.]+/g)!
    const pts: number[] = []
    if (subString !== null) {
      for (let j = 0; j < subString.length; j++) {
        pts.push(parseFloat(subString[j]))
      }
      addPointToArray(currentSVG, pts, order[i], straightPath)
    } else {
      currentSVG = []
      array.push(currentSVG)
    }
  }
  return array
}

export function addPointToArray(array: number[][], numbers: number[], order: string, straightPath?: boolean) {
  let lastPoint = [0, 0]
  if (array.length > 0) {
    lastPoint = array[array.length - 1]
  }
  switch (order) {
    case 'M':
      array.push([numbers[0], numbers[1]])
      break
    case 'c':
      pushNumbersForCurve(array, numbers, lastPoint)
      break
    case 'C':
      pushNumbersForCurve(array, numbers, [0.0, 0.0])
      break
    case 'h':
      addCurveForLine(array, lastPoint, [lastPoint[0] + numbers[0], lastPoint[1]])
      break
    case 'H':
      addCurveForLine(array, lastPoint, [numbers[0], lastPoint[1]])
      break
    case 'v':
      addCurveForLine(array, lastPoint, [lastPoint[0], lastPoint[1] + numbers[0]])
      break
    case 'V':
      addCurveForLine(array, lastPoint, [lastPoint[0], numbers[0]])
      break
    case 'l':
      addCurveForLine(array, lastPoint, addArray(lastPoint, numbers))
      break
    case 'L':
      addCurveForLine(array, lastPoint, numbers)
      break
    case 'S':
      array.push(addArray(lastPoint, subArray(lastPoint, array[array.length - 2])))
      array.push([numbers[0], numbers[1]])
      array.push([numbers[2], numbers[3]])
      break
    case 's':
      const pointBeforeLast = array[array.length - 2]
      const vector = subArray(lastPoint, pointBeforeLast)
      const nPoint = addArray(lastPoint, vector)

      array.push(nPoint)
      array.push([lastPoint[0] + numbers[0], lastPoint[1] + numbers[1]])
      array.push([lastPoint[0] + numbers[2], lastPoint[1] + numbers[3]])
      break

    default:
      console.log('ORDER UNKNOWN :', order)
  }
}

export function addCurveForLine(array: number[][], oldPoint: number[], newPoint: number[]) {
  array.push(lerpArray(0.01, oldPoint, newPoint))
  array.push(lerpArray(0.99, oldPoint, newPoint))
  array.push(newPoint)
}

export function arrayToSVGString(array: number[][], straightPath: boolean) {
  let string = ''

  try {
    string = 'M' + Math.floor(array[0][0] * 10.0) / 10.0 + ',' + (Math.floor(array[0][1] * 10.0) / 10.0).toString()
    if (straightPath) {
      for (let i = 1, length = array.length; i < length; i++) {
        string += 'L' + Math.floor(array[i][0] * 10.0) / 10.0
        if (array[i][1] >= 0) {
          string += ','
        }
        string += (Math.floor(array[i][1] * 10.0) / 10.0).toString()
      }
    } else {
      for (let i = 1, length = array.length; i < length; i += 3) {
        string += 'C' + Math.floor(array[i][0] * 10.0) / 10.0 + ',' + Math.floor(array[i][1] * 10.0) / 10.0
        for (let j = i + 1; j < i + 3; j++) {
          string +=
            ',' +
            (Math.floor(array[j][0] * 10.0) / 10.0).toString() +
            ',' +
            (Math.floor(array[j][1] * 10.0) / 10.0).toString()
        }
      }
    }
  } catch (err: any) {
    console.log("arrayToSVGString: Couldn't update path")
    console.log(err)
    console.log(array)
  }

  return string
}

export function arrayToSVGPath(array: number[][][], straightPath: boolean) {
  let returnString = ''
  for (let i = 0; i < array.length; i++) {
    returnString += arrayToSVGString(array[i], straightPath)
  }
  return returnString
}
