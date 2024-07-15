import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Zoom } from '@vx/zoom'
import { homeId, zoomScale } from '@/constants'
import { getNodes, Node } from '@/utils/getNodes'
import { haversineDistance } from '@/utils/groupCoordinates'
import { transformToCoords, coordsToTransform } from '@/utils/coords'

export const useWorldState = (width: number, height: number) => {
  const [nodes, setNodes] = useState<Node[]>([])
  const [selectedNode, setSelectedNode] = useState(-1)
  const [discoveredNodes, setDiscoveredNodes] = useState([homeId])
  const [connections, setConnections] = useState<[number, number][]>([])

  const zoomRef = useRef<Zoom | null>(null)
  const worldSvgMountCallback = useCallback(
    (node: SVGGElement) => setNodes(getNodes(node)),
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
      const matrix = zoomRef.current!.state.transformMatrix
      const [x, y] = transformToCoords(matrix, width, height)
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

  return {
    zoomRef,
    worldSvgMountCallback,
    renderedNodes,
    connections,
    allNodesObj,
    onClickNode,
    getNodeFill,
  }
}
const discoveryRange = 100
