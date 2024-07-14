import React, { memo } from 'react'
import { Graph } from '@visx/network'
import { Node } from '@/utils/getNodes'

export const NetworkGraph = memo(function NetworkGraph({
  renderedNodes,
  connections,
  allNodesObj,
  onClickNode,
  getNodeFill,
}: {
  renderedNodes: Node[]
  connections: [number, number][]
  allNodesObj: Record<number, Node>
  onClickNode: (id: number) => void
  getNodeFill: (id: number) => string
}) {
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
