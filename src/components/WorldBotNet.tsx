import React, { memo, useMemo } from 'react'

import { Node } from '@/components/Node'
import { store } from '@/utils/valtioState'
import { useSnapshot } from 'valtio'
import cities from '@/constants/cities-pruned.json'
import { projection } from '@/utils/geo'
import { Link } from './Link'

export const BotNet = memo(function BotNet() {
  const { isDragging } = useSnapshot(store)

  return (
    <g style={{ pointerEvents: isDragging ? 'none' : 'auto' }}>
      <Links />
      <Nodes />
      <CityLabels />
    </g>
  )
})

const Nodes = memo(function Nodes() {
  const { nodes, selectedNodeId } = useSnapshot(store)
  const nodeIds = useMemo(
    () => Object.values(nodes).map((n) => n.id) ?? [],
    [nodes],
  )
  return nodeIds.map((nodeId) => (
    <Node
      key={`${nodeId}-node`}
      nodeId={nodeId}
      isSelected={selectedNodeId === nodeId}
    />
  ))
})

const Links = memo(function Links() {
  const { nodes } = useSnapshot(store)
  const nodeIds = useMemo(
    () => Object.values(nodes).map((n) => n.id) ?? [],
    [nodes],
  )
  return nodeIds.map((nodeId) => (
    <Link key={`${nodeId}-link`} nodeId={nodeId} />
  ))
})

const CityLabels = memo(function CityLabels() {
  return projectedCities.map((city, i) => {
    const [x, y] = city.coords
    return (
      <>
        <circle cx={x} cy={y} r={0.2} fill="white" />
        <text
          fontSize={0.5}
          x={x}
          y={y - 0.6}
          className="select-none fill-white"
          textAnchor="middle"
          dominantBaseline="central"
          alignmentBaseline="central"
          textRendering="optimizeSpeed"
        >
          {city.name}
        </text>
      </>
    )
  })
})

const projectedCities = cities.map((c) => ({
  ...c,
  coords: projection(c.earthCoords as [number, number])!,
}))
