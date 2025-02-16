import { sample } from 'lodash'
import { getUpgradeEffect } from '@/utils/upgrades'
import { getEdgeNodes, getIsNodeHackable } from '@/utils/nodes'
import { store } from '@/utils/valtioState'
import { onScan } from '@/utils/scan'
import { onHackStart } from '@/utils/hack'

export const onAutohack = () => {
  const isUnlocked = store.upgrades.autoscan.level !== 0
  if (!isUnlocked) return

  const maxTime = getUpgradeEffect('autoscan')
  const time = store.autoHackTime
  store.autoHackTime = time - 1

  if (time > 0) return
  store.autoHackTime = maxTime

  const nodes = store.renderedNodeIds.map((n) => store.nodes[n])
  const edgeNodes = getEdgeNodes(nodes)
  const possibleScanNodes = edgeNodes.filter(
    (n) => n?.isOwned && (n.scanDuration ?? 0) <= 0,
  )

  const nodeToScan = sample(possibleScanNodes)
  if (nodeToScan) {
    onScan(nodeToScan.id)
  }
  const possibleHackNodes = nodes.filter((n) => getIsNodeHackable(n, nodes))
  const nodeToHack = sample(possibleHackNodes)
  if (nodeToHack) {
    const siblingNodes = nodes
      .filter((n) => n.target === nodeToHack.target)
      .slice(0, getUpgradeEffect('hack-efficiency'))
    siblingNodes.forEach((node) => {
      onHackStart(node.id)
    })
  }
}
