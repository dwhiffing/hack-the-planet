import { baseDiscoveryRange, UPGRADES } from '@/constants'
import { IUpgradeKey } from '@/types'
import { initialUpgrades, store } from './valtioState'

const getLevel = (key: IUpgradeKey, nextLevel?: boolean) => {
  const state = store.upgrades

  return (state[key]?.level ?? 0) + (nextLevel ? 1 : 0)
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
    return 0.01 + level * 0.01
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
