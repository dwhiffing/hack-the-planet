import { useCallback, useEffect } from 'react'
import { FullNode } from '@/types'
import { baseTickspeed, incomeRate, NODE_CONFIGS } from '@/constants'
import { State, useSWRConfig } from 'swr'
import { useNodes } from './useNodeState'
import { useAutoHack } from './useAutoHack'
import { useHack } from './useHack'
import { useScan } from './useScan'
import { onAutoSave } from '../localStorage'
import { getScanSpeed, getSuspicionDecay, getTransferRate } from './useUpgrades'
import { getHackSpeed } from './useUpgrades'
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

  const transferRate = getTransferRate()
  const doTick = useCallback(() => {
    let incomeCounter = (cache.get('income-counter') ?? incomeRate) as number
    incomeCounter = Math.max(0, incomeCounter - 1)

    renderedNodeIds.forEach((nodeId) => {
      const node = getNode(nodeId)
      const target = getNode(node?.target ?? -1)

      if (!node) return

      // send outgoing money on each node to target node
      if (target && node.outgoingMoney) {
        const money = (target.money ?? 0) + node.outgoingMoney
        updateNode(node.target!, { money })
      }

      // send new money to outgoing money for target
      let update: Partial<FullNode> = {}
      if (target && node.isOwned) {
        let outgoingMoney = transferRate
        let currentMoney = node?.money ?? 0
        if (currentMoney < outgoingMoney) {
          outgoingMoney = currentMoney
        }
        currentMoney -= outgoingMoney
        update.money = currentMoney
        update.outgoingMoney = outgoingMoney
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
        update.scanDuration = scanDuration - getScanSpeed()
        if (update.scanDuration <= 0) {
          onScanFinish(nodeId)
        }
      }

      const hackDuration = node.hackDuration ?? 0
      // update hack duration
      if ((hackDuration ?? 0) > 0) {
        update.hackDuration = hackDuration - getHackSpeed()
        if (update.hackDuration <= 0) {
          onHackFinish(nodeId)
        }
      }

      updateNode(nodeId, update)
    })

    setSuspicion(getSuspicionDecay())

    if (incomeCounter === 0) {
      incomeCounter = incomeRate
    }
    cache.set('income-counter', incomeCounter as State<any, any>)

    const suspicion = cache.get('suspicion')?.data ?? 0
    if (suspicion >= 10000) {
      setSuspicion(-99999)
      onInvestigate()
    }

    onAutohack()
    onAutoSave(cache)
  }, [
    renderedNodeIds,
    getNode,
    cache,
    onHackFinish,
    onAutohack,
    onScanFinish,
    updateNode,
    transferRate,
    setSuspicion,
    onInvestigate,
  ])

  useEffect(() => {
    const intervalId = setInterval(doTick, baseTickspeed)
    return () => clearInterval(intervalId)
  }, [doTick])
}
