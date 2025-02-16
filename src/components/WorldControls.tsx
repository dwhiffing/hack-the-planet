import React, { memo } from 'react'

import { IMapProps } from '@/types'

import { useSnapshot } from 'valtio'
import { store } from '@/utils/valtioState'
import { NodeControls } from './NodeControls'
import { SaveControls } from './SaveControls'
import { getUpgradeEffect } from '@/utils/upgrades'

export const MapStats = () => {
  const { money, points, moneyPerTick } = useSnapshot(store)
  return (
    <div>
      <p>
        points: {points.toFixed(2)}/{getUpgradeEffect('max-points')}
      </p>
      <p>Money: {formatMoney(money)}</p>
      <p>Income: {formatMoney(moneyPerTick)}</p>
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
          <div className="pointer-events-auto absolute inset-x-3 bottom-1 z-20 my-2 max-h-[300px] overflow-scroll rounded-md border border-[#000] bg-[#222] p-2 md:right-auto md:top-1 md:max-h-none md:w-full md:max-w-[300px] md:p-4">
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
