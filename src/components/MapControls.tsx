import React, { memo } from 'react'
import { FullNode } from '@/constants'

import { useNodeState } from '@/utils/useWorldState'

export const MapControls = memo(
  function MapControls({
    money,
    selectedNodeId,
    actions,
    globalActions,
  }: {
    money: number
    actions: {
      label: string
      getIsVisible: (node: FullNode) => boolean | undefined
      onClick: (node: FullNode) => void
    }[]
    globalActions: {
      label: string
      getIsVisible: () => boolean
      onClick: () => void
    }[]
    selectedNodeId?: number
  }) {
    const { node: selectedNode } = useNodeState(selectedNodeId)

    return (
      <div className="absolute top-0 p-4 inset-x-0 flex justify-between pointer-events-none">
        <div className="">
          <p>Money: ${money}</p>
          {selectedNode && (
            <div className="border border-[#555] my-2 p-2">
              <p>id: {selectedNode?.id}</p>
              <p>country: {selectedNode?.country}</p>
              <p>money: {selectedNode?.money}</p>
              <p>
                coords:{' '}
                {selectedNode?.earthCoords
                  ?.map((n) => n.toFixed(4))
                  ?.join(', ')}
              </p>
              <div className="flex gap-2">
                {selectedNodeId &&
                  actions
                    .filter((a) => a.getIsVisible(selectedNode))
                    .map((a) => (
                      <button
                        key={a.label}
                        className="pointer-events-auto"
                        onClick={() => a.onClick(selectedNode)}
                      >
                        {a.label}
                      </button>
                    ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-row items-start gap-2">
          {globalActions
            .filter((a) => a.getIsVisible())
            .map((a) => (
              <button
                key={a.label}
                className="pointer-events-auto"
                onClick={a.onClick}
              >
                {a.label}
              </button>
            ))}
        </div>
      </div>
    )
  },
  (prev, next) => {
    return (
      prev.money === next.money &&
      prev.selectedNodeId === next.selectedNodeId &&
      prev.actions === next.actions
    )
  },
)
