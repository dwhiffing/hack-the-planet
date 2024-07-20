import { Node } from '@/types'

export interface Group {
  key: string
  nodes: Node[]
}

export const rangeSize = 5
export const groupNodes = (nodes: Node[]): Record<string, Group> => {
  const groups: Record<string, Group> = {}

  nodes.forEach((node) => {
    const latGroup = Math.floor(node.earthCoords![1] / rangeSize)
    const lonGroup = Math.floor(node.earthCoords![0] / rangeSize)
    const key = `${latGroup},${lonGroup}`

    if (!groups[key]) {
      groups[key] = { key, nodes: [] }
    }
    groups[key].nodes.push(node)
  })

  return groups
}
export const getAdjacentGroups = (
  latGroup: number,
  lonGroup: number,
): string[] => {
  const adjacentGroups: string[] = []

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      adjacentGroups.push(`${latGroup + i},${lonGroup + j}`)
    }
  }

  return adjacentGroups
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
