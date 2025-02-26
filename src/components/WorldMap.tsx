import React, { useCallback, useEffect, useRef } from 'react'
import { Zoom } from '@vx/zoom'
import { maxZoom, minZoom } from '@/constants/index'
import { WorldSvg } from '@/components/WorldSvg'
import { CollapsedBotNet, GroupedBotNet } from '@/components/WorldBotNet'
import { coordsToTransform, getNodes, getVisibleGroups } from '@/utils/geo'
import { MapControls } from '@/components/WorldControls'
import { useTick } from '@/utils/useTick'
import { ProvidedZoom } from '@vx/zoom/lib/types'
import { useZoom } from '@/utils/useZoom'
import { getZoomLevel, groupNodes } from '@/utils/geo'
import { deserializeSave, store } from '@/utils/valtioState'
import { useSnapshot } from 'valtio'

export function WorldMap({ width, height }: { width: number; height: number }) {
  const { onClickHome, zoomRef, mouseRef } = useZoom(width, height)
  const { tickspeed } = useSnapshot(store)

  const worldSvgMountCallback = useCallback((node: SVGGElement) => {
    const nodes = getNodes(node)
    store.allNodes = nodes
    store.groupedNodes = groupNodes(nodes)

    const save =
      typeof localStorage !== 'undefined'
        ? localStorage.getItem('hack-the-planet')
        : undefined
    deserializeSave(save)
  }, [])

  useTick(tickspeed)

  useEffect(() => {
    onClickHome()
  }, [onClickHome])

  const onZoomIn = useCallback(() => {
    const scaleX = zoomRef.current?.state.transformMatrix?.scaleX ?? 0
    const scale = scaleX < 3 ? 2 : 4
    zoomRef.current?.scale({ scaleX: scale, scaleY: scale })
  }, [zoomRef])

  const onZoomOut = useCallback(() => {
    const scaleX = zoomRef.current?.state.transformMatrix?.scaleX ?? 0
    const scale = scaleX < 5 ? 0.5 : 0.25
    zoomRef.current?.scale({ scaleX: scale, scaleY: scale })
  }, [zoomRef])

  if (width === 0 && height === 0) return null

  const onScroll = (e: React.WheelEvent<Element> | WheelEvent) => {
    let scale: number
    if (e.deltaY > 0) {
      scale = 0.9
    } else {
      scale = 1.1
    }
    return { scaleX: scale, scaleY: scale }
  }

  const onPointerLeave = () => {
    if (zoomRef.current?.state.isDragging) zoomRef.current?.dragEnd()
  }

  const onPointerUp =
    (zoom: ProvidedZoom) => (e: React.MouseEvent | React.TouchEvent) => {
      // @ts-ignore
      const xDiff = Math.abs(e.screenX - (mouseRef.current?.x ?? 0))
      // @ts-ignore
      const yDiff = Math.abs(e.screenY - (mouseRef.current?.y ?? 0))
      if (xDiff + yDiff < 1) {
        store.selectedNodeId = -1
      }
      zoom.dragEnd()
    }

  const onPointerDown =
    (zoom: ProvidedZoom) => (e: React.MouseEvent | React.TouchEvent) => {
      // @ts-ignore
      mouseRef.current = { x: e.screenX, y: e.screenY }
      zoom.dragStart(e)
    }

  return (
    <>
      <MapControls
        onClickHome={onClickHome}
        onZoomOut={onZoomOut}
        onZoomIn={onZoomIn}
      />
      {/* @ts-ignore */}
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
              className={`overflow-hidden lg:rounded-xl zoom-${getZoomLevel(zoom.transformMatrix.scaleX)} ${zoom.isDragging ? '' : 'not-dragging'}`}
              width={width}
              height={height}
              style={{ cursor: zoom.isDragging ? 'grabbing' : undefined }}
            >
              <g ref={worldSvgMountCallback} transform={zoom.toString()}>
                <WorldSvg />
              </g>
              <rect
                className="relative z-10"
                fill="transparent"
                width={width}
                height={height}
                onTouchMove={zoom.dragMove}
                onTouchEnd={onPointerUp(zoom)}
                onTouchStart={onPointerDown(zoom)}
                onMouseMove={zoom.dragMove}
                onMouseLeave={onPointerLeave}
                onMouseUp={onPointerUp(zoom)}
                onMouseDown={onPointerDown(zoom)}
              />
              <g
                style={{ pointerEvents: zoom.isDragging ? 'none' : 'auto' }}
                transform={zoom.toString()}
              >
                <GroupedBotNet
                  allGroupKeys={Object.keys(store.groupedNodes).join(':')}
                  groupKeysString={getVisibleGroups(
                    zoom.transformMatrix,
                    width,
                    height,
                  )}
                  isVisible={zoom.transformMatrix.scaleX >= 13}
                />
                <CollapsedBotNet isVisible={zoom.transformMatrix.scaleX < 13} />
              </g>
            </svg>
          </>
        )}
      </Zoom>
    </>
  )
}
