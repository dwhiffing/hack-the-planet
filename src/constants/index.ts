import { INodeConfig, INodeType, IUpgrade } from '@/types'

export const baseAnimationDuration = 500
export const baseTickspeed = 500
export const baseHackTime = 10
export const startingPoints = 10

export const initialMoney = 0 //100000000000000
export const saveRate = 10
export const homeId = 519
export const baseDiscoveryRange = 25

export const background = '#111'
export const land = '#333'
export const pxPerKM = 0.04356460038551915
export const baseScale = 200
export const minZoom = 1
export const maxZoom = baseScale
export const baseTranslate = [0, 0] as [number, number]

export const UPGRADES: IUpgrade[] = [
  {
    name: 'Max points',
    key: 'max-points',
    description: 'Maximum number of points',
    requiredNodes: 1,
    maxLevel: 99,
    costExponent: 1.25,
    baseCost: 30,
  },
  {
    name: 'Point Rate',
    key: 'point-rate',
    description: 'How much many points you get per node per tick',
    requiredNodes: 1,
    maxLevel: 99,
    costExponent: 1.15,
    baseCost: 15,
  },
  {
    name: 'Steal Rate',
    key: 'steal-amount',
    description:
      'How much money you steal per click and transfer between nodes per tick',
    requiredNodes: 1,
    maxLevel: 99,
    costExponent: 1.2,
    baseCost: 150,
  },
  // {
  //   name: 'Autoscan',
  //   key: 'autoscan',
  //   description: 'Automatically scans for nodes occasionally',
  //   requiredNodes: 1,
  //   costs: [500, 1000, 5000, 10000, 50000],
  // },
  // {
  //   name: 'Scan Efficiency',
  //   key: 'scan-efficiency',
  //   description: 'How many nodes can be found per scan',
  //   requiredNodes: 1,
  //   maxLevel: 100,
  //   costExponent: 1.2,
  //   baseCost: 500,
  // },
  // // TODO: need to figure out these upgrades
  // {
  //   name: 'Hack Efficiency',
  //   key: 'hack-efficiency',
  //   description: '',
  //   requiredNodes: 1,
  //   costs: [10, 100, 1000, 10000, 100000],
  // },
]
export const NODE_CONFIGS: Record<INodeType, INodeConfig> = {
  home: { baseIncome: 0 },
  basic: { baseIncome: 1 },
  rich: { baseIncome: 5 },
  bank: { baseIncome: 10 },
}
export const countryConfigs = {
  default: {
    densityFactor: 200,
    maxDensity: 17,
    maxNodes: 100,
    popFactor: 500000,
  },

  // continent

  Asia: {
    densityFactor: 200,
    maxDensity: 4,
    maxNodes: 50,
    popFactor: 200000,
  },
  China: {
    densityFactor: 160,
    maxDensity: 8,
    maxNodes: 100,
    popFactor: 1000000,
  },
  India: {
    densityFactor: 160,
    maxDensity: 8,
    maxNodes: 100,
    popFactor: 2000000,
  },
  Oceania: {
    densityFactor: 120,
    maxDensity: 8,
    maxNodes: 100,
    popFactor: 10000,
  },
  'Europe/Asia': {
    densityFactor: 200,
    maxDensity: 12,
    maxNodes: 100,
    popFactor: 250000,
  },
  Europe: {
    densityFactor: 140,
    maxDensity: 12,
    maxNodes: 100,
    popFactor: 130000,
  },
  'South America': {
    densityFactor: 240,
    maxDensity: 6,
    maxNodes: 100,
    popFactor: 250000,
  },
  Africa: {
    densityFactor: 240,
    maxDensity: 5,
    maxNodes: 50,
    popFactor: 300000,
  },
  // country
  'United Kingdom': {
    densityFactor: 180,
    maxDensity: 15,
    maxNodes: 100,
    popFactor: 125000,
  },
  Australia: {
    densityFactor: 180,
    maxDensity: 12,
    maxNodes: 100,
    popFactor: 45000,
  },
  'New Zealand': {
    densityFactor: 180,
    maxDensity: 12,
    maxNodes: 100,
    popFactor: 45000,
  },
  Canada: {
    densityFactor: 160,
    maxDensity: 16,
    maxNodes: 80,
    popFactor: 7000,
  },
  'United States': {
    densityFactor: 220,
    maxDensity: 5,
    maxNodes: 50,
    popFactor: 10000,
  },
  Iceland: {
    densityFactor: 100,
    maxDensity: 1,
    maxNodes: 100,
    popFactor: 55000,
  },
  Greenland: {
    densityFactor: 100,
    maxDensity: 1,
    maxNodes: 100,
    popFactor: 55000,
  },
}
