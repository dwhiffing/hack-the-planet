import React, { memo } from 'react'

import { Group } from '@visx/group'
import { Node } from '@/components/Node'
import { Link } from '@/components/Link'
import { store } from '@/utils/valtioState'
import { useSnapshot } from 'valtio'

export const BotNet = memo(function NetworkGraph({
  groupKeysString,
  tickspeed,
  zoomLevel,
}: {
  groupKeysString: string
  tickspeed: number
  zoomLevel: number
}) {
  const { selectedNodeId } = useSnapshot(store)
  const groupKeys = groupKeysString.split(':') as string[]
  return (
    <>
      {groupKeys.map((groupKey) => (
        <NodeGroup
          isLinks
          key={groupKey}
          groupKey={groupKey}
          tickspeed={tickspeed}
          zoomLevel={zoomLevel}
        />
      ))}
      {groupKeys.map((groupKey) => (
        <NodeGroup
          isLinks={false}
          key={groupKey}
          groupKey={groupKey}
          selectedNodeId={selectedNodeId}
          tickspeed={tickspeed}
          zoomLevel={zoomLevel}
        />
      ))}
    </>
  )
})

export const NodeGroup = memo(function NodeGroup({
  groupKey,
  tickspeed,
  zoomLevel,
  selectedNodeId,
  isLinks,
}: {
  groupKey: string
  tickspeed: number
  zoomLevel: number
  selectedNodeId?: number
  isLinks: boolean
}) {
  const { groupedNodes } = useSnapshot(store)
  const nodeIds = groupedNodes[groupKey]?.nodes.map((n) => n.id) ?? []
  return (
    <Group>
      {isLinks &&
        zoomLevel < 3 &&
        nodeIds.map((nodeId) => (
          <Link
            key={nodeId}
            nodeId={nodeId}
            tickspeed={tickspeed}
            zoomLevel={zoomLevel}
          />
        ))}
      {!isLinks &&
        nodeIds.map((nodeId) => (
          <Node
            key={nodeId}
            isSelected={selectedNodeId === nodeId}
            nodeId={nodeId}
            tickspeed={tickspeed}
          />
        ))}
    </Group>
  )
})
