import { baseHackTime } from '@/constants'
import { useCallback } from 'react'
import { useNodes } from './useNodeState'
import { getHackSpeed } from './useUpgrades'

export const useHack = () => {
  const { updateNode, getNode } = useNodes()

  const hackDuration = baseHackTime - getHackSpeed()
  const onHackStart = useCallback(
    (id: number) => {
      const node = getNode(id)
      if (node && node.isScanned && !node.isOwned) {
        updateNode(id, { hackDuration })
      }
    },
    [updateNode, hackDuration, getNode],
  )

  const onHackFinish = useCallback(
    (id: number) => {
      const node = getNode(id)
      if (node && node.isScanned && !node.isOwned) {
        updateNode(id, { isOwned: true })
      }
    },
    [updateNode, getNode],
  )

  return {
    onHackStart,
    onHackFinish,
  }
}
