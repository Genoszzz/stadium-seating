import { create } from 'zustand'
import { AppState, SeatZone, generateId, generateSeats, generateSeatsPreserving, ZONE_COLORS } from './types'
import { applyLetterToZone } from './utils/textPattern'

let zoneColorIndex = 0

const initialState = {
  zones: [] as SeatZone[],
  selectedZoneId: null as string | null,
  selectedSeatId: null as string | null,
  selectedSeatIds: new Set<string>() as Set<string>,
  canvasConfig: {
    width: 1600,
    height: 1000,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  },
}

export const useStore = create<AppState>((set, get) => ({
  ...initialState,

  addZone: () => {
    const color = ZONE_COLORS[zoneColorIndex % ZONE_COLORS.length]
    zoneColorIndex++
    const zone: SeatZone = {
      id: generateId(),
      name: `座位区 ${get().zones.length + 1}`,
      rows: 5,
      cols: 8,
      seatWidth: 40,
      seatHeight: 30,
      gapX: 8,
      gapY: 8,
      x: 100 + get().zones.length * 20,
      y: 100 + get().zones.length * 20,
      rotation: 0,
      seats: [],
      color,
      arcStrength: 0,
    }
    zone.seats = generateSeats(zone)
    set(s => ({ zones: [...s.zones, zone], selectedZoneId: zone.id }))
  },

  importZone: (config, savedSeats) => {
    const color = ZONE_COLORS[zoneColorIndex % ZONE_COLORS.length]
    zoneColorIndex++
    const id = generateId()
    const zone: SeatZone = {
      id,
      name: config.name,
      rows: config.rows,
      cols: config.cols,
      seatWidth: config.seatWidth,
      seatHeight: config.seatHeight,
      gapX: config.gapX,
      gapY: config.gapY,
      x: config.x,
      y: config.y,
      rotation: config.rotation,
      seats: [],
      color,
      arcStrength: config.arcStrength,
    }
    zone.seats = generateSeats(zone).map(s => {
      const match = savedSeats.find(ss => ss.row === s.row && ss.col === s.col)
      if (match) return { ...s, occupied: match.occupied, isFixed: match.isFixed, deleted: match.deleted }
      return s
    })
    set(s => ({ zones: [...s.zones, zone], selectedZoneId: zone.id }))
  },

  removeZone: (id) => {
    set(s => ({
      zones: s.zones.filter(z => z.id !== id),
      selectedZoneId: s.selectedZoneId === id ? null : s.selectedZoneId,
    }))
  },

  updateZone: (id, updates) => {
    set(s => ({
      zones: s.zones.map(z => {
        if (z.id !== id) return z
        const updated = { ...z, ...updates }
        if (
          'rows' in updates || 'cols' in updates || 'seatWidth' in updates ||
          'seatHeight' in updates || 'gapX' in updates || 'gapY' in updates ||
          'arcStrength' in updates
        ) {
          updated.seats = generateSeatsPreserving(updated)
        }
        return updated
      }),
    }))
  },

  selectZone: (id) => set({ selectedZoneId: id }),
  selectSeat: (id) => set({ selectedSeatId: id }),
  setSelectedSeatIds: (ids) => set({ selectedSeatIds: ids }),

  toggleOccupied: (seatId) => {
    set(s => ({
      zones: s.zones.map(z => ({
        ...z,
        seats: z.seats.map(seat => {
          if (seat.id === seatId && !seat.isFixed && !seat.deleted) {
            return { ...seat, occupied: !seat.occupied }
          }
          return seat
        }),
      })),
    }))
  },

  setOccupied: (seatId) => {
    set(s => ({
      zones: s.zones.map(z => ({
        ...z,
        seats: z.seats.map(seat => {
          if (seat.id === seatId && !seat.isFixed && !seat.deleted) {
            return { ...seat, occupied: true }
          }
          return seat
        }),
      })),
    }))
  },

  setEmpty: (seatId) => {
    set(s => ({
      zones: s.zones.map(z => ({
        ...z,
        seats: z.seats.map(seat => {
          if (seat.id === seatId && !seat.isFixed && !seat.deleted) {
            return { ...seat, occupied: false }
          }
          return seat
        }),
      })),
    }))
  },

  toggleFixedSeat: (seatId) => {
    set(s => ({
      zones: s.zones.map(z => ({
        ...z,
        seats: z.seats.map(seat => {
          if (seat.id === seatId && !seat.deleted) {
            return { ...seat, isFixed: !seat.isFixed, occupied: seat.isFixed ? seat.occupied : false }
          }
          return seat
        }),
      })),
    }))
  },

  deleteSeat: (zoneId, seatId) => {
    set(s => ({
      zones: s.zones.map(z => {
        if (z.id !== zoneId) return z
        return {
          ...z,
          seats: z.seats.map(seat =>
            seat.id === seatId && !seat.deleted
              ? { ...seat, deleted: true, occupied: false }
              : seat
          ),
        }
      }),
      selectedSeatId: s.selectedSeatId === seatId ? null : s.selectedSeatId,
    }))
  },

  restoreSeat: (zoneId, seatId) => {
    set(s => ({
      zones: s.zones.map(z => {
        if (z.id !== zoneId) return z
        return {
          ...z,
          seats: z.seats.map(seat =>
            seat.id === seatId && seat.deleted
              ? { ...seat, deleted: false, occupied: false }
              : seat
          ),
        }
      }),
    }))
  },

  clearAll: () => {
    set(s => ({
      zones: s.zones.map(z => ({
        ...z,
        seats: z.seats.map(seat =>
          seat.deleted ? seat : seat.isFixed ? seat : { ...seat, occupied: false }
        ),
      })),
    }))
  },

  fillLetterPattern: (text) => {
    const state = get()
    const chars = text.toUpperCase().split('').filter(c => /[A-Z]/.test(c))
    if (chars.length === 0 || state.zones.length === 0) return

    const zones = [...state.zones]
    const lettersPerZone: string[] = []

    if (zones.length >= chars.length) {
      for (let i = 0; i < chars.length; i++) {
        lettersPerZone.push(chars[i])
      }
    } else {
      const perZone = Math.ceil(chars.length / zones.length)
      for (let i = 0; i < zones.length; i++) {
        lettersPerZone.push(chars.slice(i * perZone, (i + 1) * perZone).join(''))
      }
    }

    const occupiedIdsByZone = new Map<string, Set<string>>()

    zones.forEach((zone, zi) => {
      if (zi >= lettersPerZone.length) return
      const letters = lettersPerZone[zi]
      const gap = 1
      const margin = 2
      const maxLetterW = Math.min(12, Math.floor((zone.cols - margin * 2) / letters.length))
      const letterWidth = Math.max(2, Math.min(maxLetterW, Math.floor((zone.cols - (letters.length - 1) * gap - margin * 2) / letters.length)))
      const letterHeight = Math.max(3, Math.min(Math.floor(letterWidth * 1.4), zone.rows - margin * 2))
      const totalPxWidth = letters.length * letterWidth + (letters.length - 1) * gap
      const startCol = Math.floor((zone.cols - totalPxWidth) / 2)
      const startRow = Math.floor((zone.rows - letterHeight) / 2)

      const occupiedIds = new Set<string>()
      let colOffset = startCol

      for (const letter of letters) {
        const ids = applyLetterToZone(
          zone.seats, letter, colOffset, startRow, letterWidth, letterHeight, zone.cols,
        )
        ids.forEach(id => occupiedIds.add(id))
        colOffset += letterWidth + gap
      }
      occupiedIdsByZone.set(zone.id, occupiedIds)
    })

    set(s => ({
      zones: s.zones.map(z => {
        const occIds = occupiedIdsByZone.get(z.id)
        if (!occIds) return z
        return {
          ...z,
          seats: z.seats.map(seat => {
            if (seat.deleted) return seat
            if (seat.isFixed) return seat
            return { ...seat, occupied: occIds.has(seat.id) }
          }),
        }
      }),
    }))
  },

  batchDeleteSeats: (seatIds) => {
    const idSet = new Set(seatIds)
    set(s => ({
      zones: s.zones.map(z => ({
        ...z,
        seats: z.seats.map(seat =>
          idSet.has(seat.id) && !seat.deleted
            ? { ...seat, deleted: true, occupied: false }
            : seat
        ),
      })),
      selectedSeatId: idSet.has(s.selectedSeatId ?? '') ? null : s.selectedSeatId,
      selectedSeatIds: new Set<string>(),
    }))
  },

  setCanvasConfig: (updates) => {
    set(s => ({ canvasConfig: { ...s.canvasConfig, ...updates } }))
  },
}))
