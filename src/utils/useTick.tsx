import { useEffect } from 'react'
import { FullNode } from '@/types'
import { homeId, saveRate } from '@/constants/index'
import { onAutohack } from '@/utils/autohack'
import { getUpgradeEffect } from '@/utils/upgrades'
import { serializeSave, store } from '@/utils/valtioState'
import { getNodeHackCost, getNodeIncome, updateNode } from '@/utils/nodes'
import { onHackFinish } from '@/utils/hack'
import { clamp } from 'lodash'

const doTick = () => {
  let saveCounter = store.saveCounter
  saveCounter = Math.max(0, saveCounter - 1)

  let currentPoints = clamp(
    store.points + getUpgradeEffect('point-rate'),
    0,
    getUpgradeEffect('max-points'),
  )

  let totalMaintenance = 0
  let nodeIncome = 0
  let nodeIdsToUpdate: number[] = []
  let nodeIdsStolenFrom: number[] = []

  // console.time('update nodes')
  store.renderedNodeIds.forEach((nodeId) => {
    const node = store.nodes[nodeId]
    if (!node) return
    if (node.hackDuration || node.stealDuration) nodeIdsToUpdate.push(nodeId)
    if (nodeId === homeId) return

    const maintenance = getNodeHackCost(nodeId) / 10
    if (node.isOwned || node.hackDuration) {
      totalMaintenance += maintenance
    }

    if (node.isOwned && currentPoints >= totalMaintenance) {
      nodeIdsStolenFrom.push(nodeId)
      nodeIncome += getNodeIncome(nodeId) * getUpgradeEffect('steal-amount')
    }
  })

  const combined = [...nodeIdsToUpdate, ...nodeIdsStolenFrom]
  combined.forEach((nodeId) => {
    const node = store.nodes[nodeId]

    if (!node) return
    let update: Partial<FullNode> = {}

    const hackDuration = node.hackDuration ?? 0
    if (hackDuration > 0) {
      update.hackDuration = hackDuration - 1
    }
    if (typeof update.hackDuration === 'number' && update.hackDuration <= 0) {
      onHackFinish(nodeId)
    }

    const isStolenFrom = nodeIdsStolenFrom.includes(nodeId)
    if (isStolenFrom && node.stealDuration !== 1) {
      update.stealDuration = 1
    }
    if (!isStolenFrom && node.stealDuration !== 0) {
      update.stealDuration = 0
    }

    if (Object.keys(update).length > 0) {
      updateNode(nodeId, update)
    }
  })
  // console.timeEnd('update nodes')

  store.points = clamp(
    currentPoints - totalMaintenance,
    0,
    getUpgradeEffect('max-points'),
  )
  store.pointsPerTick = getUpgradeEffect('point-rate') - totalMaintenance
  store.moneyPerTick = nodeIncome
  store.money += store.moneyPerTick

  if (saveCounter === 0 && !store.hasResetSave) {
    saveCounter = saveRate
    localStorage.setItem('hack-the-planet', serializeSave(store))
  }
  store.saveCounter = saveCounter

  onAutohack()
}

export const useTick = (tickspeed: number) => {
  useEffect(() => {
    const intervalId = setInterval(doTick, tickspeed)
    return () => clearInterval(intervalId)
  }, [tickspeed])
}
