import { homeId } from '@/constants'
import { cache } from '@/pages'
import { FullNode } from '@/types'
import { haversineDistance } from './geo'

export const getAllNodes = () => {
  const renderedNodeIds = cache.get('rendered-node-ids').data
  const nodes = renderedNodeIds.map(
    (id: number) => cache.get(`node-${id}`).data,
  ) as FullNode[]
  return nodes
}

export const getNodeSources = (
  nodeId: number,
  depth = 0,
  nodes = getAllNodes(),
) => {
  let allNodeIds: { id: number; depth: number }[] = [{ id: nodeId, depth }]
  const nodeSources = nodes.filter((n) => n.target === nodeId)
  if (nodeSources.length > 0) {
    allNodeIds = [
      ...allNodeIds,
      ...nodeSources.flatMap((node) => [
        { id: node.id, depth: depth + 1 },
        ...getNodeSources(node.id, depth + 1, nodes),
      ]),
    ]
  }
  return allNodeIds
}

export const getNodeTargets = (
  nodeId: number,
  depth = 0,
  nodes = getAllNodes(),
) => {
  let allNodeIds: { id: number; depth: number }[] = []
  const node = nodes.find((n) => n.id === nodeId)!
  const nodeTargets = nodes.filter((n) => n.id === node.target)
  if (nodeTargets.length > 0) {
    allNodeIds = [
      ...nodeTargets.flatMap((node) => [
        { id: node.id, depth: depth + 1 },
        ...getNodeTargets(node.id, depth + 1, nodes),
      ]),
    ]
  }
  return allNodeIds
}

export const getEdgeNodes = (
  nodes = getAllNodes().filter((n) => n.isOwned),
) => {
  const home = nodes.find((n) => n.id === homeId)!
  return nodes
    .filter((n) => !nodes.some((_n) => _n.target === n.id))
    .sort((a, b) => haversineDistance(b, home) - haversineDistance(a, home))
}

export const getIsNodeHackable = (nodeId: number) => {
  const nodes = getAllNodes()
  const n = nodes.find((n) => n.id === nodeId)!
  const target = nodes.find((_n) => _n?.id === n.target)
  return !n?.isOwned && !n?.hackDuration && target && target.isOwned
}

// TODO: make dynamic
export const getNodeSuspicion = (nodeId: number) => {
  return 100
}
