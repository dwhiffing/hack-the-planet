import { useEffect } from 'react'
import { FullNode } from '@/types'
import { baseTickspeed, homeId, saveRate } from '@/constants/index'
import { onAutohack } from '@/utils/autohack'
import { getUpgradeEffect } from '@/utils/upgrades'
import { serializeSave, store } from '@/utils/valtioState'
import { getNodeHackCost, getNodeIncome, updateNode } from '@/utils/nodes'
import { onHackFinish } from '@/utils/hack'
import { clamp } from 'lodash'

const doTick = () => {
  let saveCounter = store.saveCounter
  saveCounter = Math.max(0, saveCounter - 1)

  let currentPoints = store.points
  store.pointsPerTick = getUpgradeEffect('point-rate')
  currentPoints += store.pointsPerTick
  currentPoints = clamp(currentPoints, 0, getUpgradeEffect('max-points'))

  let moneyPerTick = 0
  let nodeIdsStolenFrom: number[] = []

  // console.time('update nodes')
  store.renderedNodeIds.forEach((nodeId) => {
    const node = store.nodes[nodeId]

    if (!node) return
    let update: Partial<FullNode> = {}

    if (node.isOwned && nodeId !== homeId) {
      const stealCost = getNodeHackCost(nodeId) / 10
      if (currentPoints >= stealCost) {
        nodeIdsStolenFrom.push(nodeId)
        moneyPerTick += getNodeIncome(nodeId) * getUpgradeEffect('steal-amount')
        currentPoints -= stealCost
      }
    }

    // update scan duration
    const scanDuration = node.scanDuration ?? 0
    if ((scanDuration ?? 0) > 0) {
      update.scanDuration = scanDuration - 1
      if (update.scanDuration <= 0) {
        update.scanDuration = 0
      }
    }

    if (node.stealDuration === 0 && nodeIdsStolenFrom.includes(nodeId)) {
      update.stealDuration = 1
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

  store.points = currentPoints
  store.moneyPerTick = moneyPerTick
  store.money += store.moneyPerTick

  if (saveCounter === 0 && !store.hasResetSave) {
    saveCounter = saveRate
    localStorage.setItem('hack-the-planet', serializeSave(store))
  }
  store.saveCounter = saveCounter

  onAutohack()
}

export const useTick = () => {
  useEffect(() => {
    const intervalId = setInterval(doTick, baseTickspeed)
    return () => clearInterval(intervalId)
  }, [])
}
