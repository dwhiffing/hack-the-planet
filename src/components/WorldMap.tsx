import React, { useEffect, useRef, useState } from 'react'
import { WorldSvg } from '@/components/WorldSvg'
import { BotNet } from '@/components/WorldBotNet'
import {
  coordsToTransform,
  getNodes,
  getZoomLevel,
  groupNodes,
} from '@/utils/geo'
import { MapControls } from '@/components/WorldControls'
import { useTick } from '@/utils/useTick'
import { deserializeSave, store } from '@/utils/valtioState'
import { useSnapshot } from 'valtio'
import { minZoom, maxZoom, zoomScale, homeId } from '@/constants/index'
import { clamp } from 'lodash'

export function WorldMap({ width, height }: { width: number; height: number }) {
  const { tickspeed } = useSnapshot(store)
  const svgRef = useRef<SVGGElement>(null)
  const svgRef2 = useRef<SVGGElement>(null)
  const transformRef = useRef({ x: 0, y: 0, scale: maxZoom })
  const [isDragging, setIsDragging] = useState(false)
  const lastMouse = useRef({ x: 0, y: 0 })
  const mouseStart = useRef({ x: 0, y: 0 })
  const [zoomLevel, setZoomLevel] = useState(0)

  useTick(tickspeed)

  const onClickHome = () => {
    const home = store.allNodes.find((n) => n.id == homeId)?.earthCoords
    if (home && width && height) {
      const offsetX = width >= 768 ? 150 : 0
      const offsetY = width >= 768 ? 0 : -150
      transformRef.current = coordsToTransform(
        home[0],
        home[1],
        zoomScale,
        width,
        height,
        offsetX,
        offsetY,
      )
    }
  }

  const updateTransform = () => {
    if (!svgRef.current || !svgRef2.current || !width || !height) return

    if (store.allNodes.length === 0) {
      const nodes = getNodes(svgRef.current)
      store.allNodes = nodes
      store.groupedNodes = groupNodes(nodes)

      const save =
        typeof localStorage !== 'undefined'
          ? localStorage.getItem('hack-the-planet')
          : undefined
      deserializeSave(save)
      onClickHome()
    }

    const { x, y, scale } = transformRef.current
    svgRef.current.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
    svgRef.current.style.visibility = `visible`
    svgRef2.current.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
    svgRef2.current.style.visibility = `visible`

    const newZoomLevel = getZoomLevel(scale)
    if (zoomLevel !== newZoomLevel) setZoomLevel(newZoomLevel)
  }

  const onZoomIn = () => changeZoom(1.25)

  const onZoomOut = () => changeZoom(0.75)

  const onWheel = (e: any) => {
    const scaleAmount = 1 - clamp(e.deltaY, -10, 10) / 100
    changeZoom(scaleAmount, e.clientX, e.clientY)
  }

  const changeZoom = (amount = 1, _x = width / 2, _y = height / 2) => {
    const { scale, x, y } = transformRef.current
    const newScale = Math.max(minZoom, Math.min(maxZoom, scale * amount))
    const prevX = (_x - x) / scale
    const prevY = (_y - y) / scale

    transformRef.current.scale = newScale
    transformRef.current.x = _x - prevX * newScale
    transformRef.current.y = _y - prevY * newScale

    updateTransform()
  }

  const onPointerDown = (e: any) => {
    setIsDragging(true)
    lastMouse.current = { x: e.clientX, y: e.clientY }
    mouseStart.current = { x: e.clientX, y: e.clientY }
  }

  const onPointerMove = (e: any) => {
    if (!isDragging) return
    const dx = e.clientX - lastMouse.current.x
    const dy = e.clientY - lastMouse.current.y
    transformRef.current.x += dx
    transformRef.current.y += dy
    lastMouse.current = { x: e.clientX, y: e.clientY }
    updateTransform()
  }

  const onPointerUp = (e: any) => {
    const xDiff = Math.abs(e.clientX - (mouseStart.current?.x ?? 0))
    const yDiff = Math.abs(e.clientY - (mouseStart.current?.y ?? 0))
    if (xDiff + yDiff < 1) {
      store.selectedNodeId = -1
    }
    setIsDragging(false)
  }

  useEffect(() => {
    if (!width || !height) return
    updateTransform()
  })

  if (width === 0 && height === 0) return null

  return (
    <>
      <MapControls
        onClickHome={onClickHome}
        onZoomOut={onZoomOut}
        onZoomIn={onZoomIn}
      />
      <svg
        width={width}
        height={height}
        className={`overflow-hidden lg:rounded-xl zoom-${zoomLevel} ${isDragging ? '' : 'not-dragging'}`}
        onWheel={onWheel}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          overflow: 'hidden',
        }}
      >
        <g ref={svgRef} style={{ visibility: 'hidden' }}>
          <WorldSvg />
        </g>
        <rect
          className="relative z-10"
          fill="transparent"
          width={width}
          height={height}
          onTouchMove={onPointerMove}
          onTouchEnd={onPointerUp}
          onTouchStart={onPointerDown}
          onMouseMove={onPointerMove}
          onMouseLeave={onPointerUp}
          onMouseUp={onPointerUp}
          onMouseDown={onPointerDown}
        />
        <g
          ref={svgRef2}
          style={{
            visibility: 'hidden',
            pointerEvents: isDragging ? 'none' : 'auto',
          }}
        >
          <BotNet />
        </g>
      </svg>
    </>
  )
}
