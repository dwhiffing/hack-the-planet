import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { Zoom } from '@vx/zoom'
import { background, homeId, maxZoom, minZoom, zoomScale } from '@/constants'
import { WorldSvg } from './WorldSvg'
import { NetworkGraph } from './NetworkGraph'
import { coordsToTransform } from '@/utils/coords'
import { MapControls } from './MapControls'
import { useMoney, useWorldState } from '../utils/useWorldState'
import { clearLocalStorage } from '@/utils/localStorage'

export function WorldMap({ width, height }: { width: number; height: number }) {
  const worldState = useWorldState()
  const money = useMoney()
  const mouseRef = useRef<{ x: number; y: number } | null>(null)
  const onClickHome = useCallback(() => {
    const home = worldState.nodes.find((n) => n.id == homeId)?.earthCoords
    if (home)
      worldState.zoomRef.current?.setTransformMatrix(
        coordsToTransform(...home, zoomScale, width, height),
      )
  }, [width, height, worldState.zoomRef, worldState.nodes])

  const globalActions = useMemo(() => {
    return [
      {
        label: 'Home',
        getIsVisible: () => true,
        onClick: onClickHome,
      },
      {
        label: 'Reset',
        getIsVisible: () => true,
        onClick: clearLocalStorage,
      },
      {
        label: 'Toggle Autohack',
        getIsVisible: () => true,
        onClick: worldState.onToggleAutohack,
      },
    ]
  }, [onClickHome, worldState.onToggleAutohack])

  useEffect(() => {
    onClickHome()
  }, [onClickHome])

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
              onMouseDown={(e) => {
                mouseRef.current = { x: e.screenX, y: e.screenY }
                zoom.dragStart(e)
              }}
              onMouseMove={zoom.dragMove}
              onMouseUp={(e) => {
                const xDiff = Math.abs(e.screenX - (mouseRef.current?.x ?? 0))
                const yDiff = Math.abs(e.screenY - (mouseRef.current?.y ?? 0))
                if (xDiff + yDiff < 1) worldState.onDeselect()
                zoom.dragEnd()
              }}
              onMouseLeave={onMouseLeave}
            />
            <g
              style={{ pointerEvents: zoom.isDragging ? 'none' : 'auto' }}
              transform={zoom.toString()}
            >
              <NetworkGraph
                nodeIds={worldState.renderedNodeIds}
                onClickNode={worldState.onClickNode}
                tickspeed={worldState.tickspeed}
              />
            </g>
          </svg>

          <MapControls
            actions={worldState.actions}
            globalActions={globalActions}
            selectedNodeId={worldState.selectedNodeId}
            money={money}
          />
        </>
      )}
    </Zoom>
  )
}
