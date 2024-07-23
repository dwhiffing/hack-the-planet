import React, { memo } from 'react'
import { geoMercator } from 'd3-geo'
import * as topojson from 'topojson-client'
import { CustomProjection } from '@visx/geo'

import { background, baseScale, baseTranslate, land } from '@/constants/index'
import topology from '@/constants/world-topo.json'

export const WorldSvg = memo(function WorldSvg() {
  return (
    <CustomProjection<FeatureShape>
      projection={geoMercator}
      data={world.features}
      scale={baseScale}
      translate={baseTranslate}
    >
      {(mercator) => (
        <g>
          {mercator.features.map(({ feature, path }, i) => (
            <path
              key={`map-feature-${i}`}
              d={path || ''}
              fill={land}
              stroke={background}
              strokeWidth={0.01}
              name={feature.properties.name}
              // onClick={() => {
              //   alert(`Clicked: ${feature.properties.name} (${feature.id})`)
              // }}
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
