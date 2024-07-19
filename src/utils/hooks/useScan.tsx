import { baseScanTime, NODE_CONFIGS } from '@/constants'
import { useCallback } from 'react'
import { haversineDistance as getDist } from '../geo'
import { useNodes } from './useNodeState'
import { getDiscoveryRange, getScanEfficiency } from './useUpgrades'
import { random, randomInRange } from '../random'

export const useScan = () => {
  const { nodes, updateNode, renderedNodeIds } = useNodes()

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
        // TODO: more consistent way to determine node type
        const isBank = random() < 0.1
        const type = isBank ? 'bank' : 'basic'
        const config = NODE_CONFIGS[type]
        const startingMoney = randomInRange(
          config.startingMoneyMin,
          config.startingMoneyMax,
        )

        updateNode(node.id, {
          isScanned: true,
          type,
          target: id,
          money: startingMoney,
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
