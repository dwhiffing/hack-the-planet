import { stealCost } from '@/constants'
import { store } from '@/utils/valtioState'

export const onSteal = (id: number) => {
  // updateNode(id, { mon: baseScanTime })
  store.points -= stealCost
  store.money += 1
}
