import { homeId, initialMoney, saveRate, UPGRADES } from '@/constants'
import { FullNode, IUpgradeState, Node } from '@/types'
import { proxy } from 'valtio'
import { Group } from './getNodesWithDistance'

export const initialUpgrades = UPGRADES.reduce(
  (obj, u) => ({
    ...obj,
    [u.key]: {
      key: u.key,
      level: 0,
      nextCost: u.baseCost ?? u.costs?.[0] ?? 0,
    },
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
  groupedNodes: Record<string, Group>
}

type ISerializedState = {
  money: number
  suspicion: number
  // object showing what level each upgrade is at
  upgrades: Record<string, number>
  scannedNodeIds: number[]
  // object showing which nodes are connected
  nodeConnections: Record<number, number[]>
  timers: Record<string, number>
}
const state: IState = {
  money: initialMoney,
  incomePerTick: 0,
  suspicion: 0,
  autoHackTime: 0,
  saveCounter: saveRate,
  renderedNodeIds: [],
  allNodes: [],
  selectedNodeId: homeId,
  upgrades: initialUpgrades,
  groupedNodes: {},
  nodes: {},
}
const serializedState: ISerializedState = {
  money: 0,
  suspicion: 0,
  upgrades: {},
  scannedNodeIds: [],
  nodeConnections: {},
  timers: {},
}

export const store = proxy(state)

// Take state and convert it into a serializable save
export const serialize = (state: IState) => {
  return JSON.stringify({
    money: state.money,
    suspicion: state.suspicion,
    upgrades: {},
    scannedNodeIds: [],
    nodeConnections: {},
    timers: {},
  })
}

// Take save and convert it back into state
export const deserialize = (save: string) => {
  const _serializedState: ISerializedState = JSON.parse(save)

  return {
    money: _serializedState.money,
    suspicion: _serializedState.suspicion,
    upgrades: {},
    nodes: {},
  }
}
