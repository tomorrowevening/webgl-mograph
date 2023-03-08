import { Scene } from 'three'

export default class BaseScene extends Scene {
  async init(): Promise<any> {
    return Promise.all([
      this.initMesh(),
      this.initPost(),
      this.initAnimation(),
    ])
  }

  protected initMesh(): Promise<void> {
    return new Promise((resolve) => {
      resolve()
    })
  }

  protected initPost(): Promise<void> {
    return new Promise((resolve) => {
      resolve()
    })
  }

  protected initAnimation(): Promise<void> {
    return new Promise((resolve) => {
      resolve()
    })
  }

  enable(): void {
    //
  }

  disable(): void {
    //
  }

  show(): void {
    //
  }

  hide(): void {
    //
  }

  update(): void {
    //
  }

  draw(): void {
    //
  }

  resize(width: number, height: number): void {
    //
  }
}
