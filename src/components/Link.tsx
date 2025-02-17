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
  const isTransferring = !!(source.stealDuration ?? 0)
  const notOwned = !source.isOwned
  const spacing = notOwned ? 0.01 : baseSpacing * 8
  const spacing2 = notOwned ? 0.1 : 0.05
  const strokeWidth = notOwned ? 0.01 : 0.02
  const strokeColor = isTransferring ? 'red' : notOwned ? '#ccc' : 'white'
  return (
    <line
      x1={source.x}
      y1={source.y}
      x2={target.x}
      y2={target.y}
      strokeWidth={strokeWidth}
      stroke={strokeColor}
      className={`link pointer-events-none transition-colors duration-500 ${isTransferring ? 'transferring' : ''}`}
      strokeDasharray={`${spacing} ${spacing2}`}
      style={{ animationDuration: `${tickspeed}ms` }}
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
