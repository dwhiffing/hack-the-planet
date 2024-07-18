import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Zoom } from '@vx/zoom'
import {
  homeId,
  Node,
  baseTickspeed,
  FullNode,
  scanTime,
  discoveryRange,
  hackTime,
  initialMoney,
} from '@/constants'
import { getNodes } from '@/utils/getNodes'
import { haversineDistance as getDist } from '@/utils/groupCoordinates'
import useSWRImmutable from 'swr/immutable'
import { useSWRConfig } from 'swr'
import { sample, uniq } from 'lodash'

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

export const useMoney = () => {
  const homeNode = useNodeState(homeId)
  const money = useMemo(() => homeNode.node?.money ?? 0, [homeNode])
  return money
}

export const useNodeState = (nodeId?: number) => {
  // const { nodes } = useWorldState()
  const { data } = useSWRImmutable<FullNode | null>(
    nodeId && nodeId !== -1 ? `node-${nodeId}` : undefined,
    () => null,
  )
  // const setNode = (changes: Partial<FullNode>) => {
  //   mutate(
  //     (node) => {
  //       if (node) {
  //         return { ...node, ...changes }
  //       } else {
  //         return {
  //           ...nodes.find((n) => n.id === nodeId)!,
  //           ...changes,
  //         }
  //       }
  //     },
  //     { revalidate: false },
  //   )
  // }
  return { node: data }
}

export const useWorldState = () => {
  const { mutate, cache } = useSWRConfig()
  const [nodes, setNodes] = useState<Node[]>([])
  const [isAutoHackEnabled, setIsAutoHackEnabled] = useState(false)
  const { renderedNodeIds, addRenderedNodes } = useRenderedNodeIds()
  const { selectedNodeId, setSelectedNodeId } = useSelectedNodeId()
  const zoomRef = useRef<Zoom | null>(null)
  const worldSvgMountCallback = useCallback(
    (node: SVGGElement) => setNodes(getNodes(node)),
    [],
  )

  const getNode = useCallback(
    (id: number) => cache.get(`node-${id}`)?.data as FullNode | undefined,
    [cache],
  )
  const updateNode = useCallback(
    (nodeId: number, changes: Partial<FullNode>) => {
      if (nodes.length === 0 || typeof nodeId !== 'number') return
      mutate(
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
    [nodes, mutate, addRenderedNodes],
  )

  useEffect(() => {
    if (nodes.length === 0) return

    const home = getNode(homeId)
    if (!home)
      updateNode(homeId, { money: initialMoney, isOwned: true, isHome: true })
  }, [updateNode, nodes, getNode])

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

  const onScanStart = useCallback(
    (id: number) => {
      updateNode(id, { scanDuration: scanTime })
    },
    [updateNode],
  )

  const onScanFinish = useCallback(
    (id: number) => {
      const node = nodes.find((n) => n.id === id)
      if (node) {
        const closestNode = nodes
          .filter(
            (n) =>
              !renderedNodeIds.includes(n.id) &&
              getDist(node, n) < discoveryRange,
          )
          .map((n) => ({ id: n.id, dist: getDist(node, n) }))
          .sort((a, b) => a.dist - b.dist)
          .at(0)

        if (closestNode) {
          updateNode(closestNode.id, {
            isScanned: true,
            target: id,
            money: initialMoney,
          })
        }
      }
    },
    [nodes, renderedNodeIds, updateNode],
  )

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

  const onToggleAutohack = useCallback(() => {
    setIsAutoHackEnabled((h) => !h)
  }, [])

  const actions = useMemo(() => {
    return [
      {
        label: 'scan',
        getIsVisible: (node: FullNode) =>
          node && node.isOwned && !node.scanDuration,
        onClick: (node: FullNode) => onScanStart(node.id),
      },
      {
        label: 'hack',
        getIsVisible: (node: FullNode) =>
          node && node.isScanned && !node.isOwned,
        onClick: (node: FullNode) => onHackStart(node.id),
      },
    ].filter(Boolean)
  }, [onHackStart, onScanStart])

  const tickspeed = baseTickspeed

  const onAutohack = useCallback(() => {
    if (!isAutoHackEnabled) return
    const nodes = renderedNodeIds.map(getNode)
    const possibleScanNodes = nodes.filter((n) => n?.isOwned && !n.scanDuration)
    const possibleHackNodes = nodes.filter(
      (n) => !n?.isOwned && !n?.hackDuration,
    )
    const nodeToScan = sample(possibleScanNodes)
    const nodeToHack = sample(possibleHackNodes)
    if (nodeToHack) {
      onHackStart(nodeToHack.id)
    } else if (nodeToScan) {
      onScanStart(nodeToScan.id)
    }
  }, [getNode, isAutoHackEnabled, onHackStart, onScanStart, renderedNodeIds])

  const doTick = useCallback(() => {
    renderedNodeIds.forEach((nodeId) => {
      const node = getNode(nodeId)
      const target = getNode(node?.target ?? -1)
      if (node && target) {
        let update: Partial<FullNode> = {}
        if (target && node.outgoingMoney) {
          update.money = (target?.money ?? 0) + node.outgoingMoney
        }

        updateNode(node.target!, update)
      }

      if (node) {
        let update: Partial<FullNode> = {}
        if (target && node.isOwned) {
          let outgoingMoney = 1
          let currentMoney = node?.money ?? 0
          if (currentMoney < outgoingMoney) {
            outgoingMoney = currentMoney
          }
          currentMoney -= outgoingMoney
          update.money = currentMoney
          update.outgoingMoney = outgoingMoney
        }

        if (node.scanDuration) {
          update.scanDuration = node.scanDuration - 1
          if (update.scanDuration === 0) {
            onScanFinish(nodeId)
          }
        }

        if (node.hackDuration) {
          update.hackDuration = node.hackDuration - 1
          if (update.hackDuration === 0) {
            onHackFinish(nodeId)
          }
        }

        updateNode(nodeId, update)
      }
    })

    onAutohack()

    // autosave each tick
    if (!isDeletingSave) {
      const appCache = Array.from(cache.keys()).map((key) => [
        key,
        cache.get(key),
      ])
      localStorage.setItem('app-cache', JSON.stringify(appCache))
    }
  }, [
    renderedNodeIds,
    getNode,
    cache,
    onHackFinish,
    onAutohack,
    onScanFinish,
    updateNode,
  ])

  useEffect(() => {
    const intervalId = setInterval(doTick, tickspeed)
    return () => clearInterval(intervalId)
  }, [tickspeed, doTick])

  const onDeselect = useCallback(() => {
    setSelectedNodeId(-1)
  }, [setSelectedNodeId])

  return {
    nodes,
    renderedNodeIds,
    actions,
    zoomRef,
    selectedNodeId,
    worldSvgMountCallback,
    onDeselect,
    onClickNode,
    tickspeed,
    onToggleAutohack,
  }
}
