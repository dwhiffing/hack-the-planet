export const fastMode = false

export const baseTickspeed = fastMode ? 100 : 1000
export const baseScanTime = 5
export const baseHackTime = 5

export const initialMoney = 10
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
