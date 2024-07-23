import { Node } from '@/types'
import { transformToCoords } from './geo'
import { TransformMatrix } from '@vx/zoom/lib/types'
import { store } from './valtioState'

export interface Group {
  key: string
  nodes: Node[]
}

export const rangeSize = 1.5
export const getAllNodeGroups = () => {
  const groupedNodes = store.groupedNodes

  return Object.keys(groupedNodes)
}

export const getZoomLevel = (transform: TransformMatrix) => {
  const zoom = transform.scaleX
  if (zoom < 5) return 3
  if (zoom <= 13) return 2
  if (zoom <= 50) return 1
  return 0
}
const getZoomDrawDistance = (zoom: number) => {
  if (zoom < 5) return -1
  if (zoom <= 13) return 9
  if (zoom <= 50) return 2
  return 1
}

export const getVisibleGroups = (
  transformMatrix: TransformMatrix,
  width: number,
  height: number,
) => {
  const coords = transformToCoords(transformMatrix, width, height)
  const zoomLevel = getZoomDrawDistance(transformMatrix.scaleX)
  if (zoomLevel === -1) return getAllNodeGroups().join(':')
  const groups = getAdjacentGroups(coords[1], coords[0], zoomLevel)

  return groups.join(':')
}

export const getGroupFromLatLng = (lat: number, lng: number): string => {
  const latGroup = Math.floor(lat / rangeSize)
  const lonGroup = Math.floor(lng / (rangeSize * 2))
  return `${latGroup},${lonGroup}`
}

export const groupNodes = (nodes: Node[]): Record<string, Group> => {
  const groups: Record<string, Group> = {}

  nodes.forEach((node) => {
    const key = getGroupFromLatLng(node.earthCoords![1], node.earthCoords![0])

    if (!groups[key]) {
      groups[key] = { key, nodes: [] }
    }
    groups[key].nodes.push(node)
  })

  return groups
}
export const getAdjacentGroups = (
  lat: number,
  lng: number,
  n = 1,
): string[] => {
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

export const getRelevantNodes = (lat: number, lng: number) => {
  const groupedNodes = store.groupedNodes

  const adjacentGroups = getAdjacentGroups(lat, lng)
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
