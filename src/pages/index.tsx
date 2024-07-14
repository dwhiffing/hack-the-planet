import { WorldMap } from '@/components/WorldMap'
import { ParentSize } from '@visx/responsive'

export default function Home() {
  return (
    <main className="w-screen h-screen rounded-xl p-2 overflow-hidden">
      <div className="pointer-events-none">
        <div className="absolute inset-0 z-10 flex justify-center items-center">
          <div className="h-screen w-px bg-black" />
        </div>
        <div className="absolute inset-0 z-10 flex justify-center items-center">
          <div className="w-screen h-px bg-black" />
        </div>
      </div>
      <ParentSize>
        {({ width, height }) => <WorldMap width={width} height={height} />}
      </ParentSize>
    </main>
  )
}
