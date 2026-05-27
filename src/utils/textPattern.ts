const F = false, T = true

const LETTER_DATA: Record<string, boolean[][]> = {
  A: [
    [F,T,T,T,F],[T,F,F,F,T],[T,T,T,T,T],[T,F,F,F,T],[T,F,F,F,T],[T,F,F,F,T],[T,F,F,F,T],
  ],
  B: [
    [T,T,T,T,F],[T,F,F,F,T],[T,T,T,T,F],[T,F,F,F,T],[T,F,F,F,T],[T,F,F,F,T],[T,T,T,T,F],
  ],
  C: [
    [F,T,T,T,T],[T,F,F,F,F],[T,F,F,F,F],[T,F,F,F,F],[T,F,F,F,F],[T,F,F,F,F],[F,T,T,T,T],
  ],
  D: [
    [T,T,T,F,F],[T,F,F,T,F],[T,F,F,F,T],[T,F,F,F,T],[T,F,F,F,T],[T,F,F,T,F],[T,T,T,F,F],
  ],
  E: [
    [T,T,T,T,T],[T,F,F,F,F],[T,T,T,T,F],[T,F,F,F,F],[T,F,F,F,F],[T,F,F,F,F],[T,T,T,T,T],
  ],
  F: [
    [T,T,T,T,T],[T,F,F,F,F],[T,T,T,T,F],[T,F,F,F,F],[T,F,F,F,F],[T,F,F,F,F],[T,F,F,F,F],
  ],
  G: [
    [F,T,T,T,T],[T,F,F,F,F],[T,F,F,F,F],[T,F,T,T,T],[T,F,F,F,T],[T,F,F,F,T],[F,T,T,T,F],
  ],
  H: [
    [T,F,F,F,T],[T,F,F,F,T],[T,T,T,T,T],[T,F,F,F,T],[T,F,F,F,T],[T,F,F,F,T],[T,F,F,F,T],
  ],
  I: [
    [T,T,T],[F,T,F],[F,T,F],[F,T,F],[F,T,F],[F,T,F],[T,T,T],
  ],
  J: [
    [F,F,T,T,T],[F,F,F,T,F],[F,F,F,T,F],[F,F,F,T,F],[F,F,F,T,F],[T,F,F,T,F],[F,T,T,F,F],
  ],
  K: [
    [T,F,F,F,T],[T,F,F,T,F],[T,F,T,F,F],[T,T,F,F,F],[T,F,T,F,F],[T,F,F,T,F],[T,F,F,F,T],
  ],
  L: [
    [T,F,F,F,F],[T,F,F,F,F],[T,F,F,F,F],[T,F,F,F,F],[T,F,F,F,F],[T,F,F,F,F],[T,T,T,T,T],
  ],
  M: [
    [T,F,F,F,T],[T,T,F,T,T],[T,F,T,F,T],[T,F,F,F,T],[T,F,F,F,T],[T,F,F,F,T],[T,F,F,F,T],
  ],
  N: [
    [T,F,F,F,T],[T,T,F,F,T],[T,F,T,F,T],[T,F,F,T,T],[T,F,F,F,T],[T,F,F,F,T],[T,F,F,F,T],
  ],
  O: [
    [F,T,T,T,F],[T,F,F,F,T],[T,F,F,F,T],[T,F,F,F,T],[T,F,F,F,T],[T,F,F,F,T],[F,T,T,T,F],
  ],
  P: [
    [T,T,T,T,F],[T,F,F,F,T],[T,F,F,F,T],[T,T,T,T,F],[T,F,F,F,F],[T,F,F,F,F],[T,F,F,F,F],
  ],
  Q: [
    [F,T,T,T,F],[T,F,F,F,T],[T,F,F,F,T],[T,F,F,F,T],[T,F,T,F,T],[T,F,F,T,F],[F,T,T,F,T],
  ],
  R: [
    [T,T,T,T,F],[T,F,F,F,T],[T,F,F,F,T],[T,T,T,T,F],[T,F,T,F,F],[T,F,F,T,F],[T,F,F,F,T],
  ],
  S: [
    [F,T,T,T,T],[T,F,F,F,F],[F,T,T,T,F],[F,F,F,F,T],[F,F,F,F,T],[T,F,F,F,T],[F,T,T,T,F],
  ],
  T: [
    [T,T,T,T,T],[F,F,T,F,F],[F,F,T,F,F],[F,F,T,F,F],[F,F,T,F,F],[F,F,T,F,F],[F,F,T,F,F],
  ],
  U: [
    [T,F,F,F,T],[T,F,F,F,T],[T,F,F,F,T],[T,F,F,F,T],[T,F,F,F,T],[T,F,F,F,T],[F,T,T,T,F],
  ],
  V: [
    [T,F,F,F,T],[T,F,F,F,T],[T,F,F,F,T],[T,F,F,F,T],[T,F,F,F,T],[F,T,F,T,F],[F,F,T,F,F],
  ],
  W: [
    [T,F,F,F,T],[T,F,F,F,T],[T,F,F,F,T],[T,F,F,F,T],[T,F,T,F,T],[T,T,F,T,T],[T,F,F,F,T],
  ],
  X: [
    [T,F,F,F,T],[F,T,F,T,F],[F,F,T,F,F],[F,F,T,F,F],[F,T,F,T,F],[T,F,F,F,T],[T,F,F,F,T],
  ],
  Y: [
    [T,F,F,F,T],[F,T,F,T,F],[F,F,T,F,F],[F,F,T,F,F],[F,F,T,F,F],[F,F,T,F,F],[F,F,T,F,F],
  ],
  Z: [
    [T,T,T,T,T],[F,F,F,F,T],[F,F,F,T,F],[F,F,T,F,F],[F,T,F,F,F],[T,F,F,F,F],[T,T,T,T,T],
  ],
}

