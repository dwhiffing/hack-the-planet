import React, {
  memo,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from 'react'
import { CSSTransition } from 'react-transition-group'

import {
  baseAnimationDuration,
  baseTickspeed,
  pxPerKM,
} from '@/constants/index'
import { useSnapshot } from 'valtio'
import { store } from '@/utils/valtioState'
import { getScanRange } from '@/utils/scan'
import { getMaxPoints } from '@/utils/upgrades'

export const Node = memo(function Node(props: {
  nodeId: number
  isSelected: boolean
}) {
  const { [props.nodeId]: node } = useSnapshot(store.nodes)
  const scanRef = useRef(null)
  const nodeRef = useRef(null)
  const rangeRef = useRef(null)
  const [isMounted, setIsMounted] = useState(false)
  const [wasSelected, setWasSelected] = useState(false)
  const [animateScan, setAnimateScan] = useState(false)
  const [isAnimatable, setIsAnimatable] = useState(false)

  useEffect(() => {
    setAnimateScan(true)
    setTimeout(() => setAnimateScan(false), baseTickspeed * 3)
  }, [node?.lastScannedAt])

  useEffect(() => {
    if (node && !isMounted) setIsMounted(true)
  }, [node, isMounted])

  useEffect(() => {
    if (props.isSelected && !wasSelected) {
      setWasSelected(true)
      setTimeout(() => setIsAnimatable(true), 100)
    }
  }, [props.isSelected, wasSelected])

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

  const onClickNode = () => {
    if (store.selectedNodeId === -1) {
      store.selectedNodeId = props.nodeId
    } else if (props.nodeId === store.selectedNodeId) {
      store.selectedNodeId = -1
    } else {
      store.selectedNodeId = props.nodeId
    }
  }

  const timeout = baseAnimationDuration

  return (
    <>
      {wasSelected && (
        <g
          key={node.id}
          className="node"
          style={{ transform: `translate(${node.x}px,${node.y}px)` }}
        >
          <CSSTransition
            nodeRef={scanRef}
            in={isAnimatable && animateScan}
            timeout={timeout}
            classNames="fade"
            unmountOnExit
          >
            <path
              ref={scanRef}
              className={`pointer-events-none`}
              d={drawScan(0, 0, pxPerKM * (node.scanRange ?? 0), 0, 40)}
              fill="#0f03"
            >
              <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="rotate"
                from="0"
                to="-360"
                dur={`${timeout * 2}ms`}
                repeatCount="indefinite"
              />
            </path>
          </CSSTransition>
          <CSSTransition
            nodeRef={rangeRef}
            in={isAnimatable && props.isSelected && node.isOwned}
            timeout={timeout}
            classNames="fade"
            unmountOnExit
          >
            <ScanRange
              rangeRef={rangeRef}
              maxScanRange={node.maxScanRange ?? 0}
            />
          </CSSTransition>
        </g>
      )}

      <g
        className="node"
        style={{
          transform: `translate(${node.x}px,${node.y}px)`,
        }}
      >
        <circle
          ref={nodeRef}
          // cx={node.x}
          // cy={node.y}
          r={s / 2}
          onMouseDown={onClickNode}
          stroke={props.isSelected ? '#fff' : 'transparent'}
          className="node-circle cursor-pointer"
          opacity={isMounted ? 1 : 0}
          style={{
            transitionProperty: 'r, stroke, opacity',
            transitionDuration: `${timeout}ms`,
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          strokeWidth={0.01}
          fill={fill}
        />
      </g>
    </>
  )
})

const ScanRange = ({
  rangeRef,
  maxScanRange,
}: {
  rangeRef: MutableRefObject<null>
  maxScanRange: number
}) => {
  // subscribe to upgrades so that we re-render on max range increase
  const { points, upgrades } = useSnapshot(store)
  const dur = baseAnimationDuration

  return (
    <g ref={rangeRef} className="pointer-events-none">
      {/* current scan range */}
      <circle
        x={0}
        y={0}
        r={pxPerKM * getScanRange(points)}
        stroke="#0f0a"
        fill="#00ff0009"
        className="transition-all"
        style={{ transitionDuration: `${dur}ms` }}
        strokeWidth={0.01}
      />
      {/* max scanned range */}
      <circle
        x={0}
        y={0}
        r={pxPerKM * maxScanRange}
        stroke="#0f06"
        fill="transparent"
        className="transition-all"
        style={{ transitionDuration: `${dur}ms` }}
        strokeWidth={0.01}
        strokeDasharray="0.03 0.06"
      />
      {/* max possible range */}
      <circle
        x={0}
        y={0}
        r={pxPerKM * getScanRange(getMaxPoints())}
        stroke="#0f02"
        fill="transparent"
        className="transition-all"
        style={{ transitionDuration: `${dur}ms` }}
        strokeWidth={0.01}
      />
    </g>
  )
}

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
