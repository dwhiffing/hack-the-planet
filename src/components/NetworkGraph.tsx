import React, { memo, useRef } from 'react'
import { Group } from '@visx/group'
import { pxPerKM, discoveryRange } from '@/constants'
import { useNodeState, useSelectedNodeId } from '@/utils/useWorldState'
import { CSSTransition } from 'react-transition-group'

export const NetworkGraph = memo(function NetworkGraph({
  nodeIds,
  onClickNode,
  tickspeed,
}: {
  nodeIds: number[]
  onClickNode: (n: number) => void
  tickspeed: number
}) {
  return (
    <>
      {nodeIds.map((nodeId) => (
        <DefaultLink key={nodeId} nodeId={nodeId} tickspeed={tickspeed} />
      ))}
      {nodeIds.map((nodeId) => (
        <DefaultNode
          key={nodeId}
          nodeId={nodeId}
          onClick={onClickNode}
          tickspeed={tickspeed}
        />
      ))}
    </>
  )
})

const baseLineWidth = 0.01
const DefaultLink = ({
  nodeId,
  tickspeed,
}: {
  nodeId: number
  tickspeed: number
}) => {
  const { node: source } = useNodeState(nodeId)
  const { node: target } = useNodeState(source?.target)
  if (!source || !target) return null
  const isTransfering = !!source.isOwned && !!source?.outgoingMoney
  const isScanned = !source.isOwned
  const lineWidth = isScanned ? baseLineWidth : baseLineWidth * 8
  const strokeWidth = isScanned ? 0.01 : 0.02
  const lineSpacing = isScanned ? 0.1 : 0.05
  const strokeColor = isTransfering ? 'red' : isScanned ? '#ccc' : 'white'
  return (
    <line
      x1={source.x}
      y1={source.y}
      x2={target.x}
      y2={target.y}
      strokeWidth={strokeWidth}
      stroke={strokeColor}
      className="pointer-events-none transition-colors duration-500"
      strokeDasharray={`${lineWidth} ${lineSpacing}`}
    >
      {source.hackDuration && (
        <animate
          attributeName="stroke-dashoffset"
          values={`${(lineWidth + lineSpacing) * -8};0`}
          dur={`${tickspeed}ms`}
          repeatCount="indefinite"
        />
      )}
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

const DefaultNode = (props: {
  nodeId: number
  onClick: (nodeId: number) => void
  tickspeed: number
}) => {
  const { selectedNodeId } = useSelectedNodeId()
  const { node } = useNodeState(props.nodeId)
  const nodeRef = useRef(null)

  if (!node) return null

  const fill = node.isHome
    ? '#f0f'
    : node.isOwned
    ? '#ff0000'
    : node.hackDuration
    ? '#ccc'
    : '#999'
  const s = selectedNodeId === props.nodeId ? 0.3 : 0.2
  const size = pxPerKM * discoveryRange
  return (
    <Group left={node.x} top={node.y}>
      <CSSTransition
        nodeRef={nodeRef}
        in={(node.scanDuration ?? 0) > 0}
        timeout={300}
        classNames="fade"
        unmountOnExit
      >
        <path
          ref={nodeRef}
          className={`pointer-events-none`}
          d={describeArc(0, 0, size, 0, 40)}
          fill="#ff000033"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0"
            to="-360"
            dur={`${props.tickspeed}ms`}
            repeatCount="indefinite"
          />
        </path>
      </CSSTransition>

      <circle
        x={s * -0.5}
        y={s * -0.5}
        onMouseDown={() => props.onClick(props.nodeId)}
        r={s / 2}
        stroke="#fff"
        style={{
          transition:
            'all 150ms cubic-bezier(0.4, 0, 0.2, 1), fill 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        strokeWidth={selectedNodeId === props.nodeId ? 0.01 : 0}
        fill={fill}
      />
    </Group>
  )
}

const describeArc = (
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) => {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  const d = [
    'M',
    x,
    y,
    'L',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    'Z',
  ].join(' ')

  return d
}

const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}
