import React, { memo } from 'react'
import { Group } from '@visx/group'
import { pxPerKM, discoveryRange } from '@/constants'
import { useNodeState, useSelectedNodeId } from '@/utils/useWorldState'

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
        <DefaultNode key={nodeId} nodeId={nodeId} onClick={onClickNode} />
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
const DefaultNode = (props: {
  nodeId: number
  onClick: (nodeId: number) => void
}) => {
  const { selectedNodeId } = useSelectedNodeId()
  const { node } = useNodeState(props.nodeId)

  if (!node) return null

  const fill = node.isHome ? '#f0f' : node.isOwned ? '#ff0000' : '#999'
  const s = selectedNodeId === props.nodeId ? 0.3 : 0.2

  return (
    <Group left={node.x} top={node.y}>
      {node.isScanning && (
        <circle
          className={`pointer-events-none`}
          r={pxPerKM * discoveryRange}
          stroke="red"
          strokeWidth={0.01}
          fill="transparent"
        />
      )}

      <rect
        x={s * -0.5}
        y={s * -0.5}
        onMouseDown={() => props.onClick(props.nodeId)}
        width={s}
        height={s}
        fill={fill}
      >
        {selectedNodeId === props.nodeId && (
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
    </Group>
  )
}
