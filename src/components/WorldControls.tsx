import React, { memo, useMemo } from 'react'

import { IMapProps } from '@/types'

import { useSnapshot } from 'valtio'
import { store } from '@/utils/valtioState'
import { NodeControls } from './NodeControls'
import { SaveControls } from './SaveControls'
import { getMaxPoints, getUpgradeEffect } from '@/utils/upgrades'
import { baseTickspeed } from '@/constants'

export const MapStats = () => {
  const { money, points, pointsPerTick, moneyPerTick, upgrades } =
    useSnapshot(store)
  const tickMulti = 1000 / baseTickspeed
  // @ts-ignore
  const maxPoints = useMemo(() => getMaxPoints(), [upgrades])
  return (
    <div>
      <p>
        points: {points.toFixed(2)}/{maxPoints}({getUpgradeEffect('max-points')}
        )
      </p>
      <p>points income: {pointsPerTick * tickMulti}</p>
      <p>money: {formatMoney(money)}</p>
      <p>money income: {formatMoney(moneyPerTick * tickMulti)}</p>
    </div>
  )
}

export const MapControls = memo(function MapControls(props: IMapProps) {
  return (
    <div className="pointer-events-none absolute inset-0 inset-x-0 flex justify-between p-4 text-white">
      <div className="m-3">
        <MapStats />

        <NodeControls />
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
