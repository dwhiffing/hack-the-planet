import React, { memo } from 'react'
import { FullNode, IGlobalAction, INodeAction } from '@/types'
import {
  buyUpgrade,
  calculateNextCost,
  getUpgradeEffect,
} from '@/utils/upgrades'
import { useSnapshot } from 'valtio'
import { store } from '@/utils/valtioState'
import { getIsNodeHackable, getNodeIncome } from '@/utils/nodes'
import { onHackStart } from '@/utils/hack'
import { onScanStart } from '@/utils/scan'
import { onDisconnect } from '@/utils/investigate'
import { homeId, UPGRADES } from '@/constants/index'
import { onSteal } from '@/utils/steal'
import { formatMoney } from './WorldControls'

export const NodeControls = memo(function NodeControls() {
  const { money, selectedNodeId, upgrades, incomePerTick, suspicion } =
    useSnapshot(store)
  const { [selectedNodeId]: _selectedNode } = useSnapshot(store.nodes)
  const selectedNode = _selectedNode as FullNode
  const selectedNodeIncome = selectedNode ? getNodeIncome(selectedNodeId) : -1
  if (!selectedNode) return null

  const globalActions: IGlobalAction[] = [
    ...UPGRADES.map((upgrade) => {
      const state = upgrades?.[upgrade.key]
      const level = state?.level ?? 0
      const cost = state ? calculateNextCost(state.key, level) : 0
      const isMaxed =
        level === (upgrade.costs ? upgrade.costs.length : upgrade.maxLevel)
      return {
        label: isMaxed
          ? `${upgrade.name} maxed`
          : `${upgrade.name} (${getUpgradeEffect(upgrade.key).toFixed(
              2,
            )} to ${getUpgradeEffect(upgrade.key, true).toFixed(
              2,
            )}) - ${formatMoney(cost)}`,
        description: upgrade.description ?? 'Placeholder',
        getIsVisible: () =>
          store.renderedNodeIds.length >= upgrade.requiredNodes,
        getIsDisabled: () => store.money < cost || isMaxed,
        onClick: () => buyUpgrade(upgrade.key),
      }
    }),
  ]

  const buttons = [
    ...(selectedNodeId
      ? selectedNodeActions.filter((a) => a.getIsVisible(selectedNode))
      : []),
    ...(selectedNodeId === homeId
      ? globalActions.filter((a) => a.getIsVisible())
      : []),
  ]

  return (
    <div className="">
      <div className="mb-3 hidden md:block">
        <p>Money: {formatMoney(money)}</p>
        <p>Income: {formatMoney(incomePerTick)}</p>
        <p>Suspicion: {(suspicion / 100).toFixed(2)}%</p>
      </div>
      {/* <p>id: {selectedNode?.id}</p> */}
      <p className="mb-3">type: {selectedNode?.type}</p>
      <p>
        income:{' '}
        {formatMoney(selectedNodeIncome * getUpgradeEffect('steal-amount'))}
      </p>
      <p>max income: {formatMoney(selectedNodeIncome)}</p>
      <p>country: {selectedNode?.country}</p>
      <p>
        coords:{' '}
        {selectedNode?.earthCoords?.map((n) => n.toFixed(1))?.join(', ')}
      </p>
      <div className="mt-2 flex max-w-[300px] flex-wrap gap-2">
        {buttons.map((a) => (
          <button
            key={a.label}
            className="pointer-events-auto"
            title={a.description}
            disabled={a.getIsDisabled(selectedNode)}
            onClick={() => a.onClick(selectedNode)}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  )
})

const selectedNodeActions: INodeAction[] = [
  {
    label: 'hack',
    description: 'Take over this node',
    getIsDisabled: (node: FullNode) => !getIsNodeHackable(node.id),
    getIsVisible: (node: FullNode) => node.type !== 'home' && !node.isOwned,
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
    label: 'steal',
    description: 'Steal extra money from this node',
    getIsVisible: (node: FullNode) =>
      node && node.isOwned && node.id !== homeId,
    getIsDisabled: (node: FullNode) => false,
    onClick: (node: FullNode) => onSteal(node.id),
  },
  {
    label: 'disconnect',
    description: 'Disconnect this node and all downstream nodes',
    getIsDisabled: () => false,
    getIsVisible: (node: FullNode) => node.isOwned && node.type !== 'home',
    onClick: (node: FullNode) => onDisconnect(node.id),
  },
]
