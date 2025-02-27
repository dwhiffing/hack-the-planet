import React, { useCallback, useEffect, useRef, useState } from 'react'
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
import { minZoom, maxZoom, homeId, baseScale } from '@/constants/index'
import { clamp } from 'lodash'

const initNodes = (worldSvg: SVGGElement) => {
  if (!worldSvg) return

  const nodes = getNodes(worldSvg)
  store.allNodes = nodes
  store.groupedNodes = groupNodes(nodes)

  const save =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('hack-the-planet')
      : undefined
  deserializeSave(save)
}

export function WorldMap({ width, height }: { width: number; height: number }) {
  const { tickspeed } = useSnapshot(store)
  const worldSvgRef = useRef<SVGGElement>(null)
  const botNetRef = useRef<SVGGElement>(null)
  const transformRef = useRef({ x: 0, y: 0, scale: maxZoom })
  const lastMouse = useRef({ x: 0, y: 0 })
  const mouseStart = useRef({ x: 0, y: 0 })
  const rafRef = useRef(false)

  useTick(tickspeed)

  const onClickHome = useCallback(() => {
    const home = store.allNodes.find((n) => n.id == homeId)?.earthCoords
    if (!home || !width || !height) return

    const [x, y] = home
    const [w, h] = [width, height]
    const offsetX = width >= 768 ? 150 : 0
    const offsetY = width >= 768 ? 0 : -150
    const trans = coordsToTransform(x, y, baseScale, w, h, offsetX, offsetY)
    transformRef.current = trans
  }, [width, height])

  const updateTransform = useCallback(() => {
    if (!worldSvgRef.current || !width || !height) return

    if (store.allNodes.length === 0) {
      initNodes(worldSvgRef.current)
      onClickHome()
    }

    if (rafRef.current) return

    rafRef.current = true

    requestAnimationFrame(() => {
      if (!worldSvgRef.current || !botNetRef.current) return
      const { x, y, scale } = transformRef.current
      const transform = `translate(${x}px, ${y}px) scale(${scale})`
      worldSvgRef.current.style.transform = transform
      botNetRef.current.style.transform = transform
      store.zoom = getZoomLevel(scale)

      rafRef.current = false
    })
  }, [width, height, onClickHome])

  const changeZoom = useCallback(
    (amount = 1, _x = width / 2, _y = height / 2) => {
      const { scale, x, y } = transformRef.current
      const newScale = Math.max(minZoom, Math.min(maxZoom, scale * amount))
      const prevX = (_x - x) / scale
      const prevY = (_y - y) / scale

      transformRef.current.scale = newScale
      transformRef.current.x = _x - prevX * newScale
      transformRef.current.y = _y - prevY * newScale

      updateTransform()
    },
    [width, height, updateTransform],
  )

  const onZoomIn = useCallback(() => changeZoom(1.25), [changeZoom])

  const onZoomOut = useCallback(() => changeZoom(0.75), [changeZoom])

  const onPointerDown = (e: any) => {
    store.isDragging = true
    lastMouse.current = { x: e.clientX, y: e.clientY }
    mouseStart.current = { x: e.clientX, y: e.clientY }
  }

  const onPointerMove = (e: any) => {
    if (!store.isDragging) return
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
    store.isDragging = false
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
      <GameSvg
        width={width}
        height={height}
        onWheel={(e: any) =>
          changeZoom(1 - clamp(e.deltaY, -10, 10) / 100, e.clientX, e.clientY)
        }
      >
        <g ref={worldSvgRef}>
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

        <g ref={botNetRef}>
          <BotNet />
        </g>
      </GameSvg>
    </>
  )
}

const GameSvg = (props: {
  width: number
  height: number
  children: any
  onWheel: any
}) => {
  const { zoom, isDragging } = useSnapshot(store)
  return (
    <svg
      width={props.width}
      height={props.height}
      className={`overflow-hidden lg:rounded-xl zoom-${zoom} ${isDragging ? 'cursor-grabbing' : 'not-dragging cursor-grab'}`}
      onWheel={props.onWheel}
    >
      {props.children}
    </svg>
  )
}
