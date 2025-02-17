import React, { memo } from 'react'
import { FullNode, IGlobalAction, INodeAction, INodeType } from '@/types'
import {
  buyUpgrade,
  calculateNextCost,
  getUpgradeEffect,
} from '@/utils/upgrades'
import { useSnapshot } from 'valtio'
import { store } from '@/utils/valtioState'
import {
  getIsNodeHackable,
  getNodeHackCost,
  getNodeIncome,
  getNodeSources,
  updateNode,
} from '@/utils/nodes'
import { onHackStart } from '@/utils/hack'
import { onScan } from '@/utils/scan'

import { baseTickspeed, homeId, UPGRADES } from '@/constants/index'
import { formatMoney, MapStats } from './WorldControls'
import { get } from 'lodash'

const onDisconnect = (nodeId: number) => {
  getNodeSources(nodeId).forEach(({ id }) => {
    if (id !== homeId) updateNode(id, { isOwned: false, hackDuration: 0 })
  })
}

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
        getLabel: () =>
          isMaxed
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
      <NodeDebug node={selectedNode} />
      <p className="mb-3">type: {selectedNode?.type}</p>
      <p>
        income:{' '}
        {formatMoney(selectedNodeIncome * getUpgradeEffect('steal-amount'))}
      </p>
      <p>max income: {formatMoney(selectedNodeIncome)}</p>
      <p>hack cost: {getNodeHackCost(selectedNode.id)}</p>
      <p>country: {selectedNode?.country}</p>
      <p>
        coords:{' '}
        {selectedNode?.earthCoords?.map((n) => n.toFixed(1))?.join(', ')}
      </p>
      <div className="mt-2 flex max-w-[300px] flex-wrap gap-2">
        {buttons.map((a, i) => (
          <button
            key={i}
            className="pointer-events-auto"
            title={a.description}
            disabled={a.getIsDisabled(selectedNode, points)}
            onClick={() => a.onClick(selectedNode)}
          >
            {a.getLabel(selectedNode, points)}
          </button>
        ))}
      </div>
    </div>
  )
})

const selectedNodeActions: INodeAction[] = [
  {
    getLabel: (node) => `hack (cost: ${getNodeHackCost(node.id)})`,
    description: 'Take over this node',
    getIsDisabled: (node, points) =>
      !getIsNodeHackable(node.id) || points < getNodeHackCost(node.id),
    getIsVisible: (node) => node.type !== 'home' && !node.isOwned,
    onClick: (node) => onHackStart(node.id),
  },
  {
    getLabel: () => 'scan',
    description: 'Scan for nearby nodes',
    getIsVisible: (node) => node && node.isOwned,
    getIsDisabled: (_selectedNode, points) => false,
    onClick: (node) => onScan(node.id),
  },
  {
    getLabel: () => 'disconnect',
    description: 'Disconnect this node and all downstream nodes',
    getIsDisabled: () => false,
    getIsVisible: (node) => node.isOwned && node.type !== 'home',
    onClick: (node) => onDisconnect(node.id),
  },
]

const NodeDebug = (props: { node: FullNode }) => {
  const { tickspeed } = useSnapshot(store)
  const updateOverrides = (node: FullNode, change: any) => {
    updateNode(props.node.id, change)
    const current = get(store.nodeOverrides, `${node.id}`, {})

    store.nodeOverrides[`${node.id}`] = { ...current, ...change }
  }
  return (
    <div className="my-4 flex flex-col gap-2 text-[yellow]">
      <p>id: {props.node?.id}</p>

      <div className="flex items-center gap-2">
        <p>x:</p>
        <input
          value={props.node.x.toFixed(2)}
          type="number"
          className="p-1 text-black"
          step={0.05}
          onChange={(e) => updateOverrides(props.node, { x: +e.target.value })}
        />
      </div>
      <div className="flex items-center gap-2">
        <p>y:</p>
        <input
          value={props.node.y.toFixed(2)}
          type="number"
          className="p-1 text-black"
          step={0.05}
          onChange={(e) => updateOverrides(props.node, { y: +e.target.value })}
        />
      </div>
      <div className="flex items-center gap-2">
        <p>type:</p>
        <select
          value={props.node.type}
          className="p-1 text-black"
          onChange={(e) =>
            updateOverrides(props.node, { type: e.target.value as INodeType })
          }
        >
          <option>home</option>
          <option>basic</option>
          <option>rich</option>
          <option>bank</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() =>
            window.navigator.clipboard.writeText(
              JSON.stringify(store.nodeOverrides),
            )
          }
        >
          Copy
        </button>
        <button
          onClick={() => {
            localStorage.setItem(
              'show-all-nodes',
              (
                (localStorage.getItem('show-all-nodes') ?? '') !== 'true'
              ).toString(),
            )
            window.location.reload()
          }}
        >
          toggle show all
        </button>
        <button
          onClick={() => {
            store.tickspeed =
              tickspeed === baseTickspeed
                ? baseTickspeed / 2
                : tickspeed === baseTickspeed / 2
                  ? baseTickspeed / 5
                  : baseTickspeed
          }}
        >
          toggle tickspeed {tickspeed}
        </button>
      </div>
    </div>
  )
}
