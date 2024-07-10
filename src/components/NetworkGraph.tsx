import React, { memo } from 'react'
import { Graph } from '@visx/network'
import { getNodes } from '@/utils/getNodes'
import { geoMercator } from 'd3-geo'

export const NetworkGraph = memo(function NetworkGraph({
  scale,
  translate,
  groupRef,
}: {
  groupRef: any
  scale: number
  translate: [number, number]
}) {
  const nodes = getNodes(scale, translate, groupRef.current)
  const projection = geoMercator().translate(translate).scale(scale)
  const data = {
    nodes: nodes.map((n) => {
      const coords = projection([n.x, n.y]) ?? []
      return {
        ...n,
        x: coords[0],
        y: coords[1],
      }
    }),
    links: [
      // { source: nodes[0], target: nodes[1] },
      // { source: nodes[1], target: nodes[2] },
      // { source: nodes[2], target: nodes[0] },
    ],
  }

  return (
    <Graph
      graph={data}
      linkComponent={(props) => (
        // @ts-ignore
        <DefaultLink {...props} link={{ ...props.link, width: 2 }} />
      )}
      nodeComponent={(props) => (
        // @ts-ignore
        <DefaultNode {...props} />
      )}
    />
  )
})

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

const DefaultNode = (props: { node: { x: number; y: number; r: number } }) => {
  return (
    <circle
      onMouseDown={() => console.log(props.node)}
      fill={'#ff0000'}
      r={props.node.r ?? 0.1}
    />
  )
}
