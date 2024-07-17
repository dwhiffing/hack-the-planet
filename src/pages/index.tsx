import { WorldMap } from '@/components/WorldMap'
import { ParentSize } from '@visx/responsive'
import { SWRConfig } from 'swr'

export default function Home() {
  return (
    <SWRConfig value={{ provider: localStorageProvider }}>
      <main className="w-screen h-screen rounded-xl p-2 overflow-hidden">
        {/* <Crosshair /> */}
        <ParentSize>
          {({ width, height }) => <WorldMap width={width} height={height} />}
        </ParentSize>
      </main>
    </SWRConfig>
  )
}
const localStorageProvider = () =>
  typeof localStorage === 'undefined'
    ? new Map()
    : new Map(JSON.parse(localStorage.getItem('app-cache') || '[]'))
