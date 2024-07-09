import React from 'react'
import { Zoom } from '@vx/zoom'
import { background } from '@/constants'
import { WorldSvg } from './WorldSvg'
import { NetworkGraph } from './NetworkGraph'

export function WorldMap({ width, height }: { width: number; height: number }) {
  const scale = 200
  const translate = [width / 2, height / 2] as [number, number]

  if (width === 0 && height === 0) return null
  return (
    // @ts-ignore
    <Zoom
      className="relative"
      width={width}
      height={height}
      scaleXMin={1}
      scaleXMax={500}
      scaleYMin={1}
      scaleYMax={500}
      wheelDelta={(e) => {
        const f = 1 + -0.01 * e.deltaY
        return { scaleX: f, scaleY: f }
      }}
      transformMatrix={{
        scaleX: 1,
        scaleY: 1,
        skewX: 0,
        skewY: 0,
        translateX: 0,
        translateY: 0,
      }}
    >
      {(zoom) => (
        <>
          <svg
            className="rounded-xl overflow-hidden"
            width={width}
            height={height}
            style={{ cursor: zoom.isDragging ? 'grabbing' : 'grab' }}
          >
            <rect x={0} y={0} width={width} height={height} fill={background} />

            <g transform={zoom.toString()}>
              <WorldSvg scale={scale} translate={translate} />
            </g>

            <rect
              width={width}
              height={height}
              fill="transparent"
              style={{ zIndex: 9, position: 'relative' }}
              onMouseDown={zoom.dragStart}
              onMouseMove={zoom.dragMove}
              onMouseUp={zoom.dragEnd}
              onMouseLeave={() => {
                if (zoom.isDragging) zoom.dragEnd()
              }}
            />
            <g
              style={{ pointerEvents: zoom.isDragging ? 'none' : 'auto' }}
              transform={zoom.toString()}
            >
              <NetworkGraph scale={scale} translate={translate} zoom={zoom} />
            </g>
          </svg>

          <div className="absolute top-4 right-4 flex flex-col items-end">
            <button onClick={() => zoom.scale({ scaleX: 1.2 })}>+</button>
            <button onClick={() => zoom.scale({ scaleX: 0.8 })}>-</button>
            <button
              onClick={() =>
                zoom.setTransformMatrix({
                  ...zoom.transformMatrix,
                  translateX: width / 2,
                  translateY: height / 2,
                })
              }
            >
              Center
            </button>
          </div>
        </>
      )}
    </Zoom>
  )
}
