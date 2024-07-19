import { useCallback, useMemo } from 'react'
import useSWRImmutable from 'swr/immutable'
import { useMoney } from './useMoney'
import { Cache, useSWRConfig } from 'swr'
import { baseDiscoveryRange } from '@/constants'

const getUpgradeLevel = (cache: Cache<any>, key: IUpgradeKey) => {
  const state = cache?.get('upgrades') as {
    data: IUpgradeState[]
  }

  return state?.data?.find((u) => u.key === key)?.level ?? 0
}

export const useStats = () => {
  const { cache } = useSWRConfig()

  const getDiscoveryRange = useCallback(
    () => baseDiscoveryRange + getUpgradeLevel(cache, 'scan-range') * 20,
    [cache],
  )
  const getScanEfficiency = useCallback(
    () => 1 + getUpgradeLevel(cache, 'scan-efficiency'),
    [cache],
  )
  const getScanSpeed = useCallback(
    () => getUpgradeLevel(cache, 'scan-speed'),
    [cache],
  )
  const getHackSpeed = useCallback(
    () => getUpgradeLevel(cache, 'hack-speed'),
    [cache],
  )
  const getAutoHack = useCallback(
    () => 1 + getUpgradeLevel(cache, 'autohack'),
    [cache],
  )

  return {
    getDiscoveryRange,
    getScanEfficiency,
    getScanSpeed,
    getHackSpeed,
    getAutoHack,
  }
}

export const useUpgrades = () => {
  const { money, setMoney } = useMoney()
  const { data, mutate } = useSWRImmutable<IUpgradeState[]>(
    'upgrades',
    () => initialUpgrades,
  )

  const upgradeStates = useMemo(
    () =>
      data?.reduce(
        (obj, state) => ({ ...obj, [state.key]: state }),
        {} as Record<IUpgradeKey, IUpgradeState>,
      ),
    [data],
  )

  const buyUpgrade = useCallback(
    (key: IUpgradeKey) => {
      {
        const currentLevel = upgradeStates?.[key]?.level ?? 0
        const cost = calculateNextCost(key, currentLevel)
        if (money >= cost) {
          setMoney(-cost)
          mutate(
            (upgradeStates) => {
              // if upgrade not present in upgradeStates, need to add it
              return [...initialUpgrades, ...(upgradeStates ?? [])]?.map((us) =>
                us.key === key ? { ...us, level: us.level + 1 } : us,
              )
            },
            { revalidate: false },
          )
        }
      }
    },
    [mutate, setMoney, money, upgradeStates],
  )
  return { upgradeStates, buyUpgrade }
}

type IUpgrade = {
  name: string
  key: IUpgradeKey
  maxLevel: number
  costExponent: number
  baseCost: number
}

type IUpgradeState = {
  key: string
  level: number
}
type IUpgradeKey =
  | 'scan-range'
  | 'autohack'
  | 'scan-efficiency'
  | 'scan-speed'
  | 'hack-speed'
export const UPGRADES: IUpgrade[] = [
  {
    name: 'Scan Range',
    key: 'scan-range',
    maxLevel: 4,
    costExponent: 1.5,
    baseCost: 10,
  },
  {
    name: 'Scan Efficiency',
    key: 'scan-efficiency',
    maxLevel: 4,
    costExponent: 1.5,
    baseCost: 10,
  },
  {
    name: 'Scan Speed',
    key: 'scan-speed',
    maxLevel: 4,
    costExponent: 1.5,
    baseCost: 10,
  },
  {
    name: 'Hack Speed',
    key: 'hack-speed',
    maxLevel: 4,
    costExponent: 1.5,
    baseCost: 10,
  },
  {
    name: 'Autohack',
    key: 'autohack',
    maxLevel: 1,
    costExponent: 1.08,
    baseCost: 10,
  },
]

export const calculateNextCost = (key: string, owned: number) => {
  const upgrade = UPGRADES.find((u) => u.key === key)!
  return Math.round(upgrade.baseCost * Math.pow(upgrade.costExponent, owned))
}

const initialUpgrades = UPGRADES.map((u) => ({
  key: u.key,
  level: 0,
  nextCost: u.baseCost,
}))
