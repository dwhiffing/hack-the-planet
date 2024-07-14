import { baseScale, baseTranslate } from '@/constants'
import { geoMercator } from 'd3-geo'

export const coordsToTransform = (
  lng: number,
  lat: number,
  scale: number,
  width: number,
  height: number,
) => {
  const projection = geoMercator()
    .translate(baseTranslate)
    .scale(baseScale * scale)
  const coords = projection([lng, lat])!
  return {
    scaleX: scale,
    scaleY: scale,
    skewX: 0,
    skewY: 0,
    translateX: width / 2 + coords[0] * -1,
    translateY: height / 2 + coords[1] * -1,
  }
}

export const transformToCoords = (
  matrix: {
    translateX: number
    translateY: number
    scaleX: number
  },
  width: number,
  height: number,
) => {
  const projection = geoMercator()
    .translate(baseTranslate)
    .scale(baseScale * matrix.scaleX)

  return projection.invert!([
    matrix.translateX * -1 + width / 2,
    matrix.translateY * -1 + height / 2,
  ])!
}
