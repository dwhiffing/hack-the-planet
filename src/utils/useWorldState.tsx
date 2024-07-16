import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Zoom } from '@vx/zoom'
import {
  homeId,
  zoomScale,
  Node,
  IWorldState,
  Connection,
  baseTickspeed,
  NodeState,
} from '@/constants'
import { getNodes } from '@/utils/getNodes'
import { haversineDistance as getDist } from '@/utils/groupCoordinates'
import { transformToCoords, coordsToTransform } from '@/utils/coords'

export const useWorldState = (width: number, height: number) => {
  const [money, setMoney] = useState<number>(100)
  const [nodes, setNodes] = useState<Node[]>([])
  const [nodeStates, setNodeStates] = useState<Record<number, NodeState>>({
    [homeId]: { isOwned: true, isHome: true },
  })
  const [selectedNodeId, setSelectedNodeId] = useState(-1)
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

  const _nodes = useMemo(
    () =>
      Object.keys(nodeStates)
        .map((id) => ({
          ...allNodesObj[+id],
          ...nodeStates[+id],
          isSelected: selectedNodeId === +id,
        }))
        .filter(Boolean),
    [nodeStates, selectedNodeId, allNodesObj],
  )

  const updateConnection = (
    source: number,
    target: number,
    change: Partial<Connection>,
  ) =>
    setConnections((c) =>
      c.map((c) => {
        if (c.source === source && c.target === target)
          return { ...c, ...change }
        return c
      }),
    )
  const addConnections = (target: number, nodeIds: number[]) =>
    setConnections((c) => [
      ...c,
      ...nodeIds.map((source) => ({ source, target, type: 'scanned' })),
    ])
  const updateNodes = (ids: number[], changes: Partial<NodeState>) =>
    setNodeStates((_nodeState) =>
      ids.reduce(
        (state, id) => ({
          ...state,
          [id]: { ...state[id], ...changes },
        }),
        { ..._nodeState },
      ),
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
      console.log('clicked', allNodesObj[id])

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
      const scanned = nodes
        .filter((n) => !nodeStates[n.id] && getDist(node, n) < discoveryRange)
        .map((n) => n.id)

      updateNodes(scanned, { isScanned: true })

      addConnections(id, scanned)
    },
    [allNodesObj, nodes, nodeStates],
  )

  const onHack = useCallback(
    (id: number) => {
      const node = allNodesObj[id]!

      // find the closest owned node and connect it
      const closest = _nodes
        .filter((n) => n.isOwned)
        .sort((a, b) => getDist(node, a) - getDist(node, b))[0]

      updateNodes([id], { isOwned: true })
      updateConnection(id, closest.id, { type: 'hacked' })
    },
    [allNodesObj, _nodes],
  )

  const actions = useMemo(() => {
    const node = _nodes.find((n) => n.id === selectedNodeId)
    return [
      node &&
        node.isOwned && {
          label: 'scan',
          onClick: () => onScan(selectedNodeId),
        },
      node &&
        !node?.isOwned && {
          label: 'hack',
          onClick: () => onHack(selectedNodeId),
        },
    ].filter(Boolean)
  }, [onHack, onScan, _nodes, selectedNodeId])

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
