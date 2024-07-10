import React, { memo, useMemo } from 'react'
import { Graph } from '@visx/network'
import { geoMercator } from 'd3-geo'
import cities from '../assets/cities-pruned.json'
import continents from '../assets/continents.json'
import bordersJson from '../assets/borders.json'
import { countryConfigs } from '@/constants'

export const NetworkGraph = memo(function NetworkGraph({
  scale,
  translate,
  groupRef,
}: {
  groupRef: any
  scale: number
  translate: [number, number]
}) {
  const nodes = useMemo(() => {
    // map city data to projected coordinates in pixel space
    const mappedCities = getProjectedCities(scale, translate)

    // for each city, generate nodes around it based on its density and size
    console.time('nodes')
    const nodes = getNodes(mappedCities, groupRef.current)
    console.timeEnd('nodes')

    // console.time('reduce')
    // const result = groupCoordinates(nodes, 25).flatMap((g) => g[0])
    // console.timeEnd('reduce')
    // return result

    return nodes
  }, [scale, translate])

  const dataSample = {
    nodes,
    links: [
      // { source: nodes[0], target: nodes[1] },
      // { source: nodes[1], target: nodes[2] },
      // { source: nodes[2], target: nodes[0] },
    ],
  }

  return (
    <Graph
      graph={dataSample}
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

const DefaultNode = (props: any) => {
  return (
    <>
      <circle
        onMouseDown={() => console.log(props.node)}
        fill={'#ff0000'}
        r={props.node.r}
        {...props}
      />
      {/* <text fontSize={0.03}>{props.node.Name}</text> */}
      {/* <text fontSize={props.node.r / 10}>{props.node.Name}</text> */}
    </>
  )
}

const getProjectedCities = (scale: number, translate: [number, number]) => {
  const projection = geoMercator().translate(translate).scale(scale)

  return cities.map((c) => {
    const projectedCoords = projection(c.earthCoords as [number, number])!
    return {
      ...c,
      coords: projectedCoords,
      x: c.earthCoords[0],
      y: c.earthCoords[1],
    }
  })
}

const getNodes = (
  mappedCities: {
    coords: [number, number]
    x: number
    y: number
    name: string
    country: string
    earthCoords: number[]
    population: number
    density: number
  }[],
  g: SVGGElement,
) => {
  const result = mappedCities.flatMap((c) => {
    const continentName = continents[c.country as keyof typeof continents]
    const config =
      countryConfigs[c.country as keyof typeof countryConfigs] ??
      countryConfigs[continentName as keyof typeof countryConfigs] ??
      countryConfigs.default

    const { densityFactor, maxDensity, maxNodes, popFactor } = config
    return getRandomNonUniformPointsInCircle(
      ...c.coords,
      densityFactor / Math.min(maxDensity, c.density),
      Math.floor(Math.min(maxNodes, Math.max(1, c.population / popFactor))),
      g,
      c.country,
    ).map((d) => ({ ...c, ...d, r: 0.1 }))
  })

  console.log(result.slice(0, 10))

  return result
}

function getRandomNonUniformPointsInCircle(
  centerX: number,
  centerY: number,
  radius: number,
  numberOfPoints: number,
  element: SVGGElement,
  country: string,
) {
  let points: { x: number; y: number; country: string }[] = []
  let fails = 0
  const angleMultiplier = 2 * Math.PI

  const svg = element.parentElement as unknown as SVGSVGElement
  const p = svg.createSVGPoint()
  const paths = Array.from(element.childNodes[0].childNodes) as SVGPathElement[]
  const borders = bordersJson[country as keyof typeof bordersJson] as string[]
  const _paths = paths.filter(
    (p) =>
      borders.includes(p.getAttribute('name') ?? '') ||
      p.getAttribute('name') === country,
  )

  while (points.length < numberOfPoints && fails < 1000) {
    const angle = Math.random() * angleMultiplier
    const r = radius * Math.sqrt(Math.random())
    const x = centerX + r * Math.cos(angle)
    const y = centerY + r * Math.sin(angle)

    p.x = x
    p.y = y

    const containingCountry = _paths.find((node) => node.isPointInFill(p))

    if (containingCountry) {
      points.push({
        x,
        y,
        country: containingCountry.getAttribute('name') ?? 'Unknown',
      })
    } else {
      fails++
    }
  }

  return points
}

// function haversineDistance(
//   coord1: { x: number; y: number },
//   coord2: { x: number; y: number },
// ) {
//   const R = 6371 // Earth's radius in kilometers
//   const x1 = coord1.x * (Math.PI / 180)
//   const y1 = coord1.y * (Math.PI / 180)
//   const x2 = coord2.x * (Math.PI / 180)
//   const y2 = coord2.y * (Math.PI / 180)

//   const dx = x2 - x1
//   const dy = y2 - y1

//   const a =
//     Math.sin(dx / 2) * Math.sin(dx / 2) +
//     Math.cos(x1) * Math.cos(x2) * Math.sin(dy / 2) * Math.sin(dy / 2)
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

//   return R * c
// }

// function groupCoordinates(
//   coords: { x: number; y: number }[],
//   maxDistance: number,
// ) {
//   const groups = []

//   for (let coord of coords) {
//     let added = false

//     for (let group of groups) {
//       for (let member of group) {
//         if (haversineDistance(coord, member) <= maxDistance) {
//           group.push(coord)
//           added = true
//           break
//         }
//       }
//       if (added) break
//     }

//     if (!added) {
//       groups.push([coord])
//     }
//   }

//   return groups
// }
