export interface Seat {
  id: string
  row: number
  col: number
  x: number
  y: number
  occupied: boolean
  isFixed: boolean
  deleted: boolean
}

export interface SeatZone {
  id: string
  name: string
  rows: number
  cols: number
  seatWidth: number
  seatHeight: number
  gapX: number
  gapY: number
  x: number
  y: number
  rotation: number
  seats: Seat[]
  color: string
  arcStrength: number
}

export interface CanvasConfig {
  width: number
  height: number
  scale: number
  offsetX: number
  offsetY: number
}

export const ZONE_COLORS = [
  '#1677ff', '#52c41a', '#fa8c16', '#eb2f96',
  '#722ed1', '#13c2c2', '#f5222d', '#2f54eb',
  '#faad14', '#a0d911',
]

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10)
}

export function generateSeats(zone: SeatZone): Seat[] {
  const seats: Seat[] = []
  const { rows, cols, seatWidth, seatHeight, gapX, gapY, arcStrength } = zone
  const centerCol = (cols - 1) / 2

  let idCounter = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const sx = c * (seatWidth + gapX)
      const sy = r * (seatHeight + gapY) + arcStrength * 0.15 * (c - centerCol) * (c - centerCol)
      seats.push({
        id: `${zone.id}-${idCounter++}`,
        row: r,
        col: c,
        x: sx,
        y: sy,
        occupied: false,
        isFixed: false,
        deleted: false,
      })
    }
  }
  return seats
}

export function generateSeatsPreserving(zone: SeatZone): Seat[] {
  const newSeats = generateSeats(zone)
  const oldState = new Map<string, { occupied: boolean; isFixed: boolean; deleted: boolean }>()
  for (const s of zone.seats) {
    oldState.set(`${s.row},${s.col}`, { occupied: s.occupied, isFixed: s.isFixed, deleted: s.deleted })
  }
  return newSeats.map(s => {
    const prev = oldState.get(`${s.row},${s.col}`)
    if (prev) return { ...s, ...prev }
    return s
  })
}

export interface AppState {
  zones: SeatZone[]
  selectedZoneId: string | null
  selectedSeatId: string | null
  selectedSeatIds: Set<string>
  canvasConfig: CanvasConfig

  addZone: () => void
  importZone: (config: { name: string; rows: number; cols: number; seatWidth: number; seatHeight: number; gapX: number; gapY: number; x: number; y: number; rotation: number; color: string; arcStrength: number }, seats: { row: number; col: number; occupied: boolean; isFixed: boolean; deleted: boolean }[]) => void
  removeZone: (id: string) => void
  updateZone: (id: string, updates: Partial<SeatZone>) => void
  selectZone: (id: string | null) => void
  selectSeat: (id: string | null) => void

  setSelectedSeatIds: (ids: Set<string>) => void
  toggleOccupied: (seatId: string) => void
  setOccupied: (seatId: string) => void
  setEmpty: (seatId: string) => void
  toggleFixedSeat: (seatId: string) => void
  deleteSeat: (zoneId: string, seatId: string) => void
  restoreSeat: (zoneId: string, seatId: string) => void
  clearAll: () => void
  fillLetterPattern: (text: string) => void
  batchDeleteSeats: (seatIds: string[]) => void

  setCanvasConfig: (updates: Partial<CanvasConfig>) => void
}
