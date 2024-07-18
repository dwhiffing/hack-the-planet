import { useCallback } from 'react'
import { homeId, FullNode } from '@/constants'
import useSWRImmutable from 'swr/immutable'
import { uniq } from 'lodash'

export const useSelectedNodeId = () => {
  const { data, mutate } = useSWRImmutable<number>(`selected-node-id`, () => -1)

  const setSelectedNodeId = useCallback(
    (nodeId: number) => mutate(nodeId, { revalidate: false }),
    [mutate],
  )

  return { selectedNodeId: data, setSelectedNodeId }
}
export const useRenderedNodeIds = () => {
  const { data, mutate } = useSWRImmutable<number[]>(
    `rendered-node-ids`,
    () => [homeId],
  )

  const addRenderedNodes = useCallback(
    (nodeId: number) =>
      mutate((n) => uniq([...(n ?? []), nodeId]), { revalidate: false }),
    [mutate],
  )

  return { renderedNodeIds: data ?? [], addRenderedNodes }
}

export const useNodeState = (nodeId?: number) => {
  const { data, mutate } = useSWRImmutable<FullNode | null>(
    nodeId && nodeId !== -1 ? `node-${nodeId}` : undefined,
    () => null,
  )
  const setNode = useCallback(
    (changes: Partial<FullNode>) => {
      mutate(
        (node) => {
          if (node) {
            return { ...node, ...changes }
          }
        },
        { revalidate: false },
      )
    },
    [mutate],
  )
  return { node: data, setNode }
}
