import { baseHackTime, NODE_CONFIGS } from '@/constants'
import { getNodeSuspicion, updateNode } from './nodes'
import { randomInRange } from './random'
import { store } from './valtioState'

export const onHackStart = (id: number) => {
  const node = store.nodes[id]
  const config = NODE_CONFIGS[node.type!]
  const hackDifficulty = randomInRange(
    config.hackDifficultyMin,
    config.hackDifficultyMax,
  )
  let hackDuration = baseHackTime + hackDifficulty
  if (node && node.isScanned && !node.isOwned) {
    updateNode(id, { hackDuration })
  }
}

export const onHackFinish = (id: number) => {
  const node = store.nodes[id]
  if (node && node.isScanned && !node.isOwned) {
    store.suspicion += getNodeSuspicion(id)
    updateNode(id, { isOwned: true })
  }
}
