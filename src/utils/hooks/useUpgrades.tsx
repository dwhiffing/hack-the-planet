import { useCallback, useMemo } from 'react'
import useSWRImmutable from 'swr/immutable'
import { useMoney } from './useMoney'

export const useUpgrades = () => {
  const { money, setMoney } = useMoney()
  const { data, mutate } = useSWRImmutable<IUpgradeState[]>('upgrades', () =>
    UPGRADES.map((u) => ({ key: u.key, level: 0, nextCost: u.baseCost })),
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
        const currentLevel = upgradeStates?.[key].level ?? 0
        const cost = calculateNextCost(key, currentLevel)
        if (money >= cost) {
          setMoney(-cost)
          mutate(
            (upgradeStates) => {
              return upgradeStates?.map((us) =>
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
type IUpgradeKey = 'scan-range' | 'autohack'
export const UPGRADES: IUpgrade[] = [
  {
    name: 'Scan Range',
    key: 'scan-range',
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
