import {
  homeId,
  initialMoney,
  startingPoints,
  saveRate,
  UPGRADES,
  baseTickspeed,
} from '@/constants/index'
import {
  FullNode,
  INodeType,
  IUpgradeKey,
  IUpgradeState,
  Node,
  NodeGroup,
} from '@/types'
import { proxy } from 'valtio'
import nodeOverrides from '@/constants/node-overrides.json'

import { uniq } from 'lodash'

type IState = {
  points: number
  pointsPerTick: number
  hasResetSave: boolean
  tickspeed: number
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
  nodeOverrides: INodeOverrides
}
type INodeOverrides = Record<
  string,
  { x?: number; y?: number; type?: INodeType }
>
type ISerializedNodeState = {
  maxScanRange: number
  isOwned: boolean
  target: number
}
type ISerializedState = {
  points: number
  money: number
  tickspeed: number
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
  tickspeed: baseTickspeed,
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
  nodeOverrides: nodeOverrides as INodeOverrides,
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
    tickspeed: state.tickspeed,
    autoHackTime: state.autoHackTime,
    selectedNodeId: state.selectedNodeId,
    upgrades: state.upgrades,
    nodeData,
  }
  return JSON.stringify(serialized)
}

// Take save and convert it back into state
export const deserializeSave = (save?: string | null) => {
  const _serializedState: ISerializedState | null = save
    ? JSON.parse(save)
    : null

  const renderedNodeIds =
    localStorage.getItem('show-all-nodes') === 'true'
      ? store.allNodes.map((n) => n.id)
      : _serializedState
        ? uniq([
            homeId,
            ...Object.entries(_serializedState.nodeData)
              .filter(([k, v]) => v.target)
              .flatMap(([k, v]) => [+k, v.target]),
          ])
        : [homeId]

  const nodes: Record<number, FullNode> = {}
  renderedNodeIds.forEach((nodeId) => {
    const node = store.allNodes.find((n) => n.id === +nodeId)!
    const nodeSavedData = _serializedState?.nodeData[node.id]
    const sources = Object.entries(_serializedState?.nodeData ?? {})
      .filter(([_nodeId, data]) => data.target === +nodeId)
      .map(([k, v]) => v.target)

    nodes[+nodeId] = {
      ...node,
      isOwned: +nodeId === homeId,
      ...nodeSavedData,
      type: +nodeId === homeId ? 'home' : node.type,
      lastScannedAt: -1,
      hackDuration: 0,
      stealDuration: 0,
      sources,
    }
  })
  if (_serializedState) {
    store.points = _serializedState.points
    store.money = _serializedState.money
    store.autoHackTime = _serializedState.autoHackTime
    store.selectedNodeId = _serializedState.selectedNodeId
    store.tickspeed = _serializedState.tickspeed
    store.upgrades = _serializedState.upgrades
  }

  store.renderedNodeIds = renderedNodeIds
  store.nodes = nodes
}

export const store = proxy(initialState)
