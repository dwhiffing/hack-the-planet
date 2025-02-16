export type NodeGroup = {
  key: string
  nodes: Node[]
}

export type IMapProps = {
  onClickHome: () => void
  onZoomOut: () => void
  onZoomIn: () => void
}
export type INodeAction = {
  label: string
  description: string
  getIsVisible: (node: FullNode, points: number) => boolean | undefined
  getIsDisabled: (node: FullNode, points: number) => boolean | undefined
  onClick: (node: FullNode) => void
}

export type IGlobalAction = {
  label: string
  description: string
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
  type: INodeType
  id: number
  r?: number
}

export type PublicNodeState = {
  isOwned?: boolean
  scanDuration?: number
  scanRange?: number
  hackDuration?: number
  pointCost?: number
  sources?: number[]
  target?: number
}

export type FullNode = Node & PublicNodeState

export type INodeType = 'basic' | 'bank' | 'home' | 'rich'
export type INodeConfig = {
  incomeMin: number
  incomeMax: number
  suspicionMin: number
  suspicionMax: number
  hackDifficultyMin: number
  hackDifficultyMax: number
}

export type IUpgrade = {
  name: string
  description: string
  key: IUpgradeKey
  requiredNodes: number
  costs?: number[]
  maxLevel?: number
  costExponent?: number
  baseCost?: number
}

export type IUpgradeState = {
  key: string
  level: number
}
export type IUpgradeKey =
  | 'autoscan'
  | 'scan-efficiency'
  | 'scan-speed'
  | 'hack-efficiency'
  | 'hack-speed'
  | 'steal-amount'
  | 'max-points'
  | 'point-amount'
  | 'suspicion-decay'
