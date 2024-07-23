import { sample } from 'lodash'
import { getUpgradeEffect } from './upgrades'
import { getEdgeNodes, getIsNodeHackable } from './nodes'
import { store } from './valtioState'
import { onScanStart } from './scan'
import { onHackStart } from './hack'

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
    onScanStart(nodeToScan.id)
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
