import {
  getNodeSources,
  getEdgeNodes,
  getNodeTargets,
  updateNode,
} from './nodes'
import { sample } from 'lodash'
import { homeId } from '@/constants'

export const onDisconnect = (nodeId: number) => {
  getNodeSources(nodeId).forEach(({ id }) => {
    if (id !== homeId) updateNode(id, { isOwned: false })
  })
}

export const onInvestigate = (depth = sample([1, 1, 1, 1, 1, 2, 2, 2, 3])) => {
  const furthestEdgeNode = sample(getEdgeNodes().slice(0, 6))
  if (furthestEdgeNode) {
    const targets = getNodeTargets(furthestEdgeNode.id)
    const target = targets.find((t) => t.depth === depth)
    if (target) onDisconnect(target.id)
  }
}
