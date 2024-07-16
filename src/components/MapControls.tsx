import React, { memo } from 'react'
import { homeId, zoomScale, IWorldState } from '@/constants'
import { coordsToTransform } from '@/utils/coords'
import { ProvidedZoom } from '@vx/zoom/lib/types'
import { clearLocalStorage } from '@/utils/localStorage'

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
      <div className="absolute top-0 p-4 inset-x-0 flex justify-between pointer-events-none">
        <div className="">
          <p>Money: ${worldState.money}</p>
          {worldState.selectedNode && (
            <div className="border border-[#555] my-2 p-2">
              <p>id: {worldState.selectedNode?.id}</p>
              <p>country: {worldState.selectedNode?.country}</p>
              <p>money: {worldState.selectedNode?.money}</p>
              <p>
                coords:{' '}
                {worldState.selectedNode?.earthCoords
                  ?.map((n) => n.toFixed(4))
                  ?.join(', ')}
              </p>
              <div className="flex gap-2">
                {worldState.actions.map((a) => (
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
          )}
        </div>
        <div className="flex flex-row items-start gap-2">
          {/* <button onClick={() => zoom.scale({ scaleX: 1.2 })}>+</button>
          <button onClick={() => zoom.scale({ scaleX: 0.8 })}>-</button> */}
          <button
            className="pointer-events-auto"
            onClick={() => {
              const home = worldState.allNodesObj[homeId].earthCoords!
              zoom.setTransformMatrix(
                coordsToTransform(...home, zoomScale, width, height),
              )
            }}
          >
            Home
          </button>
          <button className="pointer-events-auto" onClick={clearLocalStorage}>
            Reset
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
