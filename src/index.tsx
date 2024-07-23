import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ParentSize } from '@visx/responsive'
import { WorldMap } from '@/components/WorldMap'
import '@/styles/globals.css'

const container = document.getElementById('root') as HTMLElement

const root = createRoot(container)

root.render(
  <StrictMode>
    <main className="flex justify-center items-center h-screen">
      <div className="w-screen h-screen rounded-xl p-2 overflow-hidden max-w-[1600px] max-h-[1050px] relative">
        {/* <Crosshair /> */}
        <ParentSize>
          {({ width, height }) => <WorldMap width={width} height={height} />}
        </ParentSize>
      </div>
    </main>
  </StrictMode>,
)
