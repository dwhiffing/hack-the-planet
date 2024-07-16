export function Crosshair() {
  return (
    <div className="pointer-events-none">
      <div className="absolute inset-0 z-10 flex justify-center items-center">
        <div className="h-screen w-px bg-[#0001]" />
      </div>
      <div className="absolute inset-0 z-10 flex justify-center items-center">
        <div className="w-screen h-px bg-[#0001]" />
      </div>
    </div>
  )
}
