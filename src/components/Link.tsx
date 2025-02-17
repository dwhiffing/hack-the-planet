import React from 'react'

import { useSnapshot } from 'valtio'
import { store } from '@/utils/valtioState'

const baseSpacing = 0.01
export const Link = ({
  nodeId,
  tickspeed,
}: {
  nodeId: number
  tickspeed: number
}) => {
  const { [nodeId]: source } = useSnapshot(store.nodes)
  const { [source?.target ?? -1]: target } = useSnapshot(store.nodes)
  if (!source || !target) return null
  const isTransfering = source.stealDuration ?? 0
  const notOwned = !source.isOwned
  const spacing = notOwned ? baseSpacing : baseSpacing * 8
  const strokeWidth = notOwned ? 0.01 : 0.02
  const strokeColor = isTransfering ? 'red' : notOwned ? '#ccc' : 'white'
  return (
    <line
      x1={source.x}
      y1={source.y}
      x2={target.x}
      y2={target.y}
      strokeWidth={strokeWidth}
      stroke={strokeColor}
      className="link pointer-events-none transition-colors duration-500"
      strokeDasharray={`${spacing} ${spacing}`}
    >
      {(source.hackDuration ?? 0) > 0 && (
        <animate
          attributeName="stroke-dashoffset"
          values={`${(spacing + spacing) * -8};0`}
          dur={`${tickspeed}ms`}
          repeatCount="indefinite"
        />
      )}
    </line>
  )
}
