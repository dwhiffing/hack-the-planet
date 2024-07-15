import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Zoom } from '@vx/zoom'
import {
  homeId,
  zoomScale,
  Node,
  IWorldState,
  Connection,
  baseTickspeed,
} from '@/constants'
import { getNodes } from '@/utils/getNodes'
import { haversineDistance } from '@/utils/groupCoordinates'
import { transformToCoords, coordsToTransform } from '@/utils/coords'

export const useWorldState = (width: number, height: number) => {
  const [money, setMoney] = useState<number>(100)
  const [nodes, setNodes] = useState<Node[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState(-1)
  const [ownedNodeIds, setOwnedNodeIds] = useState([homeId])
  const [scannedNodeIds, setScannedNodeIds] = useState([homeId])
  const [connections, setConnections] = useState<Connection[]>([])

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
    () => scannedNodeIds.map((id) => allNodesObj[id]).filter(Boolean),
    [scannedNodeIds, allNodesObj],
  )

  const owned = useMemo(
    () => ownedNodeIds.map((id) => allNodesObj[id]).filter(Boolean),
    [ownedNodeIds, allNodesObj],
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

  const onClickNode = useCallback(
    (id: number) => {
      console.log(allNodesObj[id])

      // if there's no selected node, select the clicked node
      if (selectedNodeId === -1) return setSelectedNodeId(id)

      // if we click the currently selected node, deselect it
      if (id === selectedNodeId) return setSelectedNodeId(-1)

      // otherwise, deselect the current node
      setSelectedNodeId(id)
    },
    [allNodesObj, selectedNodeId],
  )

  const onScan = useCallback(
    (id: number) => {
      const node = allNodesObj[id]!
      const scannedNodes = nodes.filter((n) => {
        if (scannedNodeIds.includes(n.id) || ownedNodeIds.includes(n.id))
          return false

        return haversineDistance(node, n) < discoveryRange
      })

      setScannedNodeIds((n) => [...n, ...scannedNodes.map((n) => n.id)])
      setConnections((c) => [
        ...c,
        ...scannedNodes.map((n) => ({
          source: n.id,
          target: id,
          type: 'scanned',
        })),
      ])
    },
    [allNodesObj, nodes, ownedNodeIds, scannedNodeIds],
  )

  const onHack = useCallback(
    (id: number) => {
      const node = allNodesObj[id]!

      // find the closest owned node and connect it
      const closest = owned.sort(
        (a, b) => haversineDistance(node, a) - haversineDistance(node, b),
      )[0]

      setOwnedNodeIds((n) => [...n, id])
      setConnections((c) =>
        c.map((c) => {
          if (c.source === id && c.target === closest.id)
            return { ...c, type: 'hacked' }
          return c
        }),
      )
    },
    [allNodesObj, owned],
  )

  const actions = useMemo(
    () =>
      [
        selectedNodeId !== -1 &&
          ownedNodeIds.includes(selectedNodeId) && {
            label: 'scan',
            onClick: () => onScan(selectedNodeId),
          },
        selectedNodeId !== -1 &&
          !ownedNodeIds.includes(selectedNodeId) && {
            label: 'hack',
            onClick: () => onHack(selectedNodeId),
          },
      ].filter(Boolean),
    [onHack, onScan, ownedNodeIds, selectedNodeId],
  )

  const _nodes = useMemo(
    () =>
      renderedNodes.map((n) => ({
        ...n,
        isHome: homeId === n.id,
        isOwned: ownedNodeIds.includes(n.id),
        isSelected: selectedNodeId === n.id,
      })),
    [renderedNodes, ownedNodeIds, selectedNodeId],
  )

  const selectedNode = useMemo(() => _nodes.find((n) => n.isSelected), [_nodes])

  const tickspeed = baseTickspeed

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMoney((m) => m + connections.filter((c) => c.type === 'hacked').length)
    }, tickspeed)

    return () => clearInterval(intervalId)
  }, [tickspeed, connections])

  const onDeselect = useCallback(() => {
    setSelectedNodeId(-1)
  }, [])

  return {
    money,
    setMoney,
    actions,
    zoomRef,
    worldSvgMountCallback,
    renderedNodes: _nodes,
    onDeselect,
    selectedNode,
    connections,
    allNodesObj,
    onClickNode,
    tickspeed,
  } as IWorldState
}
const discoveryRange = 25
