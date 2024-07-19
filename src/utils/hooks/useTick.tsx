import { useCallback, useEffect } from 'react'
import { FullNode } from '@/types'
import { baseTickspeed } from '@/constants'
import { useSWRConfig } from 'swr'
import { useNodes } from './useNodeState'
import { useAutoHack } from './useAutoHack'
import { useHack } from './useHack'
import { useScan } from './useScan'
import { onAutoSave } from '../localStorage'
import { getSuspicionDecay, getTransferRate } from './useUpgrades'
import { useSuspicion } from './useSuspicion'
import { useFBIInvestigation } from './useFBIInvestigation'

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

      // update scan duration
      if (node.scanDuration) {
        update.scanDuration = node.scanDuration - 1
        if (update.scanDuration === 0) {
          onScanFinish(nodeId)
        }
      }

      // update hack duration
      if (node.hackDuration) {
        update.hackDuration = node.hackDuration - 1
        if (update.hackDuration === 0) {
          onHackFinish(nodeId)
        }
      }

      updateNode(nodeId, update)
    })

    setSuspicion(getSuspicionDecay())

    const suspicion = cache.get('suspicion')?.data ?? 0
    if (suspicion >= 10000) {
      console.log('triggered')
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
