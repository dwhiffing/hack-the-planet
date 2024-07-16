import React, { memo } from 'react'
import { Graph } from '@visx/network'
import { Node, IWorldState, Point, NodeState } from '@/constants'

export const NetworkGraph = memo(
  function NetworkGraph({ worldState }: { worldState: IWorldState }) {
    const { renderedNodes, connections, allNodesObj, onClickNode } = worldState
    return (
      <Graph
        graph={{
          nodes: renderedNodes,
          links: connections.map(({ source, target, type }) => ({
            source: allNodesObj[source],
            target: allNodesObj[target],
            type,
          })),
        }}
        linkComponent={(props) => (
          <DefaultLink link={props.link} tickspeed={worldState.tickspeed} />
        )}
        nodeComponent={(props) => (
          <DefaultNode
            node={props.node}
            onClick={() => onClickNode(props.node.id)}
          />
        )}
      />
    )
  },
  (prevProps, nextProps) => {
    const _p = prevProps.worldState
    const _n = nextProps.worldState
    return (
      _p.renderedNodes === _n.renderedNodes &&
      _p.connections === _n.connections &&
      _p.allNodesObj === _n.allNodesObj &&
      _p.onClickNode === _n.onClickNode
    )
  },
)

const DefaultLink = ({
  link: { source, target, type },
  tickspeed,
}: {
  link: { source: Point; target: Point; type: string }
  tickspeed: number
}) => (
  <>
    <line
      style={{ pointerEvents: 'none' }}
      x1={source.x}
      y1={source.y}
      x2={target.x}
      y2={target.y}
      strokeWidth={type === 'scanned' ? 0.01 : 0.05}
      stroke={type === 'scanned' ? '#ccc' : 'white'}
      strokeDasharray={type === 'scanned' ? '.04' : undefined}
    />

    {type === 'hacked' && (
      <circle cx={source.x} cy={source.y} r={0.04} fill="blue">
        <animate
          attributeName="cx"
          begin="0s"
          dur={`${tickspeed}ms`}
          from={source.x}
          to={target.x}
          repeatCount="indefinite"
        />
        <animate
          attributeName="cy"
          begin="0s"
          dur={`${tickspeed}ms`}
          from={source.y}
          to={target.y}
          repeatCount="indefinite"
        />
      </circle>
    )}
  </>
)

const DefaultNode = (props: {
  node: Node & NodeState
  onClick: () => void
}) => {
  const fill = props.node.isHome
    ? '#f0f'
    : props.node.isOwned
    ? '#ff0000'
    : '#999'
  const s = props.node.isSelected ? 0.3 : 0.2
  return (
    <rect
      x={s * -0.5}
      y={s * -0.5}
      onMouseDown={props.onClick}
      width={s}
      height={s}
      fill={fill}
    >
      {props.node.isSelected && (
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          from="0"
          to="360"
          dur="1s"
          repeatCount="indefinite"
        />
      )}
    </rect>
  )
}
