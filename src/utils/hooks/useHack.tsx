import { baseHackTime } from '@/constants'
import { useCallback } from 'react'
import { useNodes } from './useNodeState'
import { getHackSpeed } from './useUpgrades'
import { useSuspicion } from './useSuspicion'
import { getNodeSuspicion } from '../nodes'

export const useHack = () => {
  const { updateNode, getNode } = useNodes()
  const { setSuspicion } = useSuspicion()

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
