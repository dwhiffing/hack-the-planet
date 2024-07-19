import { useCallback, useEffect } from 'react'
import { FullNode } from '@/types'
import { baseTickspeed } from '@/constants'
import { useSWRConfig } from 'swr'
import { useNodes } from './useNodeState'
import { useAutoHack } from './useAutoHack'
import { useHack } from './useHack'
import { useScan } from './useScan'
import { onAutoSave } from '../localStorage'

export const useTick = () => {
  const { updateNode, getNode, renderedNodeIds } = useNodes()
  const { onScanFinish } = useScan()
  const { onHackFinish } = useHack()
  const { onAutohack } = useAutoHack()
  const { cache } = useSWRConfig()

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
        // TODO: way to upgrade outgoing money
        let outgoingMoney = 1
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
  ])

  useEffect(() => {
    const intervalId = setInterval(doTick, baseTickspeed)
    return () => clearInterval(intervalId)
  }, [doTick])
}
