export type IMapProps = {
  money: number
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
  target?: number
  money?: number
  outgoingMoney?: number
}

export type FullNode = Node & PublicNodeState
