import { useCallback, useEffect } from 'react'
import { FullNode } from '@/types'
import { baseTickspeed, incomeRate, NODE_CONFIGS } from '@/constants'
import { State, useSWRConfig } from 'swr'
import { useNodes } from './useNodeState'
import { useAutoHack } from './useAutoHack'
import { useHack } from './useHack'
import { useScan } from './useScan'
import { onAutoSave } from '../localStorage'
import { getUpgradeEffect } from './useUpgrades'

import { useSuspicion } from './useSuspicion'
import { useFBIInvestigation } from './useFBIInvestigation'
import { randomInRange } from '../random'

export const useTick = () => {
  const { updateNode, getNode, renderedNodeIds } = useNodes()
  const { onScanFinish } = useScan()
  const { onHackFinish } = useHack()
  const { setSuspicion } = useSuspicion()
  const { onInvestigate } = useFBIInvestigation()
  const { onAutohack } = useAutoHack()
  const { cache } = useSWRConfig()

  const doTick = useCallback(() => {
    let incomeCounter = (cache.get('income-counter') ?? incomeRate) as number
    incomeCounter = Math.max(0, incomeCounter - 1)

    // console.time('update nodes')
    renderedNodeIds.forEach((nodeId) => {
      const node = getNode(nodeId)
      const target = getNode(node?.target ?? -1)

      if (!node) return
      let update: Partial<FullNode> = {}

      // send outgoing money on each node to target node
      let transferRate = getUpgradeEffect('steal-amount')
      const outgoing = node.outgoingMoney ?? 0
      if (target && outgoing >= 0) {
        let incomingMoney = transferRate
        if (outgoing < incomingMoney) {
          incomingMoney = outgoing
        }

        const money = (target.money ?? 0) + incomingMoney
        update.outgoingMoney = Math.max(0, outgoing - incomingMoney)
        updateNode(node.target!, { money })
      }

      // send new money to outgoing money for target
      let currentMoney = node?.money ?? 0
      let autoStealAmount = getUpgradeEffect('auto-steal-amount')
      if (target && node.isOwned && currentMoney > 0 && autoStealAmount > 0) {
        let outgoing = update.outgoingMoney ?? node.outgoingMoney ?? 0
        if (currentMoney < autoStealAmount) {
          autoStealAmount = currentMoney
        }
        currentMoney -= autoStealAmount
        update.money = currentMoney
        update.outgoingMoney = outgoing + autoStealAmount
      }

      // track income
      if (incomeCounter === 0) {
        const config = NODE_CONFIGS[node.type!]
        const income = randomInRange(config.incomeMin, config.incomeMax)
        update.money = (node.money ?? 0) + income
      }

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
        if (update.hackDuration <= 0) {
          onHackFinish(nodeId)
        }
      }

      if (Object.keys(update).length > 0) {
        updateNode(nodeId, update)
      }
    })
    // console.timeEnd('update nodes')

    setSuspicion(getUpgradeEffect('suspicion-decay') * 100)

    if (incomeCounter === 0) {
      incomeCounter = incomeRate
      onAutoSave(cache)
    }
    cache.set('income-counter', incomeCounter as State<any, any>)

    const suspicion = cache.get('suspicion')?.data ?? 0
    if (suspicion >= 10000) {
      setSuspicion(-99999)
      onInvestigate()
    }

    onAutohack()
  }, [
    renderedNodeIds,
    getNode,
    cache,
    onHackFinish,
    onAutohack,
    onScanFinish,
    updateNode,
    setSuspicion,
    onInvestigate,
  ])

  useEffect(() => {
    const intervalId = setInterval(doTick, baseTickspeed)
    return () => clearInterval(intervalId)
  }, [doTick])
}
