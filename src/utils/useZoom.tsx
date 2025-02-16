import { useCallback, useRef } from 'react'
import { homeId, zoomScale } from '@/constants/index'
import { coordsToTransform } from '@/utils/geo'
import { Zoom } from '@vx/zoom'
import { store } from '@/utils/valtioState'

export const useZoom = (width: number, height: number) => {
  const zoomRef = useRef<Zoom | null>(null)
  const mouseRef = useRef<{ x: number; y: number } | null>(null)

  const onClickHome = useCallback(() => {
    const home = store.allNodes.find((n) => n.id == homeId)?.earthCoords
    if (home && width && height) {
      const offsetX = width >= 768 ? 150 : 0
      const offsetY = width >= 768 ? 0 : -150
      zoomRef.current?.setTransformMatrix(
        coordsToTransform(
          home[0],
          home[1],
          zoomScale,
          width,
          height,
          offsetX,
          offsetY,
        ),
      )
    }

    store.selectedNodeId = homeId
  }, [width, height, zoomRef])

  return { onClickHome, zoomRef, mouseRef }
}
