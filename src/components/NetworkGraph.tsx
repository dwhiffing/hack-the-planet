import React, { memo } from 'react'
import { Group } from '@visx/group'
import { IWorldState, FullNode } from '@/constants'

export const NetworkGraph = memo(
  function NetworkGraph({ worldState }: { worldState: IWorldState }) {
    const { renderedNodes, connections, onClickNode } = worldState

    const graph = {
      nodes: renderedNodes,
      links: connections.map(({ source, target, type }) => ({
        source: renderedNodes.find((n) => n.id === source)!,
        target: renderedNodes.find((n) => n.id === target)!,
        type,
      })),
    }

    return (
      <>
        {graph.links.map((link, i) => (
          <DefaultLink
            key={i}
            link={link}
            tickspeed={worldState.tickspeed}
          />
        ))}
        {graph.nodes.map((node, i) => (
          <Group key={i} left={node.x} top={node.y}>
            <DefaultNode node={node} onClick={() => onClickNode(node.id)} />
          </Group>
        ))}
      </>
    )
  },
  (prevProps, nextProps) => {
    const _p = prevProps.worldState
    const _n = nextProps.worldState
    return (
      _p.renderedNodes === _n.renderedNodes &&
      _p.connections === _n.connections &&
      _p.onClickNode === _n.onClickNode
    )
  },
)

const DefaultLink = ({
  link: { source, target, type },
  tickspeed,
}: {
  link: { source: FullNode; target: FullNode; type: string }
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

const DefaultNode = (props: { node: FullNode; onClick: () => void }) => {
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
