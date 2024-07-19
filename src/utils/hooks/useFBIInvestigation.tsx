import { useCallback } from 'react'
import { useNodes } from './useNodeState'
import { getNodeSources, getEdgeNodes, getNodeTargets } from '../nodes'
import { sample } from 'lodash'
import { homeId } from '@/constants'

export const useDisconnectNode = () => {
  const { updateNode } = useNodes()
  const onDisconnect = useCallback(
    (nodeId: number) => {
      getNodeSources(nodeId).forEach(({ id }) => {
        if (id !== homeId) updateNode(id, { isOwned: false })
      })
    },
    [updateNode],
  )

  return { onDisconnect }
}

export const useFBIInvestigation = () => {
  const { onDisconnect } = useDisconnectNode()
  // TODO: fbi gets stronger as you progress, meaning deeper investigations
  const onInvestigate = useCallback(
    (depth = sample([1, 2, 2, 2, 3, 3, 4])) => {
      const furthestEdgeNode = sample(getEdgeNodes().slice(0, 6))
      if (furthestEdgeNode) {
        const targets = getNodeTargets(furthestEdgeNode.id)
        const target = targets.find((t) => t.depth === depth)
        if (target) onDisconnect(target.id)
      }
    },
    [onDisconnect],
  )

  return { onInvestigate }
}
