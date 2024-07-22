import { WorldMap } from '@/components/WorldMap'
import { ParentSize } from '@visx/responsive'
import { SWRConfig } from 'swr'

export default function Home() {
  return (
    <SWRConfig value={{ provider }}>
      <title>Hack the Planet</title>
      <main className="flex justify-center items-center h-screen">
        <div className="w-screen h-screen rounded-xl p-2 overflow-hidden max-w-[1600px] max-h-[1050px] relative">
          {/* <Crosshair /> */}
          <ParentSize>
            {({ width, height }) => <WorldMap width={width} height={height} />}
          </ParentSize>
        </div>
      </main>
    </SWRConfig>
  )
}

const provider = () => cache

export const cache = new Map()
