import { File } from '@/utils/preloader'
import fonts from './fonts'

const assetList: Array<File> = [
  //////////////////////////////////////////////////
  // JSON
  {
    name: 'data',
    file: 'json/data.json',
    type: 'json',
  },
  {
    name: 'animation',
    file: 'json/animation.json',
    type: 'json',
  },
  //////////////////////////////////////////////////
  // Models
  //////////////////////////////////////////////////
  // Textures
  {
    name: 'uv_grid',
    file: 'textures/uv_grid_opengl.jpeg',
    type: 'texture',
  },
]

fonts.list.forEach((font: string) => {
  assetList.push({
    name: font,
    file: `json/fonts/${font}.json`,
    type: 'json',
  })
  assetList.push({
    name: font,
    file: `textures/fonts/${font}.png`,
    type: 'texture',
  })
})

export default assetList
