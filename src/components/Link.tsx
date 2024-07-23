import React from 'react'

import { useSnapshot } from 'valtio'
import { store } from '@/utils/valtioState'

const baseLineWidth = 0.01
export const Link = ({
  nodeId,
  tickspeed,
  zoomLevel,
}: {
  nodeId: number
  tickspeed: number
  zoomLevel: number
}) => {
  const { [nodeId]: source } = useSnapshot(store.nodes)
  const { [source?.target ?? -1]: target } = useSnapshot(store.nodes)
  if (!source || !target) return null
  const isTransfering = !!source.isOwned
  const notOwned = !source.isOwned
  const lineWidth = notOwned ? baseLineWidth : baseLineWidth * 8
  const strokeWidth = notOwned ? 0.01 : 0.02
  const lineSpacing = notOwned ? 0.1 : 0.05
  const strokeColor = isTransfering ? 'red' : notOwned ? '#ccc' : 'white'
  return (
    <line
      x1={source.x}
      y1={source.y}
      x2={target.x}
      y2={target.y}
      strokeWidth={strokeWidth}
      stroke={strokeColor}
      className="pointer-events-none transition-colors duration-500 link"
      strokeDasharray={`${lineWidth} ${lineSpacing}`}
    >
      {zoomLevel <= 1 && (
        <>
          {(source.hackDuration ?? 0) > 0 && (
            <animate
              attributeName="stroke-dashoffset"
              values={`${(lineWidth + lineSpacing) * -8};0`}
              dur={`${tickspeed}ms`}
              repeatCount="indefinite"
            />
          )}
          {!!source.isOwned && (
            <animate
              attributeName="stroke-dashoffset"
              values={`${(lineWidth + lineSpacing) * 2};0`}
              dur={`${tickspeed}ms`}
              repeatCount="indefinite"
            />
          )}
        </>
      )}
    </line>
  )
}
