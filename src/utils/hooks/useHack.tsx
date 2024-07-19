import { hackTime } from '@/constants'
import { useCallback } from 'react'
import { useNodes } from './useNodeState'

export const useHack = () => {
  const { updateNode, getNode } = useNodes()

  const onHackStart = useCallback(
    (id: number) => {
      const node = getNode(id)
      if (node && node.isScanned && !node.isOwned) {
        updateNode(id, { hackDuration: hackTime })
      }
    },
    [updateNode, getNode],
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
