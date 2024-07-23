import { homeId, initialMoney, saveRate, UPGRADES } from '@/constants/index'
import { FullNode, IUpgradeState, Node, NodeGroup } from '@/types'
import { proxy } from 'valtio'

import { uniq } from 'lodash'

export const initialUpgrades = UPGRADES.reduce(
  (obj, u) => ({
    ...obj,
    [u.key]: { key: u.key, level: 0 },
  }),
  {},
) as Record<string, IUpgradeState>

type IState = {
  money: number
  incomePerTick: number
  suspicion: number
  selectedNodeId: number
  saveCounter: number
  autoHackTime: number
  renderedNodeIds: number[]
  upgrades: Record<string, IUpgradeState>
  allNodes: Node[]
  nodes: Record<number, FullNode>
  groupedNodes: Record<string, NodeGroup>
}

const initialState: IState = {
  money: initialMoney,
  incomePerTick: 0,
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
type ISerializedState = {
  money: number
  suspicion: number
  autoHackTime: number
  selectedNodeId: number
  upgrades: Record<string, IUpgradeState>
  nodeConnections: Record<number, number>
}

// Take state and convert it into a serializable save
export const serializeSave = (state: IState) => {
  const nodeConnections: Record<number, number> = {}
  Object.values(state.nodes).forEach((node) => {
    if (node.target) nodeConnections[node.id] = node.target
  })
  const serialized: ISerializedState = {
    money: state.money,
    suspicion: state.suspicion,
    autoHackTime: state.autoHackTime,
    selectedNodeId: state.selectedNodeId,
    upgrades: state.upgrades,
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
      isOwned: sources.length > 0,
      sources,
      target,
    }
  })
  store.money = _serializedState.money
  store.suspicion = _serializedState.suspicion
  store.autoHackTime = _serializedState.autoHackTime
  store.selectedNodeId = _serializedState.selectedNodeId
  store.renderedNodeIds = renderedNodeIds
  store.upgrades = _serializedState.upgrades
  store.nodes = nodes
}

export const store = proxy(initialState)
