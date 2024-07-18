import { homeId } from '@/constants'
import { useMemo, useCallback } from 'react'
import { useNodeState } from './useNodeState'

export const useMoney = () => {
  const { node: home, setNode } = useNodeState(homeId)
  const money = useMemo(() => home?.money ?? 0, [home])
  const setMoney = useCallback(
    (amount: number) => {
      setNode({ money: money + amount })
    },
    [money, setNode],
  )
  return { money, setMoney }
}
