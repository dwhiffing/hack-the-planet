import { baseScanTime, NODE_CONFIGS } from '@/constants'
import { getUpgradeEffect } from './upgrades'
import { randomInRange } from './random'
import { getNodesWithDistance, getRelevantNodes } from './getNodesWithDistance'
import { store } from './valtioState'
import { updateNode } from './nodes'

export const onScanStart = (id: number) => {
  updateNode(id, { scanDuration: baseScanTime })
}

export const onScanFinish = (id: number) => {
  const discoveryRange = getUpgradeEffect('scan-range')
  const scanEfficiency = getUpgradeEffect('scan-efficiency')
  const node = store.nodes[id]
  if (!node) return

  const relevantNodes = getRelevantNodes(
    node.earthCoords![1],
    node.earthCoords![0],
  )

  const closestNodes = getNodesWithDistance(relevantNodes, node)
    .filter(
      (n) => !store.renderedNodeIds?.includes(n.id) && n.dist < discoveryRange,
    )
    .sort((a, b) => a.dist - b.dist)
    .slice(0, scanEfficiency)

  closestNodes.forEach((node) => {
    const config = NODE_CONFIGS[node.node.type]
    const income = randomInRange(config.incomeMin, config.incomeMax)

    updateNode(id, {
      sources: [...(store.nodes[id]?.sources ?? []), node.id],
    })

    updateNode(node.id, {
      isScanned: true,
      target: id,
      income,
    })
  })
}
