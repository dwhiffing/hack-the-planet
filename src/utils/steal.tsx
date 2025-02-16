import { store } from '@/utils/valtioState'

export const onSteal = (id: number) => {
  // updateNode(id, { mon: baseScanTime })
  store.money += 1
}
