import { baseScanTime, NODE_CONFIGS } from '@/constants'
import { useCallback } from 'react'
import { useNodes } from './useNodeState'
import { getUpgradeEffect } from './useUpgrades'
import { randomInRange } from '../random'
import { getNode } from '../nodes'
import { getNodesWithDistance, getRelevantNodes } from '../getNodesWithDistance'

export const useScan = () => {
  const { updateNode, renderedNodeIds } = useNodes()

  const scanDuration = baseScanTime
  const onScanStart = useCallback(
    (id: number) => {
      updateNode(id, { scanDuration })
    },
    [scanDuration, updateNode],
  )

  const discoveryRange = getUpgradeEffect('scan-range')
  const scanEfficiency = getUpgradeEffect('scan-efficiency')
  const onScanFinish = useCallback(
    (id: number) => {
      const node = getNode(id)
      if (!node) return

      const relevantNodes = getRelevantNodes(
        node.earthCoords![1],
        node.earthCoords![0],
      )

      const closestNodes = getNodesWithDistance(relevantNodes, node)
        .filter(
          (n) => !renderedNodeIds?.includes(n.id) && n.dist < discoveryRange,
        )
        .sort((a, b) => a.dist - b.dist)
        .slice(0, scanEfficiency)

      closestNodes.forEach((node) => {
        const config = NODE_CONFIGS[node.node.type]
        const startingMoney = randomInRange(
          config.startingMoneyMin,
          config.startingMoneyMax,
        )

        updateNode(id, {
          sources: [...(getNode(id)?.sources ?? []), node.id],
        })

        updateNode(node.id, {
          isScanned: true,
          target: id,
          money: startingMoney,
        })
      })
    },
    [renderedNodeIds, updateNode, scanEfficiency, discoveryRange],
  )

  return {
    onScanStart,
    onScanFinish,
  }
}
