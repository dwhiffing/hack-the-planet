import { baseHackTime, NODE_CONFIGS } from '@/constants'
import { useCallback } from 'react'
import { useNodes } from './useNodeState'
import { useSuspicion } from './useSuspicion'
import { getNodeSuspicion } from '../nodes'
import { randomInRange } from '../random'
import { FullNode } from '@/types'
import { getUpgradeEffect } from './useUpgrades'

export const useHack = () => {
  const { updateNode, getNode } = useNodes()
  const { setSuspicion } = useSuspicion()

  const onHackStart = useCallback(
    (id: number) => {
      const node = getNode(id)!
      const config = NODE_CONFIGS[node.type!]
      const hackDifficulty = randomInRange(
        config.hackDifficultyMin,
        config.hackDifficultyMax,
      )
      let hackDuration = baseHackTime + hackDifficulty
      if (node && node.isScanned && !node.isOwned) {
        updateNode(id, { hackDuration })
      }
    },
    [updateNode, getNode],
  )

  const onHackFinish = useCallback(
    (id: number) => {
      const node = getNode(id)
      if (node && node.isScanned && !node.isOwned) {
        setSuspicion(getNodeSuspicion(id))
        updateNode(id, { isOwned: true })
      }
    },
    [updateNode, getNode, setSuspicion],
  )

  return {
    onHackStart,
    onHackFinish,
  }
}
