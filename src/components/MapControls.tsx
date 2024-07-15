import React, { memo } from 'react'
import { homeId, zoomScale, IWorldState } from '@/constants'
import { coordsToTransform } from '@/utils/coords'
import { ProvidedZoom } from '@vx/zoom/lib/types'

export const MapControls = memo(
  function MapControls({
    worldState,
    zoom,
    width,
    height,
  }: {
    worldState: IWorldState
    zoom: ProvidedZoom
    width: number
    height: number
  }) {
    return (
      <div className="absolute top-0 p-4 inset-x-0 flex justify-between">
        <div className="">
          <p>Money: ${worldState.money}</p>
          <p>SelectedNode: {worldState.selectedNode?.id}</p>
          <p>country: {worldState.selectedNode?.country}</p>
          <p>
            coords:{' '}
            {worldState.selectedNode?.earthCoords
              ?.map((n) => n.toFixed(4))
              ?.join(', ')}
          </p>
          <div className="">
            {worldState.actions.map((a) => (
              <button key={a.label} className="" onClick={a.onClick}>
                {a.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <button onClick={() => zoom.scale({ scaleX: 1.2 })}>+</button>
          <button onClick={() => zoom.scale({ scaleX: 0.8 })}>-</button>
          <button
            onClick={() => {
              const home = worldState.allNodesObj[homeId].earthCoords!
              zoom.setTransformMatrix(
                coordsToTransform(...home, zoomScale, width, height),
              )
            }}
          >
            Home
          </button>
        </div>
      </div>
    )
  },
  (prev, next) => {
    return (
      prev.width === next.width &&
      prev.height === next.height &&
      prev.worldState.money === next.worldState.money &&
      prev.worldState.selectedNode?.id === next.worldState.selectedNode?.id &&
      prev.worldState.actions === next.worldState.actions &&
      prev.worldState.allNodesObj === next.worldState.allNodesObj
    )
  },
)
