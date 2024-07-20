import { useCallback, useMemo } from 'react'
import useSWRImmutable from 'swr/immutable'
import { useMoney } from './useMoney'
import { baseDiscoveryRange, UPGRADES } from '@/constants'
import { cache } from '@/pages'
import { IUpgradeKey, IUpgradeState } from '@/types'

const getLevel = (key: IUpgradeKey, nextLevel?: boolean) => {
  const state = cache.get('upgrades') as {
    data: IUpgradeState[]
  }

  return (
    (state?.data?.find((u) => u.key === key)?.level ?? 0) + (nextLevel ? 1 : 0)
  )
}

export const getUpgradeEffect = (key: IUpgradeKey, nextLevel?: boolean) => {
  if (key === 'scan-range')
    return baseDiscoveryRange + getLevel('scan-range', nextLevel) * 10

  if (key === 'scan-efficiency')
    return 1 + getLevel('scan-efficiency', nextLevel)

  if (key === 'scan-speed') return 1 + getLevel('scan-speed', nextLevel)

  if (key === 'hack-speed') return 1 + getLevel('hack-speed', nextLevel)

  if (key === 'hack-efficiency')
    return 1 + getLevel('hack-efficiency', nextLevel)

  if (key === 'steal-amount') {
    const level = getLevel('steal-amount', nextLevel)
    const milestone = Math.floor(level / 10) + 1
    return 0.1 + level * 0.1 * Math.pow(milestone, 1.5)
  }

  if (key === 'auto-steal-amount') {
    const level = getLevel('auto-steal-amount', nextLevel)
    const milestone = Math.floor(level / 10) + 1
    return level * 0.1 * Math.pow(milestone, 1.5)
  }

  if (key === 'autoscan') {
    const level = getLevel('autoscan', nextLevel)
    if (level === 0) return -1
    return 30 - level * 5
  }

  if (key === 'suspicion-decay') {
    const level = getLevel('suspicion-decay', nextLevel)
    if (level === 0) return 0
    return level * -0.01
  }

  return 0
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
              const currentState = upgradeStates ?? []
              return [
                ...initialUpgrades.filter(
                  (u) => !currentState.some((s) => s.key === u.key),
                ),
                ...(upgradeStates ?? []),
              ]?.map((us) =>
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

export const calculateNextCost = (key: string, owned: number) => {
  const upgrade = UPGRADES.find((u) => u.key === key)!
  if (upgrade.costs) return upgrade.costs[owned]

  if (upgrade.costExponent && upgrade.baseCost)
    return Math.round(upgrade.baseCost * Math.pow(upgrade.costExponent, owned))

  return 0
}

const initialUpgrades = UPGRADES.map((u) => ({
  key: u.key,
  level: 0,
  nextCost: u.baseCost ?? u.costs?.[0] ?? 0,
}))
