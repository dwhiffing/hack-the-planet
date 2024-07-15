import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Zoom } from '@vx/zoom'
import { homeId, zoomScale } from '@/constants'
import { getNodes, Node } from '@/utils/getNodes'
import { haversineDistance } from '@/utils/groupCoordinates'
import { transformToCoords, coordsToTransform } from '@/utils/coords'

export type IWorldState = {
  money: number
  actions: { label: string; onClick: () => void }[]
  setMoney: Dispatch<SetStateAction<number>>
  zoomRef: MutableRefObject<Zoom | null>
  worldSvgMountCallback: (node: SVGGElement) => void
  renderedNodes: Node[]
  connections: { source: number; target: number; type: 'scanned' | 'hacked' }[]
  allNodesObj: Record<number, Node>
  onClickNode: (id: number) => void
  getNodeFill: (id: number) => string
}

export const useWorldState = (width: number, height: number) => {
  const [money, setMoney] = useState<number>(100)
  const [nodes, setNodes] = useState<Node[]>([])
  const [selectedNode, setSelectedNode] = useState(-1)
  const [ownedNodes, setOwnedNodes] = useState([homeId])
  const [discoveredNodes, setDiscoveredNodes] = useState([homeId])
  const [connections, setConnections] = useState<
    { source: number; target: number }[]
  >([])

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
    () => discoveredNodes.map((id) => allNodesObj[id]).filter(Boolean),
    [discoveredNodes, allNodesObj],
  )

  const owned = useMemo(
    () => ownedNodes.map((id) => allNodesObj[id]).filter(Boolean),
    [ownedNodes, allNodesObj],
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
    selectedNode === id ? '#fff' : ownedNodes.includes(id) ? '#ff0000' : '#999'

  const onClickNode = (id: number) => {
    console.log(allNodesObj[id])

    // if there's no selected node, select the clicked node
    if (selectedNode === -1) return setSelectedNode(id)

    // if we click the currently selected node, deselect it
    if (id === selectedNode) return setSelectedNode(-1)

    // otherwise, deselect the current node
    setSelectedNode(id)
  }

  const onScan = (id: number) => {
    const node = allNodesObj[id]!
    const scannedNodes = nodes.filter((n) => {
      if (discoveredNodes.includes(n.id) || ownedNodes.includes(n.id))
        return false

      return haversineDistance(node, n) < discoveryRange
    })

    setDiscoveredNodes((n) => [...n, ...scannedNodes.map((n) => n.id)])
    setConnections((c) => [
      ...c,
      ...scannedNodes.map((n) => ({
        source: n.id,
        target: id,
        type: 'scanned',
      })),
    ])
  }

  const onHack = (id: number) => {
    const node = allNodesObj[id]!

    // find the closest owned node and connect it
    const closest = owned.sort(
      (a, b) => haversineDistance(node, a) - haversineDistance(node, b),
    )[0]

    setOwnedNodes((n) => [...n, id])
    setConnections((c) =>
      c.map((c) => {
        if (c.source === id && c.target === closest.id)
          return { ...c, type: 'hacked' }
        return c
      }),
    )
  }

  const actions = [
    {
      label: 'test',
      onClick: () => {
        setMoney((m) => m + 1)
      },
    },
    selectedNode !== -1 &&
      ownedNodes.includes(selectedNode) && {
        label: 'scan',
        onClick: () => onScan(selectedNode),
      },
    selectedNode !== -1 &&
      !ownedNodes.includes(selectedNode) && {
        label: 'hack',
        onClick: () => onHack(selectedNode),
      },
  ].filter(Boolean)

  return {
    money,
    setMoney,
    actions,
    zoomRef,
    worldSvgMountCallback,
    renderedNodes,
    connections,
    allNodesObj,
    onClickNode,
    getNodeFill,
  } as IWorldState
}
const discoveryRange = 25
