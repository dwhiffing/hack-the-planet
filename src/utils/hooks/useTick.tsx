import { useCallback, useEffect } from 'react'
import { FullNode } from '@/types'
import { baseTickspeed, saveRate } from '@/constants'
import { State, useSWRConfig } from 'swr'
import { useNodes } from './useNodeState'
import { useAutoHack } from './useAutoHack'
import { useHack } from './useHack'
import { useScan } from './useScan'
// import { onAutoSave } from '../localStorage'
import { getUpgradeEffect } from './useUpgrades'

import { useSuspicion } from './useSuspicion'
import { useFBIInvestigation } from './useFBIInvestigation'
import { useMoney } from './useMoney'

export const useTick = () => {
  const { updateNode, getNode, renderedNodeIds } = useNodes()
  const { onScanFinish } = useScan()
  const { onHackFinish } = useHack()
  const { setSuspicion } = useSuspicion()
  const { setMoney, incomePerTick } = useMoney()
  const { onInvestigate } = useFBIInvestigation()
  const { onAutohack } = useAutoHack()
  const { cache } = useSWRConfig()

  const doTick = useCallback(() => {
    let saveCounter = (cache.get('save-counter') ?? saveRate) as number
    saveCounter = Math.max(0, saveCounter - 1)

    // console.time('update nodes')
    renderedNodeIds.forEach((nodeId) => {
      const node = getNode(nodeId)

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

    setMoney(incomePerTick)
    setSuspicion(getUpgradeEffect('suspicion-decay') * 100)

    if (saveCounter === 0) {
      saveCounter = saveRate
      // onAutoSave(cache)
    }
    cache.set('save-counter', saveCounter as State<any, any>)

    const suspicion = cache.get('suspicion')?.data ?? 0
    if (suspicion >= 10000) {
      setSuspicion(-99999)
      onInvestigate()
    }

    onAutohack()
  }, [
    incomePerTick,
    renderedNodeIds,
    getNode,
    setMoney,
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
