import { INodeConfig, INodeType, IUpgrade } from './types'

export const fastMode = false

export const baseTickspeed = fastMode ? 100 : 1000
export const baseScanTime = 5
export const baseHackTime = 5

export const initialMoney = 10
export const incomeRate = 10
export const homeId = 9891
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
    name: 'Scan Range',
    key: 'scan-range',
    maxLevel: 8,
    costExponent: 3,
    baseCost: 1,
  },
  {
    name: 'Scan Efficiency',
    key: 'scan-efficiency',
    maxLevel: 8,
    costExponent: 3,
    baseCost: 1,
  },
  {
    name: 'Scan Speed',
    key: 'scan-speed',
    maxLevel: 8,
    costExponent: 3,
    baseCost: 1,
  },
  {
    name: 'Hack Speed',
    key: 'hack-speed',
    maxLevel: 8,
    costExponent: 3,
    baseCost: 1,
  },
  {
    name: 'Hack Efficiency',
    key: 'hack-efficiency',
    maxLevel: 8,
    costExponent: 3,
    baseCost: 1,
  },
  {
    name: 'Transfer Rate',
    key: 'transfer-rate',
    maxLevel: 8,
    costExponent: 3,
    baseCost: 1,
  },
  {
    name: 'Autohack',
    key: 'autohack',
    maxLevel: 8,
    costExponent: 3,
    baseCost: 1,
  },
]
export const NODE_CONFIGS: Record<INodeType, INodeConfig> = {
  home: {
    startingMoneyMin: 10,
    startingMoneyMax: 10,
    incomeMin: 1,
    incomeMax: 1,
    suspicionMin: 0,
    suspicionMax: 0,
    hackDifficultyMin: 0,
    hackDifficultyMax: 0,
  },
  basic: {
    startingMoneyMin: 10,
    startingMoneyMax: 100,
    incomeMin: 1,
    incomeMax: 10,
    suspicionMin: 100,
    suspicionMax: 200,
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
