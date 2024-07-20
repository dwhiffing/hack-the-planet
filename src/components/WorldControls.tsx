import React, { memo } from 'react'

import { IMapProps } from '@/types'
import { useNodeState } from '@/utils/hooks/useNodeState'

export const MapControls = memo(function MapControls(props: IMapProps) {
  const { node: selectedNode } = useNodeState(props.selectedNodeId)

  return (
    <div className="absolute top-0 p-4 inset-x-0 flex justify-between pointer-events-none">
      <div className="">
        <p>Money: ${props.money}</p>
        <p>Suspicion: {(props.suspicion / 100).toFixed(2)}%</p>
        {selectedNode && (
          <div className="border border-[#555] my-2 p-2">
            <p>id: {selectedNode?.id}</p>
            <p>country: {selectedNode?.country}</p>
            <p>money: {selectedNode?.money}</p>
            <p>
              coords:{' '}
              {selectedNode?.earthCoords?.map((n) => n.toFixed(4))?.join(', ')}
            </p>
            <div className="flex gap-2">
              {props.selectedNodeId &&
                props.selectedNodeActions
                  .filter((a) => a.getIsVisible(selectedNode))
                  .map((a) => (
                    <button
                      key={a.label}
                      className="pointer-events-auto"
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
      <div className="flex flex-col items-end">
        {props.globalActions
          .filter((a) => a.getIsVisible())
          .map((a) => {
            const disabled = a.getIsDisabled()
            return (
              <button
                key={a.label}
                disabled={disabled}
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
