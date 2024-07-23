import React, { useCallback, useEffect, useRef } from 'react'
import { Zoom } from '@vx/zoom'
import {
  background,
  baseTickspeed,
  homeId,
  maxZoom,
  minZoom,
} from '@/constants'
import { WorldSvg } from './WorldSvg'
import { BotNet } from './WorldBotNet'
import { coordsToTransform, getNodes } from '@/utils/geo'
import { MapControls } from './WorldControls'
import { useTick } from '@/utils/hooks/useTick'
import { ProvidedZoom } from '@vx/zoom/lib/types'
import { useZoom } from '@/utils/hooks/useZoom'
import {
  getVisibleGroups,
  getZoomLevel,
  groupNodes,
} from '@/utils/getNodesWithDistance'
import { store } from '@/utils/valtioState'
import { updateNode } from '@/utils/nodes'
import { useSnapshot } from 'valtio'

export function WorldMap({ width, height }: { width: number; height: number }) {
  const { onClickHome, zoomRef, mouseRef } = useZoom(width, height)
  const allowScroll = useRef(true)
  const { allNodes } = useSnapshot(store)
  const worldSvgMountCallback = useCallback((node: SVGGElement) => {
    const _nodes = getNodes(node)
    store.allNodes = _nodes
    store.groupedNodes = groupNodes(_nodes)
  }, [])

  useEffect(() => {
    if (allNodes.length === 0) return

    const home = store.nodes[homeId]
    if (!home)
      updateNode(homeId, {
        isOwned: true,
        isHome: true,
        type: 'home',
      })
  }, [allNodes])

  useTick()

  useEffect(() => {
    onClickHome()
  }, [onClickHome])

  const onZoomIn = useCallback(() => {
    zoomRef.current?.scale({ scaleX: 4, scaleY: 4 })
  }, [zoomRef])

  const onZoomOut = useCallback(() => {
    zoomRef.current?.scale({ scaleX: 0.25, scaleY: 0.25 })
  }, [zoomRef])

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
    if (xDiff + yDiff < 1) {
      store.selectedNodeId = -1
    }
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
                tickspeed={baseTickspeed}
              />
            </g>
          </svg>

          <MapControls
            onClickHome={onClickHome}
            onZoomOut={onZoomOut}
            onZoomIn={onZoomIn}
          />
        </>
      )}
    </Zoom>
  )
}
