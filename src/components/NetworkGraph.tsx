import React, { memo } from 'react'
import { Group } from '@visx/group'
import { IWorldState, FullNode } from '@/constants'

export const NetworkGraph = memo(
  function NetworkGraph({ worldState }: { worldState: IWorldState }) {
    const { renderedNodes, onClickNode } = worldState

    const links = renderedNodes
      .filter((node) => node.target)
      .map((node) => ({
        source: node,
        target: renderedNodes.find((n) => n.id === node.target)!,
      }))

    return (
      <>
        {links.map((link, i) => (
          <DefaultLink key={i} link={link} tickspeed={worldState.tickspeed} />
        ))}
        {renderedNodes.map((node, i) => (
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
      _p.renderedNodes === _n.renderedNodes && _p.onClickNode === _n.onClickNode
    )
  },
)

const baseLineWidth = 0.01
const DefaultLink = ({
  link: { source, target },
  tickspeed,
}: {
  link: { source: FullNode; target: FullNode }
  tickspeed: number
}) => {
  const isTransfering = !!source.isOwned && !!source?.outgoingMoney
  const isScanned = !source.isOwned
  const lineWidth = isScanned ? baseLineWidth : baseLineWidth * 8
  const strokeWidth = isScanned ? 0.01 : 0.02
  const lineSpacing = isScanned ? 0.1 : 0.05
  const strokeColor = isTransfering ? 'red' : isScanned ? '#ccc' : 'white'
  return (
    <line
      style={{ pointerEvents: 'none' }}
      x1={source.x}
      y1={source.y}
      x2={target.x}
      y2={target.y}
      strokeWidth={strokeWidth}
      stroke={strokeColor}
      strokeDasharray={`${lineWidth} ${lineSpacing}`}
    >
      {!!source.isOwned && !!source?.outgoingMoney && (
        <animate
          attributeName="stroke-dashoffset"
          values={`${(lineWidth + lineSpacing) * 2};0`}
          dur={`${tickspeed}ms`}
          repeatCount="indefinite"
        />
      )}
    </line>
  )
}
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
