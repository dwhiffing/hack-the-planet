import { Node } from './getNodes'

export function groupCoordinates(nodes: Node[], maxDistance: number) {
  const groups = []

  for (let node of nodes) {
    let added = false

    for (let group of groups) {
      for (let member of group) {
        if (haversineDistance(node, member) <= maxDistance) {
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

const R = 6371 // Earth's radius in kilometers
export function haversineDistance(node1: Node, node2: Node) {
  if (!node1.earthCoords || !node2.earthCoords) return -1
  const x1 = node1.earthCoords[1] * (Math.PI / 180)
  const y1 = node1.earthCoords[0] * (Math.PI / 180)
  const x2 = node2.earthCoords[1] * (Math.PI / 180)
  const y2 = node2.earthCoords[0] * (Math.PI / 180)

  const dx = x2 - x1
  const dy = y2 - y1

  const a =
    Math.sin(dx / 2) * Math.sin(dx / 2) +
    Math.cos(x1) * Math.cos(x2) * Math.sin(dy / 2) * Math.sin(dy / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
