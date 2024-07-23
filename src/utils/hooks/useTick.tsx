import { useEffect } from 'react'
import { FullNode } from '@/types'
import { baseTickspeed, saveRate } from '@/constants'
import { onAutohack } from '../autohack'
// import { onAutoSave } from '../localStorage'
import { getUpgradeEffect } from '../upgrades'

import { onInvestigate } from '../investigate'

import { store } from '../valtioState'
import { updateNode } from '../nodes'
import { onScanFinish } from '../scan'
import { onHackFinish } from '../hack'

const doTick = () => {
  let saveCounter = store.saveCounter
  saveCounter = Math.max(0, saveCounter - 1)

  store.incomePerTick = store.renderedNodeIds.reduce((sum, nodeId) => {
    const node = store.nodes[nodeId]
    if (node?.isOwned) {
      const stealAmount = getUpgradeEffect('steal-amount')
      return sum + (node.income ?? 0) * stealAmount
    }
    return sum + 0
  }, 0)

  // console.time('update nodes')
  store.renderedNodeIds.forEach((nodeId) => {
    const node = store.nodes[nodeId]

    if (!node) return
    let update: Partial<FullNode> = {}

    // update scan duration
    const scanDuration = node.scanDuration ?? 0
    if ((scanDuration ?? 0) > 0) {
      update.scanDuration = scanDuration - getUpgradeEffect('scan-speed')
      if (update.scanDuration <= 0) {
        onScanFinish(nodeId)
      }
    }

    const hackDuration = node.hackDuration ?? 0
    // update hack duration
    if ((hackDuration ?? 0) > 0) {
      update.hackDuration = hackDuration - getUpgradeEffect('hack-speed')
    }
    if (
      (typeof update.hackDuration === 'number' && update.hackDuration <= 0) ||
      (typeof node.hackDuration === 'number' && node.hackDuration <= 0)
    ) {
      onHackFinish(nodeId)
    }

    if (Object.keys(update).length > 0) {
      updateNode(nodeId, update)
    }
  })
  // console.timeEnd('update nodes')

  store.money += store.incomePerTick
  store.suspicion += getUpgradeEffect('suspicion-decay') * 100

  if (saveCounter === 0) {
    saveCounter = saveRate
    // onAutoSave(cache)
  }
  store.saveCounter = saveCounter

  const suspicion = store.suspicion
  if (suspicion >= 10000) {
    store.suspicion = 0
    onInvestigate()
  }

  onAutohack()
}

export const useTick = () => {
  useEffect(() => {
    const intervalId = setInterval(doTick, baseTickspeed)
    return () => clearInterval(intervalId)
  }, [])
}
