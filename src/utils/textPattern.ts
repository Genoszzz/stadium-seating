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
