import React from 'react'
import { homeId, zoomScale } from '@/constants'
import { coordsToTransform } from '@/utils/coords'
import { ProvidedZoom } from '@vx/zoom/lib/types'
import { IWorldState } from '../utils/useWorldState'

export const MapControls = ({
  worldState,
  zoom,
  width,
  height,
}: {
  worldState: IWorldState
  zoom: ProvidedZoom
  width: number
  height: number
}) => {
  return (
    <div className="absolute top-0 p-4 inset-x-0 flex justify-between">
      <div className="">
        Money: ${worldState.money}
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
}
