import { useMemo } from 'react'
import { FullNode } from '@/types'
import { clearLocalStorage } from '../localStorage'
import { useMoney } from './useMoney'
import { calculateNextCost, UPGRADES, useUpgrades } from './useUpgrades'
import { useZoom } from './useZoom'
import { useScan } from './useScan'
import { useHack } from './useHack'

export const useNodeActions = () => {
  const { onScanStart } = useScan()
  const { onHackStart } = useHack()

  const selectedNodeActions = useMemo(() => {
    return [
      {
        label: 'scan',
        getIsVisible: (node: FullNode) =>
          node && node.isOwned && !node.scanDuration,
        getIsDisabled: () => false,
        onClick: (node: FullNode) => onScanStart(node.id),
      },
      {
        label: 'hack',
        getIsDisabled: () => false,
        getIsVisible: (node: FullNode) =>
          node && node.isScanned && !node.isOwned,
        onClick: (node: FullNode) => onHackStart(node.id),
      },
    ].filter(Boolean)
  }, [onHackStart, onScanStart])

  return { selectedNodeActions }
}

export const useGlobalActions = (width: number, height: number) => {
  const { money } = useMoney()
  const { upgradeStates, buyUpgrade } = useUpgrades()
  const { onClickHome } = useZoom(width, height)

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
  }, [onClickHome, buyUpgrade, money, upgradeStates])

  return {
    globalActions,
  }
}
