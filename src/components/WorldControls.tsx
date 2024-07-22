import React, { memo } from 'react'

import { IMapProps } from '@/types'
import { useNodeState } from '@/utils/hooks/useNodeState'
import { NODE_CONFIGS } from '@/constants'
import { useMoney } from '@/utils/hooks/useMoney'
import { useSuspicion } from '@/utils/hooks/useSuspicion'

export const MapControls = memo(function MapControls(props: IMapProps) {
  const { node: selectedNode } = useNodeState(props.selectedNodeId)
  const { money } = useMoney()
  const { suspicion } = useSuspicion()

  const config = selectedNode ? NODE_CONFIGS[selectedNode.type] : undefined
  const selectedNodeIncome = config
    ? `${formatMoney(config.incomeMin)} - ${formatMoney(config.incomeMax)}`
    : ''
  return (
    <div className="absolute top-0 p-4 inset-x-0 flex text-white justify-between pointer-events-none">
      <div className="">
        <p>Money: {formatMoney(money)}</p>
        {/* <p>Income: {formatMoney(incomePerTick)}</p> */}
        <p>Suspicion: {(suspicion / 100).toFixed(2)}%</p>
        {selectedNode && (
          <div className="border border-[#555] my-2 p-2">
            {/* <p>id: {selectedNode?.id}</p> */}
            <p className="mb-3">type: {selectedNode?.type}</p>
            <p>income: {selectedNodeIncome}</p>
            <p>money: {formatMoney(selectedNode?.money ?? 0)}</p>
            <p>outgoing: {formatMoney(selectedNode?.outgoingMoney ?? 0)}</p>
            <div className="my-3">
              <p>country: {selectedNode?.country}</p>
              <p>
                coords:{' '}
                {selectedNode?.earthCoords
                  ?.map((n) => n.toFixed(1))
                  ?.join(', ')}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap max-w-44">
              {props.selectedNodeId &&
                props.selectedNodeActions
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
          <button
            className="pointer-events-auto"
            onClick={() => {
              props.zoom.scale({ scaleX: 0.25 })
            }}
          >
            -
          </button>
          <button
            className="pointer-events-auto"
            onClick={() => {
              props.zoom.scale({ scaleX: 4 })
            }}
          >
            +
          </button>
        </div>
        {props.globalActions
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
