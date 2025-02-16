import {
  homeId,
  initialMoney,
  startingPoints,
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
  selectedNodeId: number
  saveCounter: number
  autoHackTime: number
  renderedNodeIds: number[]
  upgrades: Record<IUpgradeKey, IUpgradeState>
  allNodes: Node[]
  nodes: Record<number, FullNode>
  groupedNodes: Record<string, NodeGroup>
}
type ISerializedNodeState = {
  maxScanRange: number
  isOwned: boolean
  target: number
}
type ISerializedState = {
  points: number
  money: number
  autoHackTime: number
  selectedNodeId: number
  upgrades: Record<string, IUpgradeState>
  nodeData: Record<number, ISerializedNodeState>
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
  points: startingPoints,
  hasResetSave: false,
  pointsPerTick: 0,
  moneyPerTick: 0,
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
  const nodeData: Record<number, ISerializedNodeState> = {}
  Object.values(state.nodes)
    .filter((node) => node.target || node.id === homeId)
    .forEach((node) => {
      nodeData[node.id] = {
        target: node.target!,
        isOwned: !!node.isOwned,
        maxScanRange: node.maxScanRange ?? 0,
      }
    })
  const serialized: ISerializedState = {
    points: state.points,
    money: state.money,
    autoHackTime: state.autoHackTime,
    selectedNodeId: state.selectedNodeId,
    upgrades: state.upgrades,
    nodeData,
  }
  return JSON.stringify(serialized)
}

// Take save and convert it back into state
export const deserializeSave = (save: string) => {
  const _serializedState: ISerializedState = JSON.parse(save)

  const renderedNodeIds = uniq([
    homeId,
    ...Object.entries(_serializedState.nodeData)
      .filter(([k, v]) => v.target)
      .flatMap(([k, v]) => [+k, v.target]),
  ])

  const nodes: Record<number, FullNode> = {}
  renderedNodeIds.forEach((nodeId) => {
    const node = store.allNodes.find((n) => n.id === +nodeId)!
    const nodeSavedData = _serializedState.nodeData[node.id]
    const sources = Object.entries(_serializedState.nodeData)
      .filter(([_nodeId, data]) => data.target === +nodeId)
      .map(([k, v]) => v.target)

    nodes[+nodeId] = {
      ...node,
      ...nodeSavedData,
      type: +nodeId === homeId ? 'home' : node.type,
      scanDuration: 0,
      hackDuration: 0,
      stealDuration: 0,
      sources,
    }
  })

  store.points = _serializedState.points
  store.money = _serializedState.money
  store.autoHackTime = _serializedState.autoHackTime
  store.selectedNodeId = _serializedState.selectedNodeId
  store.renderedNodeIds = renderedNodeIds
  store.upgrades = _serializedState.upgrades
  store.nodes = nodes
}

export const store = proxy(initialState)
