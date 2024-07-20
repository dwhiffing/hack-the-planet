import { baseScanTime, NODE_CONFIGS } from '@/constants'
import { useCallback } from 'react'
import { useNodes } from './useNodeState'
import { getDiscoveryRange, getScanEfficiency } from './useUpgrades'
import { random, randomInRange } from '../random'
import { getNode } from '../nodes'
import {
  getAdjacentGroups,
  getNodesWithDistance,
  rangeSize,
} from '../getNodesWithDistance'
import { Node } from '@/types'

export const useScan = () => {
  const { groupedNodes, updateNode, renderedNodeIds } = useNodes()

  const scanDuration = baseScanTime
  const onScanStart = useCallback(
    (id: number) => {
      updateNode(id, { scanDuration })
    },
    [scanDuration, updateNode],
  )

  const discoveryRange = getDiscoveryRange()
  const scanEfficiency = getScanEfficiency()
  const onScanFinish = useCallback(
    (id: number) => {
      const node = getNode(id)
      if (!node) return

      const latGroup = Math.floor(node.earthCoords![1] / rangeSize)
      const lonGroup = Math.floor(node.earthCoords![0] / rangeSize)
      const adjacentGroups = getAdjacentGroups(latGroup, lonGroup)
      const relevantNodes: Node[] = []
      adjacentGroups.forEach((groupKey) => {
        if (groupedNodes[groupKey]) {
          relevantNodes.push(...(groupedNodes[groupKey].nodes ?? []))
        }
      })

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
    [renderedNodeIds, groupedNodes, updateNode, scanEfficiency, discoveryRange],
  )

  return {
    onScanStart,
    onScanFinish,
  }
}
