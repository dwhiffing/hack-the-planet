import React, { memo } from 'react'

import { Group } from '@visx/group'
import { Node } from '@/components/Node'
import { store } from '@/utils/valtioState'
import { useSnapshot } from 'valtio'
import cities from '@/constants/cities-pruned.json'
import { projection } from '@/utils/geo'
import { Link } from './Link'

export const BotNet = memo(function BotNet() {
  const { selectedNodeId, nodes } = useSnapshot(store)
  const nodeIds = Object.values(nodes).map((n) => n.id) ?? []

  return (
    <Group>
      <CityLabels />
      <Links />

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

const Links = memo(function Links() {
  const { nodes } = useSnapshot(store)
  const nodeIds = Object.values(nodes).map((n) => n.id) ?? []
  return nodeIds.map((nodeId) => (
    <Link key={`${nodeId}-link`} nodeId={nodeId} />
  ))
})

const CityLabels = memo(function CityLabels() {
  return (
    <>
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
    </>
  )
})

const projectedCities = cities.map((c) => ({
  ...c,
  coords: projection(c.earthCoords as [number, number])!,
}))
