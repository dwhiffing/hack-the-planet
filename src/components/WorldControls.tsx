import React, { memo } from 'react'

import { FullNode, IGlobalAction, IMapProps, INodeAction } from '@/types'
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
import { UPGRADES } from '@/constants'
import { clearSave, exportSave, importSave } from '@/utils/localStorage'

export const MapControls = memo(function MapControls(props: IMapProps) {
  const { money, upgrades, selectedNodeId, incomePerTick, suspicion } =
    useSnapshot(store)
  const { [selectedNodeId]: _selectedNode } = useSnapshot(store.nodes)
  const selectedNode = _selectedNode as FullNode

  const globalActions: IGlobalAction[] = [
    {
      label: 'Reset',
      description: 'Reset your save',
      getIsVisible: () => true,
      getIsDisabled: () => false,
      onClick: clearSave,
    },
    {
      label: 'Export',
      description: 'Export your save',
      getIsVisible: () => true,
      getIsDisabled: () => false,
      onClick: exportSave,
    },
    {
      label: 'Import',
      description: 'Import your save',
      getIsVisible: () => true,
      getIsDisabled: () => false,
      onClick: importSave,
    },
    // {
    //   label: `${enabled ? 'disable' : 'enable'} autohack`,
    //   description: 'Toggle autohack',
    //   getIsVisible: () => isUnlocked,
    //   getIsDisabled: () => false,
    //   onClick: () => setEnabled(!enabled),
    // },
    ...UPGRADES.map((upgrade) => {
      const state = upgrades?.[upgrade.key]
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
        getIsVisible: () =>
          store.renderedNodeIds.length >= upgrade.requiredNodes,
        getIsDisabled: () => store.money < cost || isMaxed,
        onClick: () => buyUpgrade(upgrade.key),
      }
    }),
  ]

  const selectedNodeIncome = selectedNode ? getNodeIncome(selectedNodeId) : -1

  return (
    <div className="absolute top-0 p-4 inset-x-0 flex text-white justify-between pointer-events-none">
      <div className="">
        <p>Money: {formatMoney(money)}</p>
        <p>Income: {formatMoney(incomePerTick)}</p>
        <p>Suspicion: {(suspicion / 100).toFixed(2)}%</p>
        {selectedNode && (
          <div className="border border-[#555] my-2 p-2">
            {/* <p>id: {selectedNode?.id}</p> */}
            <p className="mb-3">type: {selectedNode?.type}</p>
            <p>
              income:{' '}
              {formatMoney(
                selectedNodeIncome * getUpgradeEffect('steal-amount'),
              )}
            </p>
            <p>max income: {formatMoney(selectedNodeIncome)}</p>
            <p>country: {selectedNode?.country}</p>
            <p>
              coords:{' '}
              {selectedNode?.earthCoords?.map((n) => n.toFixed(1))?.join(', ')}
            </p>
            <div className="flex gap-2 flex-wrap max-w-44">
              {selectedNodeId &&
                selectedNodeActions
                  .filter((a) => a.getIsVisible(selectedNode))
                  .map((a) => (
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
        )}
      </div>
      <div className="flex flex-col gap-2 items-end">
        <div className="flex gap-2 ">
          <button className="pointer-events-auto" onClick={props.onZoomOut}>
            -
          </button>
          <button className="pointer-events-auto" onClick={props.onZoomIn}>
            +
          </button>
        </div>
        <button
          disabled={false}
          title="Go to home node"
          className={`pointer-events-auto`}
          onClick={props.onClickHome}
        >
          Home
        </button>
        {globalActions
          .filter((a) => a.getIsVisible())
          .map((a) => {
            const disabled = a.getIsDisabled()
            return (
              <button
                key={a.label}
                disabled={disabled}
                title={a.description}
                className={`pointer-events-auto`}
                onClick={a.onClick}
              >
                {a.label}
              </button>
            )
          })}
      </div>
    </div>
  )
})

export function formatMoney(number: number) {
  return number.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

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
    label: 'disconnect',
    description: 'Disconnect this node and all downstream nodes',
    getIsDisabled: () => false,
    getIsVisible: (node: FullNode) => node.isOwned && node.type !== 'home',
    onClick: (node: FullNode) => onDisconnect(node.id),
  },
]
