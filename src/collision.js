const FORGIVENESS = 0.85

export function overlaps(a, b) {
  const halfWidth = ((a.width + b.width) * FORGIVENESS) / 2
  const halfHeight = ((a.height + b.height) * FORGIVENESS) / 2
  return Math.abs(a.x - b.x) < halfWidth && Math.abs(a.y - b.y) < halfHeight
}

export function hitAny(box, boxes) {
  for (const other of boxes) {
    if (overlaps(box, other)) return true
  }
  return false
}
