import React, { useEffect, useRef } from 'react'
import { Zoom } from '@vx/zoom'
import { background, baseTickspeed, maxZoom, minZoom } from '@/constants'
import { WorldSvg } from './WorldSvg'
import { BotNet } from './WorldBotNet'
import { coordsToTransform } from '@/utils/geo'
import { MapControls } from './WorldControls'
import { useNodes, useSelectedNodeId } from '@/utils/hooks/useNodeState'
import { useTick } from '@/utils/hooks/useTick'
import { ProvidedZoom } from '@vx/zoom/lib/types'
import { useGlobalActions, useNodeActions } from '@/utils/hooks/useActions'
import { useZoom } from '@/utils/hooks/useZoom'
import { getVisibleGroups, getZoomLevel } from '@/utils/getNodesWithDistance'

export function WorldMap({ width, height }: { width: number; height: number }) {
  const { worldSvgMountCallback } = useNodes()
  const { onClickHome, zoomRef, mouseRef } = useZoom(width, height)
  const { globalActions } = useGlobalActions(onClickHome)
  const { selectedNodeActions } = useNodeActions()
  const { selectedNodeId, onClickNode, onDeselect } = useSelectedNodeId()
  const allowScroll = useRef(true)

  useTick()

  useEffect(() => {
    onClickHome()
  }, [onClickHome])

  if (width === 0 && height === 0) return null

  const onScroll = (e: React.WheelEvent<Element> | WheelEvent) => {
    if (!allowScroll.current) {
      return { scaleX: 1, scaleY: 1 }
    }
    allowScroll.current = false
    setTimeout(() => {
      allowScroll.current = true
    }, 400)
    if (e.deltaY > 0) {
      return { scaleX: 0.25, scaleY: 0.25 }
    }
    return { scaleX: 4, scaleY: 4 }
  }

  const onMouseLeave = () => {
    if (zoomRef.current?.state.isDragging) zoomRef.current?.dragEnd()
  }

  const onMouseUp = (zoom: ProvidedZoom) => (e: React.MouseEvent) => {
    const xDiff = Math.abs(e.screenX - (mouseRef.current?.x ?? 0))
    const yDiff = Math.abs(e.screenY - (mouseRef.current?.y ?? 0))
    if (xDiff + yDiff < 1) onDeselect()
    zoom.dragEnd()
  }

  const onMouseDown = (zoom: ProvidedZoom) => (e: React.MouseEvent) => {
    mouseRef.current = { x: e.screenX, y: e.screenY }
    zoom.dragStart(e)
  }

  return (
    // @ts-ignore
    <Zoom
      ref={zoomRef}
      width={width}
      height={height}
      scaleXMin={minZoom}
      scaleYMin={minZoom}
      scaleXMax={maxZoom}
      scaleYMax={maxZoom}
      wheelDelta={onScroll}
      transformMatrix={coordsToTransform(0, 0, maxZoom, width, height)}
    >
      {(zoom) => (
        <>
          <svg
            className={`rounded-xl overflow-hidden zoom-${getZoomLevel(
              zoom.transformMatrix,
            )}`}
            width={width}
            height={height}
            style={{ cursor: zoom.isDragging ? 'grabbing' : 'grab' }}
          >
            <rect x={0} y={0} width={width} height={height} fill={background} />

            <g ref={worldSvgMountCallback} transform={zoom.toString()}>
              <WorldSvg />
            </g>
            <rect
              className="relative z-10"
              fill="transparent"
              width={width}
              height={height}
              onMouseMove={zoom.dragMove}
              onMouseLeave={onMouseLeave}
              onMouseUp={onMouseUp(zoom)}
              onMouseDown={onMouseDown(zoom)}
            />
            <g
              style={{ pointerEvents: zoom.isDragging ? 'none' : 'auto' }}
              transform={zoom.toString()}
            >
              <BotNet
                groupKeysString={getVisibleGroups(
                  zoom.transformMatrix,
                  width,
                  height,
                )}
                zoomLevel={getZoomLevel(zoom.transformMatrix)}
                onClickNode={onClickNode}
                tickspeed={baseTickspeed}
              />
            </g>
          </svg>

          <MapControls
            selectedNodeActions={selectedNodeActions}
            globalActions={globalActions}
            selectedNodeId={selectedNodeId}
            zoom={zoom}
          />
        </>
      )}
    </Zoom>
  )
}
