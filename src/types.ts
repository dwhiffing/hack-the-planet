export type IMapProps = {
  money: number
  suspicion: number
  selectedNodeActions: INodeAction[]
  globalActions: IGlobalAction[]
  selectedNodeId?: number
}
export type INodeAction = {
  label: string
  getIsVisible: (node: FullNode) => boolean | undefined
  getIsDisabled: (node: FullNode) => boolean | undefined
  onClick: (node: FullNode) => void
}

export type IGlobalAction = {
  label: string
  getIsVisible: () => boolean | undefined
  getIsDisabled: () => boolean | undefined
  onClick: () => void
}

export type Point = { x: number; y: number }

export type Node = {
  x: number
  y: number
  country: string
  earthCoords?: [number, number]
  id: number
  r?: number
}

export type PublicNodeState = {
  isHome?: boolean
  isOwned?: boolean
  isScanned?: boolean
  scanDuration?: number
  hackDuration?: number
  type?: INodeType
  sources?: number[]
  target?: number
  money?: number
  outgoingMoney?: number
}

export type FullNode = Node & PublicNodeState

export type INodeType = 'basic' | 'bank' | 'home'
export type INodeConfig = {
  startingMoneyMin: number
  startingMoneyMax: number
  incomeMin: number
  incomeMax: number
  suspicionMin: number
  suspicionMax: number
  hackDifficultyMin: number
  hackDifficultyMax: number
}

export type IUpgrade = {
  name: string
  key: IUpgradeKey
  maxLevel: number
  costExponent: number
  baseCost: number
}

export type IUpgradeState = {
  key: string
  level: number
}
export type IUpgradeKey =
  | 'scan-range'
  | 'autohack'
  | 'scan-efficiency'
  | 'scan-speed'
  | 'hack-efficiency'
  | 'hack-speed'
  | 'transfer-rate'
