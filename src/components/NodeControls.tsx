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
import { homeId, minScanPoints, stealCost, UPGRADES } from '@/constants/index'
import { onSteal } from '@/utils/steal'
import { formatMoney, MapStats } from './WorldControls'

export const NodeControls = memo(function NodeControls() {
  const { selectedNodeId, upgrades, points, money } = useSnapshot(store)
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
        getIsDisabled: () => money < cost || isMaxed,
        onClick: () => buyUpgrade(upgrade.key),
      }
    }),
  ]

  const buttons = [
    ...(selectedNodeId
      ? selectedNodeActions.filter((a) => a.getIsVisible(selectedNode, points))
      : []),
    ...(selectedNodeId === homeId
      ? globalActions.filter((a) => a.getIsVisible())
      : []),
  ]

  return (
    <div className="">
      <MapStats />
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
            disabled={a.getIsDisabled(selectedNode, points)}
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
    getIsDisabled: (node, points) =>
      !getIsNodeHackable(node.id) || points < (node.pointCost ?? 0),
    getIsVisible: (node) => node.type !== 'home' && !node.isOwned,
    onClick: (node) => onHackStart(node.id),
  },
  {
    label: 'scan',
    description: 'Scan for nearby nodes',
    getIsVisible: (node) => node && node.isOwned,
    getIsDisabled: (_selectedNode, points) => points < minScanPoints,
    onClick: (node) => onScanStart(node.id),
  },
  {
    label: 'steal',
    description: 'Steal extra money from this node',
    getIsVisible: (node) => node && node.isOwned && node.id !== homeId,
    getIsDisabled: (node, points) => points < stealCost,
    onClick: (node) => onSteal(node.id),
  },
  {
    label: 'disconnect',
    description: 'Disconnect this node and all downstream nodes',
    getIsDisabled: () => false,
    getIsVisible: (node) => node.isOwned && node.type !== 'home',
    onClick: (node) => onDisconnect(node.id),
  },
]
