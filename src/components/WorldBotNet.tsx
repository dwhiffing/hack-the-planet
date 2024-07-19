import React, { memo } from 'react'

import { Node } from './Node'
import { Link } from './Link'

export const BotNet = memo(function NetworkGraph({
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
        <Link key={nodeId} nodeId={nodeId} tickspeed={tickspeed} />
      ))}
      {nodeIds.map((nodeId) => (
        <Node
          key={nodeId}
          nodeId={nodeId}
          onClick={onClickNode}
          tickspeed={tickspeed}
        />
      ))}
    </>
  )
})
