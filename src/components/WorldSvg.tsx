import React, { memo } from 'react'
import { CustomProjection } from '@visx/geo'
import * as topojson from 'topojson-client'
import topology from '../assets/world-topo.json'
import { geoMercator } from 'd3-geo'
import { background, land } from '@/constants'

export const WorldSvg = memo(function WorldSvg(props: {
  translate: [number, number]
  scale: number
}) {
  return (
    <CustomProjection<FeatureShape>
      projection={geoMercator}
      data={world.features}
      scale={props.scale}
      translate={props.translate}
    >
      {(mercator) => (
        <g>
          {mercator.features.map(({ feature, path }, i) => (
            <path
              key={`map-feature-${i}`}
              d={path || ''}
              fill={land}
              stroke={background}
              strokeWidth={0.15}
            />
          ))}
        </g>
      )}
    </CustomProjection>
  )
})

// @ts-ignore
const world = topojson.feature(topology, topology.objects.units) as {
  type: 'FeatureCollection'
  features: FeatureShape[]
}

interface FeatureShape {
  type: 'Feature'
  id: string
  geometry: { coordinates: [number, number][][]; type: 'Polygon' }
  properties: { name: string }
}
