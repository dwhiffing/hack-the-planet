import React, { memo } from 'react'

import { Group } from '@visx/group'
import { Node } from '@/components/Node'
import { Link } from '@/components/Link'
import { store } from '@/utils/valtioState'
import { useSnapshot } from 'valtio'
import cities from '@/constants/cities-pruned.json'
import { getGroupFromLatLng, projection } from '@/utils/geo'

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
      {groupKeys.map((groupKey) => (
        <NodeGroup
          isCities
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
  isCities,
}: {
  groupKey: string
  tickspeed: number
  zoomLevel: number
  selectedNodeId?: number
  isLinks?: boolean
  isCities?: boolean
}) {
  const { groupedNodes } = useSnapshot(store)
  const nodeIds = groupedNodes[groupKey]?.nodes.map((n) => n.id) ?? []
  return (
    <Group>
      {isCities
        ? cities
            .filter(
              (city) =>
                groupKey ===
                getGroupFromLatLng(city.earthCoords![1], city.earthCoords![0]),
            )
            .map((city, i) => {
              const coords = projection(city.earthCoords as [number, number])!
              return (
                <Group left={coords[0]} top={coords[1]}>
                  <circle key={i} r={0.2} fill="white" />
                  {zoomLevel <= 2 && (
                    <text
                      fontSize={0.5}
                      y={-0.6}
                      className="fill-white"
                      textAnchor="middle"
                      dominantBaseline="central"
                      alignmentBaseline="central"
                      textRendering="optimizeSpeed"
                    >
                      {city.name}
                    </text>
                  )}
                </Group>
              )
            })
        : isLinks
          ? zoomLevel < 3 &&
            nodeIds.map((nodeId) => (
              <Link
                key={nodeId}
                nodeId={nodeId}
                tickspeed={tickspeed}
                zoomLevel={zoomLevel}
              />
            ))
          : nodeIds.map((nodeId) => (
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
