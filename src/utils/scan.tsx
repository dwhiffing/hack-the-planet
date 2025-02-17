import { baseScanTime } from '@/constants/index'
import { getUpgradeEffect } from '@/utils/upgrades'
import { getNodesWithDistance, getAdjacentNodes } from '@/utils/geo'
import { store } from '@/utils/valtioState'
import { updateNode } from '@/utils/nodes'

export const getScanRange = (points = store.points, cap = 200, rate = 1) =>
  points <= 0 ? 0 : 10 + Math.min(cap, rate * Math.sqrt(points))

export const onScan = (id: number) => {
  const scanEfficiency = getUpgradeEffect('scan-efficiency')
  const node = store.nodes[id]
  if (!node) return

  const scanRange = getScanRange()
  const maxScanRange =
    scanRange > (node.maxScanRange ?? 0) ? scanRange : (node.maxScanRange ?? 0)
  updateNode(id, { scanDuration: baseScanTime, scanRange, maxScanRange })

  const relevantNodes = getAdjacentNodes(
    node.earthCoords![1],
    node.earthCoords![0],
  )

  const closestNodes = getNodesWithDistance(relevantNodes, node)
    .filter((n) => !store.renderedNodeIds?.includes(n.id) && n.dist < scanRange)
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
