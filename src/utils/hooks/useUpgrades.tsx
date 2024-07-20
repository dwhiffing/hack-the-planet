import { useCallback, useMemo } from 'react'
import useSWRImmutable from 'swr/immutable'
import { useMoney } from './useMoney'
import { baseDiscoveryRange, UPGRADES } from '@/constants'
import { cache } from '@/pages'
import { IUpgradeKey, IUpgradeState } from '@/types'

const getLevel = (key: IUpgradeKey) => {
  const state = cache.get('upgrades') as {
    data: IUpgradeState[]
  }

  return state?.data?.find((u) => u.key === key)?.level ?? 0
}

export const getDiscoveryRange = () =>
  baseDiscoveryRange + getLevel('scan-range') * 20
export const getScanEfficiency = () => 1 + getLevel('scan-efficiency')
export const getScanSpeed = () => 1 + getLevel('scan-speed')
export const getHackSpeed = () => 1 + getLevel('hack-speed')
export const getHackEfficiency = () => 1 + getLevel('hack-efficiency')
export const getTransferRate = () => 1 + getLevel('transfer-rate')
export const getAutoHackTime = () => 10 - getLevel('autohack') * 2
// TODO: add upgrade for this
export const getSuspicionDecay = () => -0.33

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
  return upgrade.costs[owned]
}

const initialUpgrades = UPGRADES.map((u) => ({
  key: u.key,
  level: 0,
  nextCost: u.costs[0],
}))
