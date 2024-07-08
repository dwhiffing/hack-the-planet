import React from 'react'
import { Graph } from '@visx/network'
import { geoMercator } from 'd3-geo'

export function NetworkGraph({
  zoom,
  scale,
  translate,
}: {
  scale: number
  translate: [number, number]
  zoom: any
}) {
  const projection = geoMercator().translate(translate).scale(scale)
  const nodes = (
    [
      [13.408333, 52.518611],
      [2.352222, 48.856613],
      [-0.1275, 51.507222],
      [-79.38, 43.66],
    ] as [number, number][]
  )
    .map(projection)
    .map((n) => ({ x: n?.[0], y: n?.[1] }))

  const dataSample = {
    nodes,
    links: [
      { source: nodes[0], target: nodes[1] },
      { source: nodes[1], target: nodes[2] },
      { source: nodes[2], target: nodes[0] },
    ],
  }

  return (
    <Graph
      graph={dataSample}
      linkComponent={(props) => (
        <DefaultLink
          {...props}
          link={{
            ...props.link,
            width: 2 / zoom.transformMatrix.scaleX,
          }}
        />
      )}
      nodeComponent={(props) => (
        // @ts-ignore
        <DefaultNode {...props} r={5 / zoom.transformMatrix.scaleX} />
      )}
    />
  )
}

const DefaultLink = ({ link: { source, target, width } }: any) => (
  <line
    style={{ pointerEvents: 'none' }}
    x1={source.x}
    y1={source.y}
    x2={target.x}
    y2={target.y}
    strokeWidth={width}
    stroke="red"
    strokeOpacity={1}
    // strokeDasharray={dashed ? '8,4' : undefined}
  />
)

const DefaultNode = (props: any) => (
  <circle
    onMouseDown={() => console.log('eat me')}
    fill={'#ff0000'}
    {...props}
  />
)
