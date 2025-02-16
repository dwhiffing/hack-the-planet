import { baseHackTime, NODE_CONFIGS } from '@/constants/index'
import { updateNode } from '@/utils/nodes'
import { randomInRange } from '@/utils/random'
import { store } from '@/utils/valtioState'

export const onHackStart = (id: number) => {
  const node = store.nodes[id]
  const config = NODE_CONFIGS[node.type!]
  const hackDifficulty = randomInRange(
    config.hackDifficultyMin,
    config.hackDifficultyMax,
  )
  let hackDuration = baseHackTime + hackDifficulty
  if (node && !node.isOwned) {
    updateNode(id, { hackDuration })
  }
  store.points -= node.pointCost ?? 0
}

export const onHackFinish = (id: number) => {
  const node = store.nodes[id]
  if (node && !node.isOwned) {
    updateNode(id, { isOwned: true })
  }
}
