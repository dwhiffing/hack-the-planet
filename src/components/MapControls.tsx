import React from 'react'
import { homeId, zoomScale } from '@/constants'
import { Node } from '@/utils/getNodes'
import { coordsToTransform } from '@/utils/coords'
import { ProvidedZoom } from '@vx/zoom/lib/types'

export const MapControls = ({
  zoom,
  nodes,
  width,
  height,
}: {
  zoom: ProvidedZoom
  nodes: Record<number, Node>
  width: number
  height: number
}) => {
  return (
    <div className="absolute top-4 right-4 flex flex-col items-end">
      <button onClick={() => zoom.scale({ scaleX: 1.2 })}>+</button>
      <button onClick={() => zoom.scale({ scaleX: 0.8 })}>-</button>
      <button
        onClick={() => {
          const home = nodes[homeId].earthCoords!
          zoom.setTransformMatrix(
            coordsToTransform(...home, zoomScale, width, height),
          )
        }}
      >
        Home
      </button>
    </div>
  )
}
