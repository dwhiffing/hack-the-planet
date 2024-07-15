import React from 'react'
import { Zoom } from '@vx/zoom'
import { background, maxZoom, minZoom } from '@/constants'
import { WorldSvg } from './WorldSvg'
import { NetworkGraph } from './NetworkGraph'
import { coordsToTransform } from '@/utils/coords'
import { MapControls } from './MapControls'
import { useWorldState } from '../utils/useWorldState'

export function WorldMap({ width, height }: { width: number; height: number }) {
  const worldState = useWorldState(width, height)

  if (width === 0 && height === 0) return null

  const onScroll = (e: React.WheelEvent<Element> | WheelEvent) => {
    const f = 1 + -0.01 * e.deltaY
    return { scaleX: f, scaleY: f }
  }

  const onMouseLeave = () => {
    if (worldState.zoomRef.current?.state.isDragging)
      worldState.zoomRef.current?.dragEnd()
  }

  return (
    // @ts-ignore
    <Zoom
      ref={worldState.zoomRef}
      className="relative"
      width={width}
      height={height}
      scaleXMin={minZoom}
      scaleYMin={minZoom}
      scaleXMax={maxZoom}
      scaleYMax={maxZoom}
      wheelDelta={onScroll}
      transformMatrix={coordsToTransform(0, 0, 1, width, height)}
    >
      {(zoom) => (
        <>
          {/* {console.log(...transformToCoords(zoom.transformMatrix, width, height))} */}
          <svg
            className="rounded-xl overflow-hidden"
            width={width}
            height={height}
            style={{ cursor: zoom.isDragging ? 'grabbing' : 'grab' }}
          >
            <rect x={0} y={0} width={width} height={height} fill={background} />

            <g
              ref={worldState.worldSvgMountCallback}
              transform={zoom.toString()}
            >
              <WorldSvg />
            </g>

            <rect
              width={width}
              height={height}
              fill="transparent"
              className="relative z-10"
              onMouseDown={zoom.dragStart}
              onMouseMove={zoom.dragMove}
              onMouseUp={zoom.dragEnd}
              onMouseLeave={onMouseLeave}
            />
            <g
              style={{ pointerEvents: zoom.isDragging ? 'none' : 'auto' }}
              transform={zoom.toString()}
            >
              <NetworkGraph worldState={worldState} />
            </g>
          </svg>

          <MapControls
            zoom={zoom}
            worldState={worldState}
            width={width}
            height={height}
          />
        </>
      )}
    </Zoom>
  )
}
