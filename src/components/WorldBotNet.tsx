import React, { memo, useMemo } from 'react'

import { Group } from '@visx/group'
import { Node } from '@/components/Node'
import { store } from '@/utils/valtioState'
import { useSnapshot } from 'valtio'
import cities from '@/constants/cities-pruned.json'
import { getGroupFromLatLng, mergeCoordinates, projection } from '@/utils/geo'
import { groupBy } from 'lodash'
import { Link } from './Link'

export const BotNet = memo(function BotNet() {
  const { selectedNodeId, nodes } = useSnapshot(store)
  const nodeIds = Object.values(nodes).map((n) => n.id) ?? []

  return (
    <Group>
      {projectedCities.map((city, i) => (
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
        <Link key={`${nodeId}-link`} nodeId={nodeId} />
      ))}
      {nodeIds.map((nodeId) => (
        <Node
          key={`${nodeId}-node`}
          nodeId={nodeId}
          isSelected={selectedNodeId === nodeId}
        />
      ))}
    </Group>
  )
})

export const CollapsedBotNet = memo(function NetworkGraph(props: {
  isVisible: boolean
}) {
  const coords = useMemo(
    () => mergeCoordinates(Object.values(store.nodes), 6),
    [Object.values(store.nodes).length],
  )
  return coords.map((n) => (
    <Group
      className="node pointer-events-none"
      left={n.x}
      top={n.y}
      style={{ visibility: props.isVisible ? 'visible' : 'hidden' }}
    >
      <circle
        r={n.r}
        // onMouseDown={onClickNode}
        fill={'#999'}
        className="node-circle"
      />
      {/* <text
        fontSize={0.5}
        y={-0.6}
        className="select-none fill-white"
        textAnchor="middle"
        dominantBaseline="central"
        alignmentBaseline="central"
        textRendering="optimizeSpeed"
      >
        {n.count}
      </text> */}
    </Group>
  ))
})

export const GroupedBotNet = memo(function BotNet({
  groupKeysString,
  allGroupKeys,
  isVisible,
}: {
  groupKeysString: string
  allGroupKeys: string
  isVisible: boolean
}) {
  const groupKeys = groupKeysString.split(':') as string[]
  console.log('render', groupKeysString)

  return (
    <g style={{ visibility: isVisible ? 'visible' : 'hidden' }}>
      {allGroupKeys.split(':').map((groupKey) => (
        <NodeGroup
          key={groupKey}
          groupKey={groupKey}
          isVisible={groupKeys.includes(groupKey)}
        />
      ))}
    </g>
  )
})

const projectedCities = cities.map((c) => ({
  ...c,
  coords: projection(c.earthCoords as [number, number])!,
}))

const groupedCities = groupBy(projectedCities, (c) =>
  getGroupFromLatLng(c.earthCoords![1], c.earthCoords![0]),
)

const NodeGroup = memo(function NodeGroup({
  groupKey,
  isVisible,
}: {
  isVisible: boolean
  groupKey: string
}) {
  const { groupedNodes, selectedNodeId } = useSnapshot(store)
  const nodeIds = groupedNodes[groupKey]?.nodes.map((n) => n.id) ?? []

  if (!isVisible) return null

  return (
    <Group>
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
        <Link key={`${nodeId}-link`} nodeId={nodeId} />
      ))}
      {nodeIds.map((nodeId) => (
        <Node
          key={`${nodeId}-node`}
          nodeId={nodeId}
          isSelected={selectedNodeId === nodeId}
        />
      ))}
    </Group>
  )
})
