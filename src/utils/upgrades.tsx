import { baseDiscoveryRange, UPGRADES } from '@/constants/index'
import { IUpgradeKey } from '@/types'
import { initialUpgrades, store } from '@/utils/valtioState'

const getLevel = (key: IUpgradeKey, nextLevel?: boolean) => {
  const state = store.upgrades

  return (state[key]?.level ?? 0) + (nextLevel ? 1 : 0)
}

export const getUpgradeEffect = (key: IUpgradeKey, nextLevel?: boolean) => {
  if (key === 'scan-efficiency')
    return 1 + getLevel('scan-efficiency', nextLevel)

  if (key === 'hack-efficiency')
    return 1 + getLevel('hack-efficiency', nextLevel)

  if (key === 'steal-amount') {
    const level = getLevel('steal-amount', nextLevel)
    return 0.01 + level * 0.01
  }

  if (key === 'autoscan') {
    const level = getLevel('autoscan', nextLevel)
    if (level === 0) return -1
    return 30 - level * 5
  }

  if (key === 'point-rate') {
    const level = getLevel('point-rate', nextLevel)
    return 1 + level * 1
  }

  if (key === 'max-points') {
    const level = getLevel('max-points', nextLevel)
    if (level === 0) return 50
    return 50 + level * 50
  }

  return 0
}

export const buyUpgrade = (key: IUpgradeKey) => {
  const currentLevel = store.upgrades?.[key]?.level ?? 0
  const cost = calculateNextCost(key, currentLevel)
  if (store.money >= cost) {
    store.money -= cost
    if (!store.upgrades[key]) {
      store.upgrades[key] = initialUpgrades[key]
    }
    store.upgrades[key].level += 1
  }
}

export const calculateNextCost = (key: string, owned: number) => {
  const upgrade = UPGRADES.find((u) => u.key === key)!
  if (upgrade.costs) return upgrade.costs[owned]

  if (upgrade.costExponent && upgrade.baseCost)
    return Math.round(upgrade.baseCost * Math.pow(upgrade.costExponent, owned))

  return 0
}
