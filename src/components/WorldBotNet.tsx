import React, { memo } from 'react'

import { Group } from '@visx/group'
import { Node } from './Node'
import { Link } from './Link'
import { cache } from '@/pages'
import { Group as IGroup } from '@/utils/getNodesWithDistance'
import { useSelectedNodeId } from '@/utils/hooks/useNodeState'

export const BotNet = memo(function NetworkGraph({
  groupKeysString,
  onClickNode,
  tickspeed,
  zoomLevel,
}: {
  groupKeysString: string
  onClickNode: (n: number) => void
  tickspeed: number
  zoomLevel: number
}) {
  const { selectedNodeId } = useSelectedNodeId()
  const groupKeys = groupKeysString.split(':') as string[]
  return (
    <>
      {groupKeys.map((groupKey) => (
        <NodeGroup
          isLinks
          key={groupKey}
          groupKey={groupKey}
          onClickNode={onClickNode}
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
          onClickNode={onClickNode}
          tickspeed={tickspeed}
          zoomLevel={zoomLevel}
        />
      ))}
    </>
  )
})

export const NodeGroup = memo(function NodeGroup({
  groupKey,
  onClickNode,
  tickspeed,
  zoomLevel,
  selectedNodeId,
  isLinks,
}: {
  groupKey: string
  onClickNode: (n: number) => void
  tickspeed: number
  zoomLevel: number
  selectedNodeId?: number
  isLinks: boolean
}) {
  const groupedNodes = cache.get('grouped-node-data').data as Record<
    string,
    IGroup
  >
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
            onClick={onClickNode}
            tickspeed={tickspeed}
          />
        ))}
    </Group>
  )
})
