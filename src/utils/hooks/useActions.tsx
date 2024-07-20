import { useMemo } from 'react'
import { FullNode, IGlobalAction, INodeAction } from '@/types'
import { clearLocalStorage } from '../localStorage'
import { useMoney } from './useMoney'
import { calculateNextCost, getUpgradeEffect, useUpgrades } from './useUpgrades'
import { useScan } from './useScan'
import { useHack } from './useHack'
import { getIsNodeHackable } from '../nodes'
import { useDisconnectNode } from './useFBIInvestigation'
import { UPGRADES } from '@/constants'
import { useNodes } from './useNodeState'
import { formatMoney } from '@/components/WorldControls'

export const useNodeActions = () => {
  const { onScanStart } = useScan()
  const { onHackStart, onSteal } = useHack()
  const { onDisconnect } = useDisconnectNode()

  const selectedNodeActions = useMemo(() => {
    const nodeActions: INodeAction[] = [
      {
        label: 'steal',
        description: 'Take money from this node and send it to connected node',
        getIsDisabled: (node: FullNode) => (node.money ?? 0) <= 0,
        getIsVisible: (node: FullNode) => node.isOwned && !node.isHome,
        onClick: (node: FullNode) => onSteal(node.id),
      },
      {
        label: 'hack',
        description: 'Take over this node',
        getIsDisabled: (node: FullNode) => !getIsNodeHackable(node.id),
        getIsVisible: (node: FullNode) => !node.isHome && !node.isOwned,
        onClick: (node: FullNode) => onHackStart(node.id),
      },
      {
        label: 'scan',
        description: 'Scan for nearby nodes',
        getIsVisible: (node: FullNode) => node && node.isOwned,
        getIsDisabled: (node: FullNode) => (node.scanDuration ?? 0) > 0,
        onClick: (node: FullNode) => onScanStart(node.id),
      },
      {
        label: 'disconnect',
        description: 'Disconnect this node and all downstream nodes',
        getIsDisabled: () => false,
        getIsVisible: (node: FullNode) => node.isOwned && !node.isHome,
        onClick: (node: FullNode) => onDisconnect(node.id),
      },
    ]
    return nodeActions
  }, [onHackStart, onScanStart, onSteal, onDisconnect])

  return { selectedNodeActions }
}

export const useGlobalActions = (onClickHome: () => void) => {
  const { money } = useMoney()
  const { upgradeStates, buyUpgrade } = useUpgrades()
  const { renderedNodeIds } = useNodes()

  const nodeCount = renderedNodeIds.length
  const globalActions = useMemo(() => {
    const globalAction: IGlobalAction[] = [
      {
        label: 'Home',
        description: 'Go to home node',
        getIsVisible: () => true,
        getIsDisabled: () => false,
        onClick: onClickHome,
      },
      {
        label: 'Reset',
        description: 'Reset your save',
        getIsVisible: () => true,
        getIsDisabled: () => false,
        onClick: () => {
          const confirmed = confirm(
            'Are you sure you what to clear your save and restart?',
          )
          if (confirmed) clearLocalStorage()
        },
      },
      // {
      //   label: `${enabled ? 'disable' : 'enable'} autohack`,
      //   description: 'Toggle autohack',
      //   getIsVisible: () => isUnlocked,
      //   getIsDisabled: () => false,
      //   onClick: () => setEnabled(!enabled),
      // },
      ...UPGRADES.map((upgrade) => {
        const state = upgradeStates?.[upgrade.key]
        const level = state?.level ?? 0
        const cost = state ? calculateNextCost(state.key, level) : 0
        const isMaxed =
          level === (upgrade.costs ? upgrade.costs.length : upgrade.maxLevel)
        return {
          label: isMaxed
            ? `${upgrade.name} maxed`
            : `Upgrade ${upgrade.name} (${getUpgradeEffect(upgrade.key).toFixed(
                2,
              )} to ${getUpgradeEffect(upgrade.key, true).toFixed(
                2,
              )}) - ${formatMoney(cost)}`,
          description: upgrade.description ?? 'Placeholder',
          getIsVisible: () => nodeCount >= upgrade.requiredNodes,
          getIsDisabled: () => money < cost || isMaxed,
          onClick: () => buyUpgrade(upgrade.key),
        }
      }),
    ]
    return globalAction
  }, [onClickHome, nodeCount, buyUpgrade, money, upgradeStates])

  return {
    globalActions,
  }
}
