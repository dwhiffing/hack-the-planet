import { scanTime, initialMoney } from '@/constants'
import { useCallback } from 'react'
import { haversineDistance as getDist } from '../geo'
import { useNodes } from './useNodeState'
import { useStats } from './useUpgrades'

export const useScan = () => {
  const { nodes, updateNode, renderedNodeIds } = useNodes()
  const { getDiscoveryRange, getScanEfficiency } = useStats()

  const onScanStart = useCallback(
    (id: number) => {
      updateNode(id, { scanDuration: scanTime })
    },
    [updateNode],
  )

  const discoveryRange = getDiscoveryRange()
  const scanEfficiency = getScanEfficiency()
  const onScanFinish = useCallback(
    (id: number) => {
      const node = nodes.find((n) => n.id === id)
      if (!node) return
      const closestNodes = nodes
        .filter(
          (n) =>
            !renderedNodeIds.includes(n.id) &&
            getDist(node, n) < discoveryRange,
        )
        .map((n) => ({ id: n.id, dist: getDist(node, n) }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, scanEfficiency)

      closestNodes.forEach((node) => {
        updateNode(node.id, {
          isScanned: true,
          target: id,
          money: initialMoney,
        })
      })
    },
    [nodes, renderedNodeIds, updateNode, scanEfficiency, discoveryRange],
  )

  return {
    onScanStart,
    onScanFinish,
  }
}
