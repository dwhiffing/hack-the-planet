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
  zoomScale,
} from '@/constants'
import { getNodes } from '@/utils/getNodes'
import { haversineDistance as getDist } from '@/utils/groupCoordinates'
import { useSWRConfig } from 'swr'
import { sample } from 'lodash'
import { coordsToTransform } from './coords'
import { clearLocalStorage, isDeletingSave } from './localStorage'
import { useMoney } from './useMoney'
import { calculateNextCost, UPGRADES, useUpgrades } from './useUpgrades'
import { useRenderedNodeIds, useSelectedNodeId } from './useNodeState'

export const useWorldState = (width: number, height: number) => {
  const { money } = useMoney()
  const { upgradeStates, buyUpgrade } = useUpgrades()
  const { mutate, cache } = useSWRConfig()
  const [nodes, setNodes] = useState<Node[]>([])
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

  const selectedNodeActions = useMemo(() => {
    return [
      {
        label: 'scan',
        getIsVisible: (node: FullNode) =>
          node && node.isOwned && !node.scanDuration,
        getIsDisabled: (node: FullNode) => false,
        onClick: (node: FullNode) => onScanStart(node.id),
      },
      {
        label: 'hack',
        getIsDisabled: (node: FullNode) => false,
        getIsVisible: (node: FullNode) =>
          node && node.isScanned && !node.isOwned,
        onClick: (node: FullNode) => onHackStart(node.id),
      },
    ].filter(Boolean)
  }, [onHackStart, onScanStart])

  const onClickHome = useCallback(() => {
    const home = nodes.find((n) => n.id == homeId)?.earthCoords
    if (home)
      zoomRef.current?.setTransformMatrix(
        coordsToTransform(...home, zoomScale, width, height),
      )
  }, [width, height, zoomRef, nodes])

  const globalActions = useMemo(() => {
    return [
      {
        label: 'Home',
        getIsVisible: () => true,
        getIsDisabled: () => false,
        onClick: onClickHome,
      },
      {
        label: 'Reset',
        getIsVisible: () => true,
        getIsDisabled: () => false,
        onClick: () => {
          const confirmed = confirm(
            'Are you sure you what to clear your save and restart?',
          )
          if (confirmed) clearLocalStorage()
        },
      },
      ...UPGRADES.map((upgrade) => {
        const state = upgradeStates?.[upgrade.key]
        const level = state?.level ?? 0
        const cost = state ? calculateNextCost(state.key, level) : 0
        const isMaxed = level === upgrade.maxLevel
        return {
          label: isMaxed
            ? `${upgrade.name} maxed`
            : `Upgrade ${upgrade.name} to level ${level + 1} $${cost}`,
          getIsVisible: () => true,
          getIsDisabled: () => money < cost || isMaxed,
          onClick: () => buyUpgrade(upgrade.key),
        }
      }),
    ]
  }, [onClickHome, buyUpgrade, money, upgradeStates])

  const onAutohack = useCallback(() => {
    if (!upgradeStates || upgradeStates.autohack.level === 0) return
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
  }, [getNode, onHackStart, onScanStart, renderedNodeIds, upgradeStates])

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
    const intervalId = setInterval(doTick, baseTickspeed)
    return () => clearInterval(intervalId)
  }, [doTick])

  const onDeselect = useCallback(() => {
    setSelectedNodeId(-1)
  }, [setSelectedNodeId])

  return {
    nodes,
    renderedNodeIds,
    selectedNodeActions,
    onClickHome,
    globalActions,
    zoomRef,
    selectedNodeId,
    worldSvgMountCallback,
    onDeselect,
    tickspeed: baseTickspeed,
  }
}
