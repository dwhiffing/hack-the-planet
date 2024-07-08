import { WorldMap } from '@/components/WorldMap'
import { ParentSize } from '@visx/responsive'

export default function Home() {
  return (
    <main className="w-screen h-screen rounded-xl p-2 overflow-hidden">
      <ParentSize>
        {({ width, height }) => <WorldMap width={width} height={height} />}
      </ParentSize>
    </main>
  )
}
