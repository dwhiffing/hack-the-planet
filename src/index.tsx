import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ParentSize } from '@visx/responsive'
import { WorldMap } from '@/components/WorldMap'
import '@/styles.css'

const container = document.getElementById('root') as HTMLElement

const root = createRoot(container)

root.render(
  <StrictMode>
    <main className="flex h-screen items-center justify-center">
      <div className="relative h-screen w-screen overflow-hidden lg:rounded-xl lg:p-2">
        <ParentSize>
          {({ width, height }) => <WorldMap width={width} height={height} />}
        </ParentSize>
      </div>
    </main>
  </StrictMode>,
)
