import { geoMercator } from 'd3-geo'
import cities from '../assets/cities-pruned.json'
import continents from '../assets/continents.json'
import bordersJson from '../assets/borders.json'
import { countryConfigs } from '@/constants'
import { groupBy } from 'lodash'
import { getRandom } from '@/utils/random'
import { groupCoordinates } from '@/utils/groupCoordinates'

let _nodes: { x: number; y: number }[]
// for each city, generate nodes around it based on its density and size
export const getNodes = (
  scale: number,
  translate: [number, number],
  g: SVGGElement,
) => {
  if (_nodes) return _nodes
  const projection = geoMercator().translate(translate).scale(scale)
  const mappedCities = cities.map((c) => {
    return {
      ...c,
      coords: projection(c.earthCoords as [number, number])!,
      x: c.earthCoords[0],
      y: c.earthCoords[1],
    }
  })

  const result = mappedCities.flatMap((c) => {
    const continentName = continents[c.country as keyof typeof continents]
    const config =
      countryConfigs[c.country as keyof typeof countryConfigs] ??
      countryConfigs[continentName as keyof typeof countryConfigs] ??
      countryConfigs.default

    const { densityFactor, maxDensity, maxNodes, popFactor } = config
    return getRandomNonUniformPointsInCircle(
      ...c.coords,
      densityFactor / Math.min(maxDensity, c.density),
      Math.floor(Math.min(maxNodes, Math.max(1, c.population / popFactor))),
      g,
      c.country,
    ).map((d) => ({ ...c, ...d }))
  })

  const groupedByCountry = groupBy(result, (r) => r.country)

  const grouped = Object.values(groupedByCountry).flatMap((nodes) =>
    groupCoordinates(nodes, 50).flatMap((g) => g[0]),
  )
  _nodes = grouped.map((g) => {
    const [x, y] = projection.invert?.([g.x, g.y]) ?? [0, 0]

    return {
      // @ts-ignore
      country: g.country,
      x,
      y,
    }
  })

  return _nodes
}

function getRandomNonUniformPointsInCircle(
  centerX: number,
  centerY: number,
  radius: number,
  numberOfPoints: number,
  element: SVGGElement,
  country: string,
) {
  let points: { x: number; y: number; country: string }[] = []
  let fails = 0
  const angleMultiplier = 2 * Math.PI

  const svg = element.parentElement as unknown as SVGSVGElement
  const p = svg.createSVGPoint()
  const paths = Array.from(element.childNodes[0].childNodes) as SVGPathElement[]
  const borders = bordersJson[country as keyof typeof bordersJson] as string[]
  const _paths = paths.filter(
    (p) =>
      borders.includes(p.getAttribute('name') ?? '') ||
      p.getAttribute('name') === country,
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
