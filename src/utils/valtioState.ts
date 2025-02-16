import {
  homeId,
  initialMoney,
  minScanPoints,
  saveRate,
  UPGRADES,
} from '@/constants/index'
import { FullNode, IUpgradeKey, IUpgradeState, Node, NodeGroup } from '@/types'
import { proxy } from 'valtio'

import { uniq } from 'lodash'

type IState = {
  points: number
  pointsPerTick: number
  hasResetSave: boolean
  money: number
  moneyPerTick: number
  suspicion: number
  selectedNodeId: number
  saveCounter: number
  autoHackTime: number
  renderedNodeIds: number[]
  upgrades: Record<IUpgradeKey, IUpgradeState>
  allNodes: Node[]
  nodes: Record<number, FullNode>
  groupedNodes: Record<string, NodeGroup>
}
type ISerializedState = {
  points: number
  money: number
  suspicion: number
  autoHackTime: number
  selectedNodeId: number
  upgrades: Record<string, IUpgradeState>
  unownedNodeIds: number[]
  nodeConnections: Record<number, number>
}

export const initialUpgrades = UPGRADES.reduce(
  (obj, u) => ({
    ...obj,
    [u.key]: { key: u.key, level: 0 },
  }),
  {},
) as Record<string, IUpgradeState>

const initialState: IState = {
  money: initialMoney,
  points: minScanPoints,
  hasResetSave: false,
  pointsPerTick: 0,
  moneyPerTick: 0,
  suspicion: 0,
  autoHackTime: 0,
  saveCounter: saveRate,
  renderedNodeIds: [],
  upgrades: initialUpgrades,
  allNodes: [],
  selectedNodeId: homeId,
  groupedNodes: {},
  nodes: {},
}

// Take state and convert it into a serializable save
export const serializeSave = (state: IState) => {
  const nodeConnections: Record<number, number> = {}
  const unownedNodeIds: number[] = []
  Object.values(state.nodes).forEach((node) => {
    if (node.target) {
      nodeConnections[node.id] = node.target
      if (!node.isOwned) unownedNodeIds.push(node.id)
    }
  })
  const serialized: ISerializedState = {
    points: state.points,
    money: state.money,
    suspicion: state.suspicion,
    autoHackTime: state.autoHackTime,
    selectedNodeId: state.selectedNodeId,
    upgrades: state.upgrades,
    unownedNodeIds,
    nodeConnections,
  }
  return JSON.stringify(serialized)
}

// Take save and convert it back into state
export const deserializeSave = (save: string) => {
  const _serializedState: ISerializedState = JSON.parse(save)

  const renderedNodeIds = uniq([
    homeId,
    ...Object.entries(_serializedState.nodeConnections).flatMap(([k, v]) => [
      +k,
      v,
    ]),
  ])

  const nodes: Record<number, FullNode> = {}
  renderedNodeIds.forEach((nodeId) => {
    const node = store.allNodes.find((n) => n.id === +nodeId)!
    const target = _serializedState.nodeConnections[node.id]
    const sources = Object.entries(_serializedState.nodeConnections)
      .filter(([_nodeId, _targetId]) => _targetId === +nodeId)
      .map(([k, v]) => v)

    nodes[+nodeId] = {
      ...node,
      type: +nodeId === homeId ? 'home' : node.type,
      scanDuration: 0,
      hackDuration: 0,
      isOwned: !_serializedState.unownedNodeIds.includes(nodeId),
      sources,
      target,
    }
  })

  store.points = _serializedState.points
  store.money = _serializedState.money
  store.suspicion = _serializedState.suspicion
  store.autoHackTime = _serializedState.autoHackTime
  store.selectedNodeId = _serializedState.selectedNodeId
  store.renderedNodeIds = renderedNodeIds
  store.upgrades = _serializedState.upgrades
  store.nodes = nodes
}

export const store = proxy(initialState)
