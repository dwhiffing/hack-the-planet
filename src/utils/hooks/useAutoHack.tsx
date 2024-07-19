import { sample } from 'lodash'
import { useCallback } from 'react'
import { useHack } from './useHack'
import { useNodes } from './useNodeState'
import { useScan } from './useScan'
import { getAutoHackTime, useUpgrades } from './useUpgrades'
import { cache } from '@/pages'

export const useAutoHack = () => {
  const { getNode, renderedNodeIds } = useNodes()
  const { onScanStart } = useScan()
  const { onHackStart } = useHack()
  const { upgradeStates } = useUpgrades()

  const onAutohack = useCallback(() => {
    if (!upgradeStates || upgradeStates.autohack.level === 0) return

    const maxTime = getAutoHackTime()
    const time = cache.get('auto-hack-time') ?? maxTime
    cache.set('auto-hack-time', time - 1)

    if (time) return
    cache.set('auto-hack-time', maxTime)

    const nodes = renderedNodeIds.map(getNode)
    const possibleScanNodes = nodes.filter((n) => n?.isOwned && !n.scanDuration)
    const possibleHackNodes = nodes.filter(
      (n) => !n?.isOwned && !n?.hackDuration,
    )
    const nodeToScan = sample(possibleScanNodes)
    const nodeToHack = sample(possibleHackNodes)
    if (nodeToHack) {
      onHackStart(nodeToHack.id)
    } else if (nodeToScan) {
      onScanStart(nodeToScan.id)
    }
  }, [getNode, onHackStart, onScanStart, renderedNodeIds, upgradeStates])

  return {
    onAutohack,
  }
}
