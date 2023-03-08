import { Material, Mesh, Object3D } from 'three'

export const disposeMaterial = (material?: Material | Material[]): void => {
  if (!material) return

  if (Array.isArray(material)) {
    material.forEach((mat: Material) => mat.dispose())
  } else {
    material.dispose()
  }
}

// Dispose object
export const dispose = (object: Object3D): void => {
  if (!object) return

  // Dispose children
  while (object.children.length > 0) {
    const child = object.children[0]
    dispose(child)
  }

  // Dispose object
  if (object.parent) object.parent.remove(object)
  // @ts-ignore
  if (object.isMesh) {
    const mesh = object as Mesh
    mesh.geometry?.dispose()
    disposeMaterial(mesh.material)
  }

  // @ts-ignore
  if (object.dispose !== undefined) object.dispose()
}