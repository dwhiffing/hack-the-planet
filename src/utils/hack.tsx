import { baseHackTime } from '@/constants/index'
import { getNodeHackCost, updateNode } from '@/utils/nodes'
import { store } from '@/utils/valtioState'

export const onHackStart = (id: number) => {
  const node = store.nodes[id]
  let hackDuration = baseHackTime
  if (node && !node.isOwned) {
    updateNode(id, { hackDuration })
  }
  store.points -= getNodeHackCost(id)
}

export const onHackFinish = (id: number) => {
  const node = store.nodes[id]
  if (node && !node.isOwned) {
    updateNode(id, { isOwned: true })
  }
}
