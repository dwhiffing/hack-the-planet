import { Zoom } from '@vx/zoom'
import { MutableRefObject } from 'react'

export type Point = { x: number; y: number }

export type IWorldState = {
  tickspeed: number
  renderedNodeIds: number[]
  selectedNodeId: number
  nodes: Node[]
  actions: {
    label: string
    getIsVisible: (node: FullNode) => boolean
    onClick: (node: FullNode) => void
  }[]
  zoomRef: MutableRefObject<Zoom | null>
  worldSvgMountCallback: (node: SVGGElement) => void
  onClickNode: (id: number) => void
  onDeselect: () => void
}

export type Node = {
  x: number
  y: number
  country: string
  earthCoords?: [number, number]
  id: number
  r?: number
}

export type PublicNodeState = {
  isHome?: boolean
  isOwned?: boolean
  isScanned?: boolean
  isScanning?: boolean
  target?: number
  money?: number
  outgoingMoney?: number
}

export type FullNode = Node & PublicNodeState

export const background = '#111'
export const land = '#333'
export const pxPerKM = 0.04356460038551915
export const zoomScale = 200
export const maxZoom = 500
export const minZoom = 1
export const homeId = 9891
export const baseScale = 200
export const baseTickspeed = 1000
export const discoveryRange = 25
export const scanTime = 2000
export const baseTranslate = [0, 0] as [number, number]
export const countryConfigs = {
  default: {
    densityFactor: 200,
    maxDensity: 17,
    maxNodes: 100,
    popFactor: 400000,
  },

  // continent

  Asia: {
    densityFactor: 160,
    maxDensity: 12,
    maxNodes: 100,
    popFactor: 50000,
  },
  China: {
    densityFactor: 160,
    maxDensity: 12,
    maxNodes: 100,
    popFactor: 350000,
  },
  Oceania: {
    densityFactor: 55,
    maxDensity: 20,
    maxNodes: 100,
    popFactor: 10000,
  },
  'Europe/Asia': {
    densityFactor: 240,
    maxDensity: 12,
    maxNodes: 1500,
    popFactor: 160000,
  },
  Europe: {
    densityFactor: 140,
    maxDensity: 12,
    maxNodes: 1500,
    popFactor: 40000,
  },
  'South America': {
    densityFactor: 55,
    maxDensity: 8,
    maxNodes: 200,
    popFactor: 50000,
  },
  Africa: {
    densityFactor: 55,
    maxDensity: 8,
    maxNodes: 50,
    popFactor: 100000,
  },
  // country
  'United Kingdom': {
    densityFactor: 180,
    maxDensity: 15,
    maxNodes: 500,
    popFactor: 15000,
  },
  Australia: {
    densityFactor: 40,
    maxDensity: 22,
    maxNodes: 500,
    popFactor: 25000,
  },
  Canada: {
    densityFactor: 220,
    maxDensity: 20,
    maxNodes: 1000,
    popFactor: 18000,
  },
  'United States': {
    densityFactor: 250,
    maxDensity: 10,
    maxNodes: 1000,
    popFactor: 30000,
  },
}
