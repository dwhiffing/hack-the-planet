import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Zoom } from '@vx/zoom'
import {
  background,
  baseScale,
  baseTranslate,
  homeId,
  zoomScale,
} from '@/constants'
import { WorldSvg } from './WorldSvg'
import { NetworkGraph } from './NetworkGraph'
import { geoMercator } from 'd3-geo'
import { getNodes, Node } from '@/utils/getNodes'
import { haversineDistance } from '@/utils/groupCoordinates'
import { transformToCoords, coordsToTransform } from '@/utils/coords'
import { MapControls } from './MapControls'

const discoveryRange = 100
const projection = geoMercator().translate(baseTranslate).scale(baseScale)

export function WorldMap({ width, height }: { width: number; height: number }) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [selectedNode, setSelectedNode] = useState(-1)
  const [discoveredNodes, setDiscoveredNodes] = useState([homeId])
  const [connections, setConnections] = useState<[number, number][]>([])

  const zoomRef = useRef<Zoom | null>(null)

  const ref = useCallback(
    (node: SVGGElement) =>
      setNodes(
        getNodes(projection, node).map((n) => {
          const coords = projection([n.x, n.y]) ?? []
          return {
            ...n,
            earthCoords: [n.x, n.y],
            x: coords[0] ?? 0,
            y: coords[1] ?? 0,
          }
        }),
      ),
    [],
  )

  const allNodesObj: Record<number, Node> = useMemo(
    () => nodes.reduce((obj, n) => ({ ...obj, [n.id]: n }), {}),
    [nodes],
  )

  const renderedNodes = useMemo(
    () =>
      nodes.filter((n) => {
        if (discoveredNodes.includes(n.id)) return true

        // TODO: try to improve performance of searching for discoverable nodes
        const isDiscoverable = discoveredNodes.some((id) => {
          const node = allNodesObj[id]!
          return haversineDistance(node, n) < discoveryRange
        })

        return isDiscoverable
      }),
    [discoveredNodes, nodes, allNodesObj],
  )

  useEffect(() => {
    const home = allNodesObj[homeId]
    if (home) {
      const [x, y] = transformToCoords(
        zoomRef.current!.state.transformMatrix,
        width,
        height,
      )
      if (x === 0 && y === 0) {
        zoomRef.current?.setTransformMatrix(
          coordsToTransform(...home.earthCoords!, zoomScale, width, height),
        )
      }
    }
  }, [allNodesObj, width, height])

  const getNodeFill = (id: number) =>
    selectedNode === id
      ? '#fff'
      : discoveredNodes.includes(id)
      ? '#ff0000'
      : '#999'

  const onClickNode = (id: number) => {
    console.log(allNodesObj[id])
    if (id === selectedNode) {
      setSelectedNode(-1)
    } else {
      if (selectedNode === -1) {
        setSelectedNode(id)
      } else {
        setSelectedNode(-1)
        setDiscoveredNodes((n) => [...n, id])
        setConnections((c) => [...c, [selectedNode, id]])
      }
    }
  }

  if (width === 0 && height === 0) return null
  return (
    // @ts-ignore
    <Zoom
      ref={zoomRef}
      className="relative"
      width={width}
      height={height}
      scaleXMin={1}
      scaleXMax={500}
      scaleYMin={1}
      scaleYMax={500}
      transformMatrix={coordsToTransform(0, 0, 1, width, height)}
      wheelDelta={(e) => {
        const f = 1 + -0.01 * e.deltaY
        return { scaleX: f, scaleY: f }
      }}
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

            <g ref={ref} transform={zoom.toString()}>
              <WorldSvg scale={baseScale} translate={baseTranslate} />
            </g>

            <rect
              width={width}
              height={height}
              fill="transparent"
              style={{ zIndex: 9, position: 'relative' }}
              onMouseDown={zoom.dragStart}
              onMouseMove={zoom.dragMove}
              onMouseUp={zoom.dragEnd}
              onMouseLeave={() => {
                if (zoom.isDragging) zoom.dragEnd()
              }}
            />
            <g
              style={{ pointerEvents: zoom.isDragging ? 'none' : 'auto' }}
              transform={zoom.toString()}
            >
              <NetworkGraph
                renderedNodes={renderedNodes}
                connections={connections}
                allNodes={allNodesObj}
                onClickNode={onClickNode}
                getNodeFill={getNodeFill}
              />
            </g>
          </svg>

          <MapControls
            zoom={zoom}
            nodes={allNodesObj}
            width={width}
            height={height}
          />
        </>
      )}
    </Zoom>
  )
}
