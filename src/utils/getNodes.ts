import { geoMercator } from 'd3-geo'
import cities from '../assets/cities-pruned.json'
import continents from '../assets/continents.json'
import bordersJson from '../assets/borders.json'
import { baseScale, baseTranslate, countryConfigs, Node } from '@/constants'
import { groupBy } from 'lodash'
import { getRandom } from '@/utils/random'
import { groupCoordinates } from '@/utils/groupCoordinates'

const projection = geoMercator().translate(baseTranslate).scale(baseScale)
type IContinentKey = keyof typeof continents
type IConfigKey = keyof typeof countryConfigs
type IBordersKey = keyof typeof bordersJson

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
    const continentName = continents[city.country as IContinentKey]
    const config =
      countryConfigs[city.country as IConfigKey] ??
      countryConfigs[continentName as IConfigKey] ??
      countryConfigs.default

    return getRandomNonUniformPointsInCircle(city, config, g).map((point) => {
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

function getRandomNonUniformPointsInCircle(
  city: {
    coords: [number, number]
    country: string
    population: number
    density: number
  },
  config: {
    densityFactor: number
    maxDensity: number
    maxNodes: number
    popFactor: number
  },
  element: SVGGElement,
) {
  const [centerX, centerY] = city.coords
  const { densityFactor, maxDensity, maxNodes, popFactor } = config
  const radius = densityFactor / Math.min(maxDensity, city.density)
  const numberOfPoints = Math.floor(
    Math.min(maxNodes, Math.max(1, city.population / popFactor)),
  )
  let points: { x: number; y: number; country: string }[] = []
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
  const random = getRandom()

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
        country: containingCountry.getAttribute('name') ?? 'Unknown',
      })
    } else {
      fails++
    }
  }

  return points
}
