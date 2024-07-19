import { useMemo } from 'react'
import { FullNode } from '@/types'
import { clearLocalStorage } from '../localStorage'
import { useMoney } from './useMoney'
import { calculateNextCost, useUpgrades } from './useUpgrades'
import { useZoom } from './useZoom'
import { useScan } from './useScan'
import { useHack } from './useHack'
import { getIsNodeHackable } from '../nodes'
import { useDisconnectNode } from './useFBIInvestigation'
import { useAutoHack } from './useAutoHack'
import { UPGRADES } from '@/constants'

export const useNodeActions = () => {
  const { onScanStart } = useScan()
  const { onHackStart } = useHack()
  const { onDisconnect } = useDisconnectNode()

  const selectedNodeActions = useMemo(() => {
    return [
      {
        label: 'scan',
        getIsVisible: (node: FullNode) => node && node.isOwned,
        getIsDisabled: (node: FullNode) => (node.scanDuration ?? 0) > 0,
        onClick: (node: FullNode) => onScanStart(node.id),
      },
      {
        label: 'hack',
        getIsDisabled: () => false,
        getIsVisible: (node: FullNode) => !!getIsNodeHackable(node.id),
        onClick: (node: FullNode) => onHackStart(node.id),
      },
      {
        label: 'disconnect',
        getIsDisabled: () => false,
        getIsVisible: (node: FullNode) =>
          node && node.isScanned && node.isOwned,
        onClick: (node: FullNode) => onDisconnect(node.id),
      },
    ]
  }, [onHackStart, onScanStart, onDisconnect])

  return { selectedNodeActions }
}

export const useGlobalActions = (width: number, height: number) => {
  const { money } = useMoney()
  const { upgradeStates, buyUpgrade } = useUpgrades()
  const { onClickHome } = useZoom(width, height)
  const { enabled, isUnlocked, setEnabled } = useAutoHack()

  const globalActions = useMemo(() => {
    return [
      {
        label: 'Home',
        getIsVisible: () => true,
        getIsDisabled: () => false,
        onClick: onClickHome,
      },
      {
        label: 'Reset',
        getIsVisible: () => true,
        getIsDisabled: () => false,
        onClick: () => {
          const confirmed = confirm(
            'Are you sure you what to clear your save and restart?',
          )
          if (confirmed) clearLocalStorage()
        },
      },
      {
        label: `${enabled ? 'disable' : 'enable'} autohack`,
        getIsVisible: () => isUnlocked,
        getIsDisabled: () => false,
        onClick: () => setEnabled(!enabled),
      },
      ...UPGRADES.map((upgrade) => {
        const state = upgradeStates?.[upgrade.key]
        const level = state?.level ?? 0
        const cost = state ? calculateNextCost(state.key, level) : 0
        const isMaxed = level === upgrade.maxLevel
        return {
          label: isMaxed
            ? `${upgrade.name} maxed`
            : `Upgrade ${upgrade.name} to level ${level + 1} $${cost}`,
          getIsVisible: () => true,
          getIsDisabled: () => money < cost || isMaxed,
          onClick: () => buyUpgrade(upgrade.key),
        }
      }),
    ]
  }, [
    onClickHome,
    isUnlocked,
    buyUpgrade,
    money,
    upgradeStates,
    enabled,
    setEnabled,
  ])

  return {
    globalActions,
  }
}
