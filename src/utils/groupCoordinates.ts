export function groupCoordinates(
  coords: { x: number; y: number }[],
  maxDistance: number,
) {
  const groups = []

  for (let coord of coords) {
    let added = false

    for (let group of groups) {
      for (let member of group) {
        if (haversineDistance(coord, member) <= maxDistance) {
          group.push(coord)
          added = true
          break
        }
      }
      if (added) break
    }

    if (!added) {
      groups.push([coord])
    }
  }

  return groups
}
function haversineDistance(
  coord1: { x: number; y: number },
  coord2: { x: number; y: number },
) {
  const R = 6371 // Earth's radius in kilometers
  const x1 = coord1.x * (Math.PI / 180)
  const y1 = coord1.y * (Math.PI / 180)
  const x2 = coord2.x * (Math.PI / 180)
  const y2 = coord2.y * (Math.PI / 180)

  const dx = x2 - x1
  const dy = y2 - y1

  const a =
    Math.sin(dx / 2) * Math.sin(dx / 2) +
    Math.cos(x1) * Math.cos(x2) * Math.sin(dy / 2) * Math.sin(dy / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}
