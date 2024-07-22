import useSWRImmutable from 'swr/immutable'
import { initialMoney } from '@/constants'
import { useMemo, useCallback } from 'react'
import { useNodes } from './useNodeState'
import { getUpgradeEffect } from './useUpgrades'

export const useMoney = () => {
  const { getNode, renderedNodeIds } = useNodes()

  const { data: money, mutate: _setMoney } = useSWRImmutable<number>(
    `money`,
    () => initialMoney,
  )

  const setMoney = useCallback(
    (amount: number) => {
      _setMoney((money) => (money ?? 0) + amount, { revalidate: false })
    },
    [_setMoney],
  )

  const incomePerTick = useMemo(
    () =>
      renderedNodeIds.reduce((sum, nodeId) => {
        const node = getNode(nodeId)
        if (node?.isOwned) {
          const stealAmount = getUpgradeEffect('steal-amount')
          return sum + (node.income ?? 0) * stealAmount
        }
        return sum + 0
      }, 0),
    [getNode, renderedNodeIds],
  )

  return { money: money ?? 0, setMoney, incomePerTick }
}
