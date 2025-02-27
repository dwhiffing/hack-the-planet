import React, { memo, useEffect, useRef, useState } from 'react'

import { useSnapshot } from 'valtio'
import { store } from '@/utils/valtioState'
import { CSSTransition } from 'react-transition-group'
import { baseAnimationDuration } from '@/constants'

const baseSpacing = 0.01
export const Link = memo(function Link({ nodeId }: { nodeId: number }) {
  const { [nodeId]: source } = useSnapshot(store.nodes)
  const { [source?.target ?? -1]: target } = useSnapshot(store.nodes)
  const [isMounted, setIsMounted] = useState(false)
  const lineRef = useRef(null)

  useEffect(() => {
    if (source && target && !isMounted)
      setTimeout(() => {
        setIsMounted(true)
      }, baseAnimationDuration)
  }, [source, target, isMounted])

  if (!source || !target) return null

  const isTransferring = !!(source.stealDuration ?? 0)
  const notOwned = !source.isOwned
  const spacing = notOwned ? 0.01 : baseSpacing * 8
  const spacing2 = notOwned ? 0.1 : 0.05
  const strokeWidth = notOwned ? 0.01 : 0.02
  const strokeColor = isTransferring ? 'red' : notOwned ? '#ccc' : 'white'
  return (
    <CSSTransition
      nodeRef={lineRef}
      in={isMounted}
      timeout={baseAnimationDuration}
      classNames="fade"
      unmountOnExit
    >
      <line
        ref={lineRef}
        x1={source.x}
        y1={source.y}
        x2={target.x}
        y2={target.y}
        strokeWidth={strokeWidth}
        stroke={strokeColor}
        className={`link pointer-events-none transition-colors ${isTransferring ? 'transferring' : ''}`}
        strokeDasharray={`${spacing} ${spacing2}`}
        style={{
          animationDuration: `${baseAnimationDuration}ms`,
          transitionDuration: `${baseAnimationDuration}ms`,
        }}
      >
        {(source.hackDuration ?? 0) > 0 && (
          <animate
            attributeName="stroke-dashoffset"
            values={`${(spacing + spacing2) * -8};0`}
            dur={`${baseAnimationDuration * 2}ms`}
            repeatCount="indefinite"
          />
        )}
      </line>
    </CSSTransition>
  )
})
