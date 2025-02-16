import { useEffect } from 'react'
import { FullNode } from '@/types'
import { baseTickspeed, saveRate } from '@/constants/index'
import { onAutohack } from '@/utils/autohack'
import { getUpgradeEffect } from '@/utils/upgrades'
import { onInvestigate } from '@/utils/investigate'
import { serializeSave, store } from '@/utils/valtioState'
import { getNodeIncome, updateNode } from '@/utils/nodes'
import { onScanFinish } from '@/utils/scan'
import { onHackFinish } from '@/utils/hack'
import { clamp } from 'lodash'

const doTick = () => {
  let saveCounter = store.saveCounter
  saveCounter = Math.max(0, saveCounter - 1)

  store.pointsPerTick = store.renderedNodeIds.reduce((sum, nodeId) => {
    if (store.nodes[nodeId]?.isOwned) {
      return sum + getUpgradeEffect('point-amount')
    }
    return sum + 0
  }, 0)

  store.moneyPerTick = store.renderedNodeIds.reduce((sum, nodeId) => {
    if (store.nodes[nodeId]?.isOwned) {
      return sum + getNodeIncome(nodeId) * getUpgradeEffect('steal-amount')
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
      update.scanDuration = scanDuration - 1
      if (update.scanDuration <= 0) {
        onScanFinish(nodeId)
      }
    }

    const hackDuration = node.hackDuration ?? 0
    // update hack duration
    if ((hackDuration ?? 0) > 0) {
      update.hackDuration = hackDuration - 1
    }
    if (typeof update.hackDuration === 'number' && update.hackDuration <= 0) {
      onHackFinish(nodeId)
    }

    if (Object.keys(update).length > 0) {
      updateNode(nodeId, update)
    }
  })
  // console.timeEnd('update nodes')

  store.points += store.pointsPerTick
  store.points = clamp(store.points, 0, getUpgradeEffect('max-points'))

  store.money += store.moneyPerTick
  store.suspicion += getUpgradeEffect('suspicion-decay') * 100

  if (saveCounter === 0 && !store.hasResetSave) {
    saveCounter = saveRate
    localStorage.setItem('hack-the-planet', serializeSave(store))
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
