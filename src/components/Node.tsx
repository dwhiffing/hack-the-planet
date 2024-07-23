import React, { memo, useRef } from 'react'
import { Group } from '@visx/group'
import { CSSTransition } from 'react-transition-group'

import { pxPerKM } from '@/constants/index'
import { getUpgradeEffect } from '@/utils/upgrades'
import { useSnapshot } from 'valtio'
import { store } from '@/utils/valtioState'

export const Node = memo(function Node(props: {
  nodeId: number
  isSelected: boolean
  tickspeed: number
}) {
  const { [props.nodeId]: node } = useSnapshot(store.nodes)
  const nodeRef = useRef(null)

  if (!node) return null

  const fill =
    node.type === 'home'
      ? '#f0f'
      : node.isOwned
      ? node.type === 'bank'
        ? '#0000ff'
        : node.type === 'rich'
        ? '#00ff00'
        : '#ff0000'
      : node.hackDuration
      ? '#ffff00'
      : '#999'

  const size = node.type === 'bank' ? 0.4 : node.type === 'rich' ? 0.3 : 0.2
  const s = props.isSelected ? size * 1.5 : size

  return (
    <Group className="node" left={node.x} top={node.y}>
      <CSSTransition
        nodeRef={nodeRef}
        in={(node.scanDuration ?? 0) > 0}
        timeout={500}
        classNames="fade"
        unmountOnExit
      >
        <path
          ref={nodeRef}
          className={`pointer-events-none`}
          d={drawScan(0, 0, pxPerKM * getUpgradeEffect('scan-range'), 0, 40)}
          fill="#ff000033"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0"
            to="-360"
            dur={`${props.tickspeed * 5}ms`}
            repeatCount="indefinite"
          />
        </path>
      </CSSTransition>

      <circle
        x={s * -0.5}
        y={s * -0.5}
        onMouseDown={() => {
          if (store.selectedNodeId === -1) {
            store.selectedNodeId = props.nodeId
          } else if (props.nodeId === store.selectedNodeId) {
            store.selectedNodeId = -1
          } else {
            store.selectedNodeId = props.nodeId
          }
        }}
        r={s / 2}
        stroke="#fff"
        style={{
          transition:
            'all 150ms cubic-bezier(0.4, 0, 0.2, 1), fill 500ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        strokeWidth={props.isSelected ? 0.01 : 0}
        fill={fill}
      />
    </Group>
  )
})

const drawScan = (
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) => {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  const d = [
    'M',
    x,
    y,
    'L',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    'Z',
  ].join(' ')

  return d
}

const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}
