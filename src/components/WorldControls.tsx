import React, { memo } from 'react'

import { FullNode, IMapProps } from '@/types'

import { useSnapshot } from 'valtio'
import { store } from '@/utils/valtioState'
import { NodeControls } from './NodeControls'
import { SaveControls } from './SaveControls'

const MapStats = () => {
  const { money, incomePerTick, suspicion } = useSnapshot(store)
  return (
    <div>
      <p>Money: {formatMoney(money)}</p>
      <p>Income: {formatMoney(incomePerTick)}</p>
      <p>Suspicion: {(suspicion / 100).toFixed(2)}%</p>
    </div>
  )
}

export const MapControls = memo(function MapControls(props: IMapProps) {
  const { selectedNodeId } = useSnapshot(store)

  return (
    <div className="pointer-events-none absolute inset-0 inset-x-0 flex justify-between p-4 text-white">
      <div className="m-3">
        <MapStats />
        {selectedNodeId !== -1 && (
          <div className="pointer-events-auto absolute inset-x-3 bottom-1 z-20 my-2 max-h-[300px] overflow-scroll rounded-md border border-[#000] bg-[#222] p-2 md:right-auto md:top-1 md:max-h-none md:p-4">
            <NodeControls />
          </div>
        )}
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="flex gap-2">
          <button
            disabled={false}
            title="Go to home node"
            className={`pointer-events-auto`}
            onClick={props.onClickHome}
          >
            Home
          </button>
          <button className="pointer-events-auto" onClick={props.onZoomOut}>
            -
          </button>
          <button className="pointer-events-auto" onClick={props.onZoomIn}>
            +
          </button>
        </div>
        <SaveControls />
      </div>
    </div>
  )
})

export function formatMoney(number: number) {
  return number.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}
