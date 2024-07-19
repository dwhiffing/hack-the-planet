import { useCallback, useRef } from 'react'
import { homeId, zoomScale } from '@/constants'
import { coordsToTransform } from '@/utils/geo'
import { useNodes } from './useNodeState'
import { Zoom } from '@vx/zoom'

export const useZoom = (width: number, height: number) => {
  const zoomRef = useRef<Zoom | null>(null)
  const mouseRef = useRef<{ x: number; y: number } | null>(null)
  const { nodes } = useNodes()

  const onClickHome = useCallback(() => {
    const home = nodes.find((n) => n.id == homeId)?.earthCoords
    if (home && width && height)
      zoomRef.current?.setTransformMatrix(
        coordsToTransform(home[0], home[1], zoomScale, width, height),
      )
  }, [width, height, zoomRef, nodes])

  return { onClickHome, zoomRef, mouseRef }
}
