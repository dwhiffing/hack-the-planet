import React, { memo, useMemo } from 'react'

import { Group } from '@visx/group'
import { Node } from '@/components/Node'
import { store } from '@/utils/valtioState'
import { useSnapshot } from 'valtio'
import cities from '@/constants/cities-pruned.json'
import { getGroupFromLatLng, mergeCoordinates, projection } from '@/utils/geo'
import { groupBy } from 'lodash'
import { Link } from './Link'

export const BotNet = memo(function NetworkGraph({
  groupKeysString,
  tickspeed,
}: {
  groupKeysString: string
  tickspeed: number
}) {
  const groupKeys = groupKeysString.split(':') as string[]

  return groupKeys.map((groupKey) => (
    <NodeGroup key={groupKey} groupKey={groupKey} tickspeed={tickspeed} />
  ))
})

export const Collapsed = memo(function NetworkGraph({
  tickspeed,
}: {
  tickspeed: number
}) {
  const { selectedNodeId } = useSnapshot(store)
  const coords = useMemo(
    () => mergeCoordinates(Object.values(store.nodes), 1.8),
    [Object.values(store.nodes).length],
  )
  return coords.map((n) => (
    <Node
      key={n.id}
      nodeId={n.id}
      tickspeed={tickspeed}
      isSelected={selectedNodeId === n.id}
    />
  ))
})

const groupedCities = groupBy(
  cities.map((c) => ({
    ...c,
    coords: projection(c.earthCoords as [number, number])!,
  })),
  (c) => getGroupFromLatLng(c.earthCoords![1], c.earthCoords![0]),
)

export const NodeGroup = memo(function NodeGroup({
  groupKey,
  tickspeed,
}: {
  groupKey: string
  tickspeed: number
}) {
  const { groupedNodes, selectedNodeId } = useSnapshot(store)
  const nodeIds = groupedNodes[groupKey]?.nodes.map((n) => n.id) ?? []

  return (
    <>
      {groupedCities[groupKey]?.map((city, i) => (
        <Group
          key={`city-${i}`}
          className="pointer-events-none"
          left={city.coords[0]}
          top={city.coords[1]}
        >
          <circle r={0.2} fill="white" />
          <text
            fontSize={0.5}
            y={-0.6}
            className="select-none fill-white"
            textAnchor="middle"
            dominantBaseline="central"
            alignmentBaseline="central"
            textRendering="optimizeSpeed"
          >
            {city.name}
          </text>
        </Group>
      ))}
      {nodeIds.map((nodeId) => (
        <Link key={`${nodeId}-link`} nodeId={nodeId} tickspeed={tickspeed} />
      ))}
      {nodeIds.map((nodeId) => (
        <Node
          key={`${nodeId}-node`}
          nodeId={nodeId}
          tickspeed={tickspeed}
          isSelected={selectedNodeId === nodeId}
        />
      ))}
    </>
  )
})
