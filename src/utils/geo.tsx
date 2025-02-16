import { groupBy } from 'lodash'
import { geoMercator, GeoProjection } from 'd3-geo'
import { TransformMatrix } from '@vx/zoom/lib/types'

import { FullNode, INodeType, Node, NodeGroup } from '@/types'
import { getRandom } from '@/utils/random'
import { store } from '@/utils/valtioState'

import { baseScale, baseTranslate, countryConfigs } from '@/constants/index'
import bordersJson from '@/constants/borders.json'
import continents from '@/constants/continents.json'
import cities from '@/constants/cities-pruned.json'
import nodeOverrides from '@/constants/node-overrides.json'

const rangeSize = 1.5
export const projection = geoMercator()
  .translate(baseTranslate)
  .scale(baseScale)

type IBordersKey = keyof typeof bordersJson
type IContinentKey = keyof typeof continents
type IConfigKey = keyof typeof countryConfigs

export const getZoomLevel = (transform: TransformMatrix) => {
  const zoom = transform.scaleX
  if (zoom < 5) return 3
  if (zoom <= 13) return 2
  if (zoom <= 50) return 1
  return 0
}

export const getVisibleGroups = (
  transformMatrix: TransformMatrix,
  width: number,
  height: number,
) => {
  const coords = transformToCoords(transformMatrix, width, height)
  const zoomLevel = getZoomDrawDistance(transformMatrix.scaleX)
  if (zoomLevel === -1) return Object.keys(store.groupedNodes).join(':')
  const groups = getAdjacentGroups(coords[1], coords[0], zoomLevel)

  return groups.join(':')
}

export const groupNodes = (nodes: Node[]): Record<string, NodeGroup> => {
  const groups: Record<string, NodeGroup> = {}

  nodes.forEach((node) => {
    const key = getGroupFromLatLng(node.earthCoords![1], node.earthCoords![0])

    if (!groups[key]) {
      groups[key] = { key, nodes: [] }
    }
    groups[key].nodes.push(node)
  })

  return groups
}

export const getAdjacentNodes = (lat: number, lng: number) => {
  const groupedNodes = store.groupedNodes
  const adjacentGroups = getAdjacentGroups(lat, lng, 10)
  const relevantNodes: Node[] = []
  adjacentGroups.forEach((groupKey) => {
    if (groupedNodes[groupKey]) {
      relevantNodes.push(...(groupedNodes[groupKey].nodes ?? []))
    }
  })
  return relevantNodes
}

export const getNodesWithDistance = (nodes: Node[], node: Node) =>
  nodes.map((n) => ({
    id: n.id,
    node: n,
    dist: haversineDistance(
      node.earthCoords?.[1] ?? 0,
      node.earthCoords?.[0] ?? 0,
      n.earthCoords?.[1] ?? 0,
      n.earthCoords?.[0] ?? 0,
    ),
  }))

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
      const _id = id++
      const override = nodeOverrides[`${_id}` as keyof typeof nodeOverrides]

      const node = { ...point, scaling: 1, id: _id } as FullNode

      if (override) {
        node.type = override.type as INodeType
        node.scaling = override.scaling
        node.x = override.x
        node.y = override.y
      }

      node.earthCoords = projection.invert?.([node.x, node.y]) ?? [0, 0]
      return node
    })
  })

  const groupedByCountry = groupBy(result, (r) => r.country)

  _nodes = Object.values(groupedByCountry).flatMap((nodes) =>
    groupCoordinates(nodes, 13).flat(),
  )

  return _nodes as Node[]
}

export const coordsToTransform = (
  lng: number,
  lat: number,
  scale: number,
  width: number,
  height: number,
  offsetX = 0,
  offsetY = 0,
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
    translateX: offsetX + width / 2 + coords[0] * -1,
    translateY: offsetY + height / 2 + coords[1] * -1,
  }
}

let _projection: GeoProjection
let _lastScale: number = 0
export const transformToCoords = (
  matrix: {
    translateX: number
    translateY: number
    scaleX: number
  },
  width: number,
  height: number,
) => {
  if (_lastScale !== matrix.scaleX) {
    _projection = geoMercator()
      .translate(baseTranslate)
      .scale(baseScale * matrix.scaleX)
    _lastScale = matrix.scaleX
  }

  return _projection.invert!([
    matrix.translateX * -1 + width / 2,
    matrix.translateY * -1 + height / 2,
  ])!
}

const R = 6371 // Earth's radius in kilometers
const toRadians = Math.PI / 180
export function haversineDistance(
  _x1: number,
  _y1: number,
  _x2: number,
  _y2: number,
) {
  const x1 = _x1 * toRadians
  const y1 = _y1 * toRadians
  const x2 = _x2 * toRadians
  const y2 = _y2 * toRadians

  const dx = x2 - x1
  const dy = y2 - y1

  const a =
    Math.sin(dx / 2) * Math.sin(dx / 2) +
    Math.cos(x1) * Math.cos(x2) * Math.sin(dy / 2) * Math.sin(dy / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const getCityConfig = (city: { country: string }) => {
  const continentName = continents[city.country as IContinentKey]
  return (
    countryConfigs[city.country as IConfigKey] ??
    countryConfigs[continentName as IConfigKey] ??
    countryConfigs.default
  )
}

const getZoomDrawDistance = (zoom: number) => {
  if (zoom < 5) return -1
  if (zoom <= 13) return 9
  if (zoom <= 50) return 2
  return 1
}

export const getGroupFromLatLng = (lat: number, lng: number): string => {
  const latGroup = Math.floor(lat / rangeSize)
  const lonGroup = Math.floor(lng / (rangeSize * 2))
  return `${latGroup},${lonGroup}`
}

const getAdjacentGroups = (lat: number, lng: number, n = 1): string[] => {
  const latGroup = Math.floor(lat / rangeSize)
  const lonGroup = Math.floor(lng / (rangeSize * 2))
  const adjacentGroups: string[] = []

  for (let i = -n; i <= n; i++) {
    for (let j = -n; j <= n; j++) {
      adjacentGroups.push(`${latGroup + i},${lonGroup + j}`)
    }
  }

  return adjacentGroups
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
