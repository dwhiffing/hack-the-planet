import { sample } from 'lodash'
import { useCallback, useMemo } from 'react'
import { useHack } from './useHack'
import { useNodes } from './useNodeState'
import { useScan } from './useScan'
import { getAutoHackTime, useUpgrades } from './useUpgrades'
import { cache } from '@/pages'
import { getIsNodeHackable } from '../nodes'
import useSWRImmutable from 'swr/immutable'

export const useAutoHack = () => {
  const { getNode, renderedNodeIds } = useNodes()
  const { onScanStart } = useScan()
  const { onHackStart } = useHack()
  const { upgradeStates } = useUpgrades()
  const { data: enabled, mutate: _setEnabled } = useSWRImmutable<boolean>(
    `auto-hack-enabled`,
    () => true,
  )

  const setEnabled = useCallback(
    (value: boolean) => {
      _setEnabled(value, { revalidate: false })
    },
    [_setEnabled],
  )

  const isUnlocked = useMemo(
    () => upgradeStates?.autohack.level !== 0,
    [upgradeStates],
  )

  const onAutohack = useCallback(() => {
    if (!isUnlocked || !enabled) return

    const maxTime = getAutoHackTime()
    const time = cache.get('auto-hack-time') ?? maxTime
    cache.set('auto-hack-time', time - 1)

    if (time) return
    cache.set('auto-hack-time', maxTime)

    const nodes = renderedNodeIds.map((n) => getNode(n)!)
    const possibleScanNodes = nodes.filter((n) => n?.isOwned && !n.scanDuration)
    const possibleHackNodes = nodes.filter((n) => getIsNodeHackable(n.id))
    const nodeToScan = sample(possibleScanNodes)
    const nodeToHack = sample(possibleHackNodes)
    if (nodeToHack) {
      onHackStart(nodeToHack.id)
    } else if (nodeToScan) {
      onScanStart(nodeToScan.id)
    }
  }, [getNode, isUnlocked, onHackStart, enabled, onScanStart, renderedNodeIds])

  return {
    enabled,
    isUnlocked,
    setEnabled,
    onAutohack,
  }
}
