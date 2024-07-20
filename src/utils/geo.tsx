import { baseScale, baseTranslate, countryConfigs } from '@/constants'
import { geoMercator } from 'd3-geo'
import { getRandom } from './random'
import bordersJson from '../assets/borders.json'
import continents from '../assets/continents.json'
import cities from '../assets/cities-pruned.json'
import { groupBy } from 'lodash'
import { INodeType, Node } from '@/types'
import { haversineDistance } from './getNodesWithDistance'

const projection = geoMercator().translate(baseTranslate).scale(baseScale)

let id = 0
let _nodes: Node[]
// for each city, generate nodes around it based on its density and size
export const getNodes = (g: SVGGElement) => {
  if (_nodes) return _nodes

  const result = cities.flatMap((_city) => {
    const city = {
      ..._city,
      coords: projection(_city.earthCoords as [number, number])!,
      x: _city.earthCoords[0],
      y: _city.earthCoords[1],
    }

    return getRandomNonUniformPointsInCircle(city, g).map((point) => {
      const [x, y] = projection.invert?.([point.x, point.y]) ?? [0, 0]
      return {
        id: -1,
        ...point,
        earthCoords: [x, y] as [number, number],
      }
    })
  })

  const groupedByCountry = groupBy(result, (r) => r.country)

  _nodes = Object.values(groupedByCountry).flatMap((nodes) =>
    groupCoordinates(nodes, 13).flatMap((g) => ({ ...g[0], id: id++ })),
  )

  return _nodes as Node[]
}

type IBordersKey = keyof typeof bordersJson
type IContinentKey = keyof typeof continents
type IConfigKey = keyof typeof countryConfigs

const getCityConfig = (city: { country: string }) => {
  const continentName = continents[city.country as IContinentKey]
  return (
    countryConfigs[city.country as IConfigKey] ??
    countryConfigs[continentName as IConfigKey] ??
    countryConfigs.default
  )
}

function getRandomNonUniformPointsInCircle(
  city: {
    coords: [number, number]
    country: string
    population: number
    density: number
  },
  element: SVGGElement,
) {
  const config = getCityConfig(city)
  const [centerX, centerY] = city.coords
  const { densityFactor, maxDensity, maxNodes, popFactor } = config
  const radius = densityFactor / Math.min(maxDensity, city.density)
  const numberOfPoints = Math.floor(
    Math.min(maxNodes, Math.max(1, city.population / (popFactor * 4))),
  )
  let points: { x: number; y: number; country: string; type: INodeType }[] = []
  let fails = 0
  const angleMultiplier = 2 * Math.PI

  const svg = element.parentElement as unknown as SVGSVGElement
  const p = svg.createSVGPoint()
  const paths = Array.from(element.childNodes[0].childNodes) as SVGPathElement[]
  const borders = bordersJson[city.country as IBordersKey] as string[]
  const _paths = paths.filter(
    (p) =>
      borders.includes(p.getAttribute('name') ?? '') ||
      p.getAttribute('name') === city.country,
  )
  // we are reseting the rng each time, maybe we shouldnt?
  const random = getRandom()
  const random2 = getRandom()

  while (points.length < numberOfPoints && fails < 1000) {
    const angle = random() * angleMultiplier
    const r = radius * Math.sqrt(random())
    const x = centerX + r * Math.cos(angle)
    const y = centerY + r * Math.sin(angle)

    p.x = x
    p.y = y

    const containingCountry = _paths.find((node) => node.isPointInFill(p))

    if (containingCountry) {
      points.push({
        x,
        y,
        type:
          points.length === 0 && city.density > 3
            ? 'bank'
            : random2() < 0.2
            ? 'rich'
            : 'basic',
        country: containingCountry.getAttribute('name') ?? 'Unknown',
      })
    } else {
      fails++
    }
  }

  return points
}

function groupCoordinates(nodes: Node[], maxDistance: number) {
  const groups = []

  for (let node of nodes) {
    let added = false

    for (let group of groups) {
      for (let member of group) {
        if (
          haversineDistance(
            node.earthCoords![1],
            node.earthCoords![0],
            member.earthCoords![1],
            member.earthCoords![0],
          ) <= maxDistance
        ) {
          group.push(node)
          added = true
          break
        }
      }
      if (added) break
    }

    if (!added) {
      groups.push([node])
    }
  }

  return groups
}

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
