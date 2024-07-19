import { useCallback, useEffect, useMemo } from 'react'
import useSWRImmutable from 'swr/immutable'
import { useSWRConfig } from 'swr'
import { uniq } from 'lodash'
import { FullNode, Node } from '@/types'
import { homeId, initialMoney } from '@/constants'
import { getNodes } from '../geo'

export const useSelectedNodeId = () => {
  const { data: selectedNodeId, mutate } = useSWRImmutable<number>(
    `selected-node-id`,
    () => -1,
  )

  const setSelectedNodeId = useCallback(
    (nodeId: number) => mutate(nodeId, { revalidate: false }),
    [mutate],
  )

  const onDeselect = useCallback(() => {
    setSelectedNodeId(-1)
  }, [setSelectedNodeId])

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

  return { selectedNodeId, setSelectedNodeId, onClickNode, onDeselect }
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

export const useNodes = () => {
  const { mutate: globalMutate, cache } = useSWRConfig()
  const { data: _nodes, mutate } = useSWRImmutable<Node[]>(
    'all-node-data',
    () => [],
  )
  const nodes = useMemo(() => _nodes ?? [], [_nodes])

  const { data: _renderedNodeIds, mutate: mutateRenderedNodeIds } =
    useSWRImmutable<number[]>(`rendered-node-ids`, () => [homeId])
  const renderedNodeIds = useMemo(
    () => _renderedNodeIds ?? [],
    [_renderedNodeIds],
  )

  const addRenderedNodes = useCallback(
    (nodeId: number) =>
      mutateRenderedNodeIds((n) => uniq([...(n ?? []), nodeId]), {
        revalidate: false,
      }),
    [mutateRenderedNodeIds],
  )

  const setNodes = useCallback(
    (changes: Node[]) => {
      mutate(changes, { revalidate: false })
    },
    [mutate],
  )

  const worldSvgMountCallback = useCallback(
    (node: SVGGElement) => setNodes(getNodes(node)),
    [setNodes],
  )

  const getNode = useCallback(
    (id: number) => cache.get(`node-${id}`)?.data as FullNode | undefined,
    [cache],
  )

  const updateNode = useCallback(
    (nodeId: number, changes: Partial<FullNode>) => {
      if (nodes.length === 0 || typeof nodeId !== 'number') return
      globalMutate(
        `node-${nodeId}`,
        (node) => {
          if (node) {
            return { ...node, ...changes }
          } else {
            addRenderedNodes(nodeId)
            const _node = nodes.find((n) => n.id === nodeId)!
            return { ..._node, ...changes }
          }
        },
        { revalidate: false },
      )
    },
    [nodes, globalMutate, addRenderedNodes],
  )

  useEffect(() => {
    if (nodes.length === 0) return

    const home = getNode(homeId)
    if (!home)
      updateNode(homeId, { money: initialMoney, isOwned: true, isHome: true })
  }, [updateNode, nodes, getNode])

  return {
    nodes,
    renderedNodeIds,
    addRenderedNodes,
    setNodes,
    getNode,
    updateNode,
    worldSvgMountCallback,
  }
}
