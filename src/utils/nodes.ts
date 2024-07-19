import { homeId, NODE_CONFIGS } from '@/constants'
import { cache } from '@/pages'
import { FullNode } from '@/types'
import { haversineDistance } from './geo'
import { randomInRange } from './random'

export const getNode = (nodeId: number) => {
  const node = cache.get(`node-${nodeId}`)?.data as FullNode
  return node
}

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
  const home = getNode(homeId)
  return nodes
    .filter((n) => !n.sources?.length)
    .sort((a, b) => haversineDistance(b, home) - haversineDistance(a, home))
}

export const getIsNodeHackable = (
  nodeId: number | FullNode,
  nodes = getAllNodes(),
) => {
  let node: FullNode
  if (typeof nodeId === 'number') {
    node = nodes.find((n) => n.id === nodeId)!
  } else {
    node = nodeId
  }
  const target = getNode(node?.target ?? -1)
  return !node?.isOwned && !node?.hackDuration && target && target.isOwned
}

export const getNodeSuspicion = (nodeId: number) => {
  const node = cache.get(`node-${nodeId}`).data as FullNode
  const config = NODE_CONFIGS[node.type!]
  const suspicion = randomInRange(config.suspicionMin, config.suspicionMax)
  return suspicion
}
