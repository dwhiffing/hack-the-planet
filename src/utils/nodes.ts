import { homeId, NODE_CONFIGS } from '@/constants/index'
import { FullNode } from '@/types'
import { getNodesWithDistance } from '@/utils/geo'
import { store } from '@/utils/valtioState'
import { uniq } from 'lodash'

export const getAllNodes = () => {
  const renderedNodeIds = store.renderedNodeIds
  const nodes = renderedNodeIds.map((id: number) => store.nodes[id])
  return nodes
}

export const updateNode = (nodeId: number, changes: Partial<FullNode>) => {
  if (store.allNodes.length === 0 || typeof nodeId !== 'number') return

  const node = store.nodes[nodeId]
  if (node) {
    store.nodes[nodeId] = { ...node, ...changes }
  } else {
    store.renderedNodeIds = uniq([...store.renderedNodeIds, nodeId])
    const _node = store.allNodes.find((n) => n.id === nodeId) as FullNode
    store.nodes[nodeId] = { ..._node, ...changes }
  }
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
  const home = store.nodes[homeId]
  const _nodes = nodes.filter((n) => !n.sources?.length)
  const nodes2 = getNodesWithDistance(_nodes, home)
  return nodes2.sort((a, b) => b.dist - a.dist).map((n) => n.node) as FullNode[]
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
  const target = store.nodes[node?.target ?? -1]
  return !node?.isOwned && !node?.hackDuration && target && target.isOwned
}

export const getNodeIncome = (nodeId: number) => {
  if (!store.nodes[nodeId]) return 0
  const config = NODE_CONFIGS[store.nodes[nodeId].type]
  // const scaling = store.nodes[nodeId].scaling ?? 1
  return config.baseIncome //* scaling/10
}

export const getNodeHackCost = (nodeId: number) => {
  const configType = store.nodes[nodeId]?.type ?? 'basic'
  const scaling = store.nodes[nodeId]?.scaling ?? 1
  return (
    (configType === 'basic' ? 10 : configType === 'rich' ? 50 : 200) * scaling
  )
}
