import { scanTime, discoveryRange, initialMoney } from '@/constants'
import { useCallback } from 'react'
import { haversineDistance as getDist } from '../geo'
import { useNodes } from './useNodeState'

export const useScan = () => {
  const { nodes, updateNode, renderedNodeIds } = useNodes()

  const onScanStart = useCallback(
    (id: number) => {
      updateNode(id, { scanDuration: scanTime })
    },
    [updateNode],
  )

  const onScanFinish = useCallback(
    (id: number) => {
      const node = nodes.find((n) => n.id === id)
      if (node) {
        console.log(node)
        const closestNode = nodes
          .filter(
            (n) =>
              !renderedNodeIds.includes(n.id) &&
              getDist(node, n) < discoveryRange,
          )
          .map((n) => ({ id: n.id, dist: getDist(node, n) }))
          .sort((a, b) => a.dist - b.dist)
          .at(0)

        if (closestNode) {
          updateNode(closestNode.id, {
            isScanned: true,
            target: id,
            money: initialMoney,
          })
        }
      }
    },
    [nodes, renderedNodeIds, updateNode],
  )

  return {
    onScanStart,
    onScanFinish,
  }
}
