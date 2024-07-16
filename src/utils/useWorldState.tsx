import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Zoom } from '@vx/zoom'
import {
  homeId,
  zoomScale,
  Node,
  IWorldState,
  Connection,
  baseTickspeed,
  PublicNodeState,
  PrivateNodeState,
} from '@/constants'
import { getNodes } from '@/utils/getNodes'
import { haversineDistance as getDist } from '@/utils/groupCoordinates'
import { transformToCoords, coordsToTransform } from '@/utils/coords'

const initialNodeState = { money: 10 }

export const useWorldState = (width: number, height: number) => {
  const [nodes, setNodes] = useState<Node[]>([])
  const [publicStates, setPublicStates] = useState<
    Record<number, PublicNodeState>
  >({
    [homeId]: { isOwned: true, isHome: true },
  })
  const [privateStates, setPrivateStates] = useState<
    Record<number, PrivateNodeState>
  >({
    [homeId]: { ...initialNodeState },
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

  const renderedNodes = useMemo(
    () =>
      Object.keys(publicStates)
        .map((id) => ({
          ...allNodesObj[+id],
          ...publicStates[+id],
          isSelected: selectedNodeId === +id,
        }))
        .filter(Boolean),
    [publicStates, selectedNodeId, allNodesObj],
  )

  const statefulNodes = useMemo(
    () =>
      Object.keys(publicStates)
        .map((id) => ({
          ...allNodesObj[+id],
          ...publicStates[+id],
          ...privateStates[+id],
          isSelected: selectedNodeId === +id,
        }))
        .filter(Boolean),
    [publicStates, selectedNodeId, privateStates, allNodesObj],
  )

  const updateConnection = useCallback(
    (source: number, target: number, change: Partial<Connection>) =>
      setConnections((c) =>
        c.map((c) => {
          if (c.source === source && c.target === target)
            return { ...c, ...change }
          return c
        }),
      ),
    [setConnections],
  )
  const addConnections = useCallback(
    (target: number, ids: number[]) => {
      setConnections((c) => [
        ...c,
        ...ids.map((source) => ({ source, target, type: 'scanned' })),
      ])
    },
    [setConnections],
  )
  const updateNodes = useCallback(
    (ids: number[], changes: Partial<PublicNodeState>) =>
      setPublicStates((_state) =>
        ids.reduce(
          (state, id) => ({
            ...state,
            [id]: { ...initialNodeState, ...state[id], ...changes },
          }),
          { ..._state },
        ),
      ),
    [setPublicStates],
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
      const scannedIds = nodes
        .filter((n) => !publicStates[n.id] && getDist(node, n) < discoveryRange)
        .map((n) => n.id)

      updateNodes(scannedIds, { isScanned: true, target: id })
      addConnections(id, scannedIds)
    },
    [allNodesObj, nodes, publicStates, addConnections, updateNodes],
  )

  const onHack = useCallback(
    (id: number) => {
      const node = statefulNodes.find((n) => n.id === id)
      if (node?.target) {
        updateNodes([id], { isOwned: true })
        updateConnection(id, node.target, { type: 'hacked' })
      }
    },
    [statefulNodes, updateConnection, updateNodes],
  )

  const actions = useMemo(() => {
    const node = statefulNodes.find((n) => n.id === selectedNodeId)
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
  }, [onHack, onScan, statefulNodes, selectedNodeId])

  const tickspeed = baseTickspeed

  const selectedNode = useMemo(
    () => statefulNodes.find((n) => n.isSelected),
    [statefulNodes],
  )
  const homeNode = useMemo(
    () => statefulNodes.find((n) => n.id === homeId),
    [statefulNodes],
  )
  const money = useMemo(() => homeNode?.money ?? 0, [homeNode])

  useEffect(() => {
    const intervalId = setInterval(() => {
      setPrivateStates((state) => ({
        ...state,
        [homeId]: { ...state[homeId], money: (state[homeId]?.money ?? 0) + 1 },
      }))
      // setMoney((m) => m + connections.filter((c) => c.type === 'hacked').length)
    }, tickspeed)

    return () => clearInterval(intervalId)
  }, [tickspeed, connections, updateNodes])

  const onDeselect = useCallback(() => {
    setSelectedNodeId(-1)
  }, [])

  return {
    money,
    actions,
    zoomRef,
    worldSvgMountCallback,
    statefulNodes: statefulNodes,
    renderedNodes,
    onDeselect,
    selectedNode,
    connections,
    allNodesObj,
    onClickNode,
    tickspeed,
  } as IWorldState
}
const discoveryRange = 25
