import React from 'react'

import { useNodeState } from '@/utils/hooks/useNodeState'

const baseLineWidth = 0.01
export const Link = ({
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
      {(source.hackDuration ?? 0) > 0 && (
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
