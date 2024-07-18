import { useCallback } from 'react'
import { homeId, FullNode } from '@/constants'
import useSWRImmutable from 'swr/immutable'
import { uniq } from 'lodash'

export const useSelectedNodeId = () => {
  const { data: selectedNodeId, mutate } = useSWRImmutable<number>(
    `selected-node-id`,
    () => -1,
  )

  const setSelectedNodeId = useCallback(
    (nodeId: number) => mutate(nodeId, { revalidate: false }),
    [mutate],
  )

  const onClickNode = useCallback(
    (id: number) => {
      // if there's no selected node, select the clicked node
      if (selectedNodeId === -1) return setSelectedNodeId(id)

      // if we click the currently selected node, deselect it
      if (id === selectedNodeId) return setSelectedNodeId(-1)

      // otherwise, deselect the current node
      setSelectedNodeId(id)
    },
    [selectedNodeId, setSelectedNodeId],
  )

  return { selectedNodeId, setSelectedNodeId, onClickNode }
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
