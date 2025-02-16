import { baseScanTime } from '@/constants/index'
import { getUpgradeEffect } from '@/utils/upgrades'
import { getNodesWithDistance, getAdjacentNodes } from '@/utils/geo'
import { store } from '@/utils/valtioState'
import { updateNode } from '@/utils/nodes'

export const onScanStart = (id: number) => {
  updateNode(id, {
    scanDuration: baseScanTime,
    scanRange: 10 + store.points / 10,
  })
  const scanEfficiency = getUpgradeEffect('scan-efficiency')
  const node = store.nodes[id]
  if (!node) return

  const discoveryRange = node.scanRange ?? 0
  const relevantNodes = getAdjacentNodes(
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
    updateNode(id, {
      sources: [...(store.nodes[id]?.sources ?? []), node.id],
    })

    updateNode(node.id, { target: id })
  })
  const cost = closestNodes.length === 0 ? store.points / 2 : store.points
  store.points -= cost
}

export const onScanFinish = (id: number) => {}
