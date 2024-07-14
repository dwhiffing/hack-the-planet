import React, { memo, useState } from 'react'
import { Graph } from '@visx/network'
import { getNodes, Node } from '@/utils/getNodes'
import { geoMercator } from 'd3-geo'
import { haversineDistance } from '@/utils/groupCoordinates'

export const NetworkGraph = memo(function NetworkGraph({
  scale,
  translate,
  groupRef,
}: {
  groupRef: any
  scale: number
  translate: [number, number]
}) {
  const [selectedNode, setSelectedNode] = useState(-1)
  const [discoveredNodes, setDiscoveredNodes] = useState([9155])
  const [connections, setConnections] = useState<[number, number][]>([])
  const discoveryRange = 100
  const projection = geoMercator().translate(translate).scale(scale)
  const rawNodes = getNodes(projection, groupRef.current)
  const allNodes = rawNodes.map((n) => {
    const coords = projection([n.x, n.y]) ?? []
    return {
      ...n,
      x: coords[0] ?? 0,
      y: coords[1] ?? 0,
    }
  })
  const allNodesObj: Record<number, Node> = allNodes.reduce(
    (obj, n) => ({ ...obj, [n.id]: n }),
    {},
  )

  const renderedNodes = allNodes.filter((n) => {
    if (discoveredNodes.includes(n.id)) return true

    // TODO: try to improve performance of searching for discoverable nodes
    const isDiscoverable = discoveredNodes.some((id) => {
      const node = allNodesObj[id]!
      return haversineDistance(node, n) < discoveryRange
    })

    return isDiscoverable
  })

  const getNodeFill = (id: number) =>
    selectedNode === id
      ? '#fff'
      : discoveredNodes.includes(id)
      ? '#ff0000'
      : '#999'

  const onClickNode = (id: number) => {
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

  return (
    <Graph
      graph={{
        nodes: renderedNodes,
        links: connections.map(([source, target]) => ({
          source: allNodesObj[source],
          target: allNodesObj[target],
        })),
      }}
      linkComponent={(props) => (
        <DefaultLink link={props.link} width={0.05} color={'white'} />
      )}
      nodeComponent={(props) => (
        <DefaultNode
          node={props.node}
          fill={getNodeFill(props.node.id)}
          onClick={() => onClickNode(props.node.id)}
        />
      )}
    />
  )
})

type Point = { x: number; y: number }
const DefaultLink = ({
  link: { source, target },
  width,
  color,
}: {
  link: { source: Point; target: Point }
  width: number
  color: string
}) => (
  <line
    style={{ pointerEvents: 'none' }}
    x1={source.x}
    y1={source.y}
    x2={target.x}
    y2={target.y}
    strokeWidth={width}
    stroke={color}
    strokeOpacity={1}
    // strokeDasharray={true ? '8,4' : undefined}
  />
)

const DefaultNode = (props: {
  node: Node
  fill: string
  onClick: () => void
}) => {
  return (
    <circle
      onMouseDown={props.onClick}
      fill={props.fill ?? 'transparent'}
      r={props.node.r ?? 0.1}
    />
  )
}
