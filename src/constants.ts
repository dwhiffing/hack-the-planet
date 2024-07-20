import { INodeConfig, INodeType, IUpgrade } from './types'

export const fastMode = false

export const baseTickspeed = fastMode ? 250 : 1000
export const baseScanTime = 5
export const baseHackTime = 5

export const initialMoney = 0
export const incomeRate = 10
export const homeId = 2065
export const baseDiscoveryRange = 25

export const background = '#111'
export const land = '#333'
export const pxPerKM = 0.04356460038551915
export const baseScale = 200
export const zoomScale = 200
export const minZoom = 1
export const maxZoom = 500
export const baseTranslate = [0, 0] as [number, number]

export const UPGRADES: IUpgrade[] = [
  {
    name: 'Steal Rate',
    key: 'steal-amount',
    description:
      'How much money you steal per click and transfer between nodes per tick',
    requiredNodes: 3,
    maxLevel: 8,
    costExponent: 2,
    baseCost: 5,
  },
  {
    name: 'Scan Range',
    key: 'scan-range',
    description: 'How far you can scan in kilometers',
    requiredNodes: 3,
    costs: [25, 100, 1000, 10000, 100000],
  },
  {
    name: 'Auto Steal',
    key: 'auto-steal-amount',
    description:
      'How much money you automatically steal from hacked nodes per tick',
    requiredNodes: 4,
    maxLevel: 8,
    costExponent: 2,
    baseCost: 50,
  },
  {
    name: 'Scan Efficiency',
    key: 'scan-efficiency',
    description: '',
    requiredNodes: 50,
    costs: [10, 100, 1000, 10000, 100000],
  },
  {
    name: 'Scan Speed',
    key: 'scan-speed',
    description: '',
    requiredNodes: 50,
    costs: [10, 100, 1000, 10000, 100000],
  },
  {
    name: 'Hack Speed',
    key: 'hack-speed',
    description: '',
    requiredNodes: 50,
    costs: [10, 100, 1000, 10000, 100000],
  },
  {
    name: 'Hack Efficiency',
    key: 'hack-efficiency',
    description: '',
    requiredNodes: 50,
    costs: [10, 100, 1000, 10000, 100000],
  },
  {
    name: 'Autohack',
    key: 'autohack',
    description: '',
    requiredNodes: 50,
    costs: [10, 100, 1000, 10000, 100000],
  },
]
export const NODE_CONFIGS: Record<INodeType, INodeConfig> = {
  home: {
    startingMoneyMin: 0,
    startingMoneyMax: 0,
    incomeMin: 0,
    incomeMax: 0,
    suspicionMin: 0,
    suspicionMax: 0,
    hackDifficultyMin: 0,
    hackDifficultyMax: 0,
  },
  basic: {
    startingMoneyMin: 5,
    startingMoneyMax: 20,
    incomeMin: 0.5,
    incomeMax: 2,
    suspicionMin: 100,
    suspicionMax: 200,
    hackDifficultyMin: 1,
    hackDifficultyMax: 2,
  },
  rich: {
    startingMoneyMin: 100,
    startingMoneyMax: 1000,
    incomeMin: 10,
    incomeMax: 50,
    suspicionMin: 200,
    suspicionMax: 400,
    hackDifficultyMin: 1,
    hackDifficultyMax: 2,
  },
  bank: {
    startingMoneyMin: 100,
    startingMoneyMax: 1000,
    incomeMin: 10,
    incomeMax: 100,
    suspicionMin: 1000,
    suspicionMax: 2000,
    hackDifficultyMin: 10,
    hackDifficultyMax: 20,
  },
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