export function applyLetterToZone(
  seats: { id: string; row: number; col: number; isFixed: boolean }[],
  letter: string,
  startCol: number,
  startRow: number,
  letterWidth: number,
  letterHeight: number,
  maxCols: number,
): Set<string> {
  const matrix = LETTER_DATA[letter.toUpperCase()]
  if (!matrix) return new Set()

  const occupiedIds = new Set<string>()

  for (let mr = 0; mr < letterHeight && startCol < maxCols; mr++) {
    const srcRow = Math.floor((mr / letterHeight) * matrix.length)
    const targetRow = startRow + mr
    for (let mc = 0; mc < letterWidth && startCol + mc < maxCols; mc++) {
      const srcCol = Math.floor((mc / letterWidth) * (matrix[0]?.length || 5))
      if (matrix[srcRow] && matrix[srcRow][srcCol]) {
        for (const seat of seats) {
          if (seat.row === targetRow && seat.col === startCol + mc && !seat.isFixed) {
            occupiedIds.add(seat.id)
          }
        }
      }
    }
  }

  return occupiedIds
}

export function applyTextToAdaptiveSeats(
  seats: { id: string; row: number; col: number; isFixed: boolean; deleted: boolean }[],
  text: string,
): Set<string> {
  const letters = text.toUpperCase().split('').filter(letter => LETTER_DATA[letter])
  if (letters.length === 0) return new Set()

  const sourceRows = Math.max(...letters.map(letter => LETTER_DATA[letter].length))
  const sourceMatrix = Array.from({ length: sourceRows }, (_, row) => {
    return letters.flatMap((letter, letterIndex) => {
      const matrix = LETTER_DATA[letter]
      const sourceRow = Math.min(matrix.length - 1, Math.floor((row / sourceRows) * matrix.length))
      const gap = letterIndex === letters.length - 1 ? [] : [false]
      return [...matrix[sourceRow], ...gap]
    })
  })

  const availableSeats = seats.filter(seat => !seat.deleted)
  if (availableSeats.length === 0) return new Set()

  const rect = findBestAvailableRect(availableSeats, Math.max(1, letters.length))
  if (!rect) return new Set()

  const targetRows = rect.endRow - rect.startRow + 1
  const targetCols = rect.endCol - rect.startCol + 1
  const occupiedIds = new Set<string>()

  const sampleSource = (row: number, col: number) => {
    const yRatio = (row - rect.startRow + 0.5) / targetRows
    const xRatio = (col - rect.startCol + 0.5) / targetCols
    const sourceRow = Math.min(sourceMatrix.length - 1, Math.floor(yRatio * sourceMatrix.length))
    const sourceCol = Math.min(sourceMatrix[0].length - 1, Math.floor(xRatio * sourceMatrix[0].length))
    return sourceMatrix[sourceRow][sourceCol]
  }

  for (const seat of availableSeats) {
    if (seat.isFixed) continue
    if (seat.row < rect.startRow || seat.row > rect.endRow || seat.col < rect.startCol || seat.col > rect.endCol) continue
    if (sampleSource(seat.row, seat.col)) occupiedIds.add(seat.id)
  }

  return occupiedIds
}

function findBestAvailableRect(
  seats: { row: number; col: number }[],
  targetAspect: number,
): { startRow: number; endRow: number; startCol: number; endCol: number } | null {
  const rows = [...new Set(seats.map(seat => seat.row))].sort((a, b) => a - b)
  const cols = [...new Set(seats.map(seat => seat.col))].sort((a, b) => a - b)
  if (rows.length === 0 || cols.length === 0) return null

  const available = new Set(seats.map(seat => `${seat.row},${seat.col}`))
  const boundsCenterRow = (rows[0] + rows[rows.length - 1]) / 2
  const boundsCenterCol = (cols[0] + cols[cols.length - 1]) / 2
  const boundsHeight = rows[rows.length - 1] - rows[0] + 1
  const boundsWidth = cols[cols.length - 1] - cols[0] + 1
  let best: { startRow: number; endRow: number; startCol: number; endCol: number; score: number } | null = null

  for (const startRow of rows) {
    for (const endRow of rows) {
      if (endRow < startRow) continue
      for (const startCol of cols) {
        for (const endCol of cols) {
          if (endCol < startCol) continue

          let complete = true
          for (let row = startRow; row <= endRow && complete; row++) {
            for (let col = startCol; col <= endCol; col++) {
              if (!available.has(`${row},${col}`)) {
                complete = false
                break
              }
            }
          }
          if (!complete) continue

          const width = endCol - startCol + 1
          const height = endRow - startRow + 1
          const aspect = width / height
          const aspectMatch = Math.min(aspect / targetAspect, targetAspect / aspect)
          const centerRow = (startRow + endRow) / 2
          const centerCol = (startCol + endCol) / 2
          const rowOffset = boundsHeight > 1 ? Math.abs(centerRow - boundsCenterRow) / boundsHeight : 0
          const colOffset = boundsWidth > 1 ? Math.abs(centerCol - boundsCenterCol) / boundsWidth : 0
          const centerPenalty = rowOffset + colOffset
          const score = width * height * Math.pow(aspectMatch, 4) - centerPenalty

          if (!best || score > best.score) {
            best = { startRow, endRow, startCol, endCol, score }
          }
        }
      }
    }
  }

  return best
}
