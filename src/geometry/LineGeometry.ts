// Libs
import { BufferAttribute, BufferGeometry } from 'three'
// @ts-ignore
import getNormals from 'polyline-normals'
// Utils
import { distance2 } from '@/utils/math'

const VERTS_PER_POINT = 2

export type LineGeometryProps = {
  closed?: boolean
  distances?: boolean
}

/**
 * Based on https://github.com/mattdesl/three-line-2d
 */
export default class LineGeometry extends BufferGeometry {
  pathLength = 0

  constructor(path: Array<number[]>, opt?: LineGeometryProps) {
    super()

    this.setAttribute('position', new BufferAttribute(new Float32Array(), 3))
    this.setAttribute('lineNormal', new BufferAttribute(new Float32Array(), 2))
    this.setAttribute('lineMiter', new BufferAttribute(new Float32Array(), 1))
    if (opt?.distances) {
      this.setAttribute('lineDistance', new BufferAttribute(new Float32Array(), 2))
    }
    this.setIndex(new BufferAttribute(new Float32Array(), 1))
    this.update(path, opt?.closed)
  }

  update(path: Array<number[]>, closed = false) {
    const normals = getNormals(path, closed)

    if (closed) {
      path = path.slice()
      path.push(path[0])
      normals.push(normals[0])
    }

    const attrPosition = this.getAttribute('position') as BufferAttribute
    const attrNormal = this.getAttribute('lineNormal') as BufferAttribute
    const attrMiter = this.getAttribute('lineMiter') as BufferAttribute
    const attrDistance = this.getAttribute('lineDistance') as BufferAttribute
    const attrIndex = this.getIndex() as BufferAttribute

    let count = 0
    const indexCount = Math.max(0, (path.length - 1) * 6)
    if (!attrPosition.array || path.length !== attrPosition.array.length / 3 / VERTS_PER_POINT) {
      count = path.length * VERTS_PER_POINT
      attrPosition.array = new Float32Array(count * 3)
      attrNormal.array = new Float32Array(count * 2)
      attrMiter.array = new Float32Array(count)
      attrIndex.array = new Uint16Array(indexCount)
      if (attrDistance) {
        attrDistance.array = new Float32Array(count * 2)
      }
    }

    if (attrPosition.count !== undefined) {
      attrPosition.count = count
    }
    attrPosition.needsUpdate = true

    if (attrNormal.count !== undefined) {
      attrNormal.count = count
    }
    attrNormal.needsUpdate = true

    if (attrMiter.count !== undefined) {
      attrMiter.count = count
    }
    attrMiter.needsUpdate = true

    if (attrIndex.count !== undefined) {
      attrIndex.count = indexCount
    }
    attrIndex.needsUpdate = true

    if (attrDistance) {
      if (attrDistance.count !== undefined) {
        attrDistance.count = count
      }
      attrDistance.needsUpdate = true
    }

    let index = 0
    let c = 0
    let dIndex = 0
    let pathLength = 0
    let lastPt: any = undefined
    const indexArray = attrIndex.array

    // Determine path length
    path.forEach((point) => {
      if (lastPt !== undefined) {
        pathLength += distance2(point[0], point[1], lastPt[0], lastPt[1])
      }
      lastPt = point
    })
    this.pathLength = pathLength

    // Determine normalized position of each vertice along path
    lastPt = undefined
    let pos = 0
    path.forEach(function (point) {
      const i = index
      // @ts-ignore
      indexArray[c++] = i + 0
      // @ts-ignore
      indexArray[c++] = i + 1
      // @ts-ignore
      indexArray[c++] = i + 2
      // @ts-ignore
      indexArray[c++] = i + 2
      // @ts-ignore
      indexArray[c++] = i + 1
      // @ts-ignore
      indexArray[c++] = i + 3

      let dist = 0
      if (lastPt !== undefined) {
        dist = distance2(point[0], point[1], lastPt[0], lastPt[1])
      }
      lastPt = point

      attrPosition.setXYZ(index++, point[0], point[1], 0)
      attrPosition.setXYZ(index++, point[0], point[1], 0)

      if (attrDistance) {
        pos += dist
        attrDistance.setXY(dIndex++, pos, pathLength)
        attrDistance.setXY(dIndex++, pos, pathLength)
      }
    })

    let nIndex = 0
    let mIndex = 0
    normals.forEach((n: Array<any>) => {
      const norm = n[0]
      const miter = n[1]
      attrNormal.setXY(nIndex++, norm[0], norm[1])
      attrNormal.setXY(nIndex++, norm[0], norm[1])
      attrMiter.setX(mIndex++, -miter)
      attrMiter.setX(mIndex++, miter)
    })
  }

  static createPath(geometry: any, scalar = false): Array<number[]> {
    const s = scalar ? window.devicePixelRatio : 1
    const path: Array<number[]> = []
    const total = geometry.vertices.length
    for (let i = 0; i < total; ++i) {
      path.push([geometry.vertices[i].x * s, geometry.vertices[i].y * s])
    }
    return path
  }
}
