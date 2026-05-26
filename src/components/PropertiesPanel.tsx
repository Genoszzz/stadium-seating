import React, { useMemo, useCallback } from 'react'
import { Settings, Trash2, MousePointerClick, ImageDown, FileDown } from 'lucide-react'
import { useStore } from '../store'
import type { SeatZone } from '../types'

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function exportZonePNG(zone: SeatZone) {
  const canvas = document.querySelector('.konvajs-content canvas') as HTMLCanvasElement | null
  if (!canvas) return

  const st = useStore.getState()
  const pr = window.devicePixelRatio || 1
  const scale = st.canvasConfig.scale
  const ox = st.canvasConfig.offsetX
  const oy = st.canvasConfig.offsetY

  const margin = 20
  const zoneW = zone.cols * (zone.seatWidth + zone.gapX)
  const zoneH = zone.rows * (zone.seatHeight + zone.gapY)

  const srcX = (zone.x * scale + ox - margin) * pr
  const srcY = (zone.y * scale + oy - margin) * pr
  const srcW = (zoneW * scale + margin * 2) * pr
  const srcH = (zoneH * scale + margin * 2) * pr

  const offscreen = document.createElement('canvas')
  offscreen.width = srcW * 2
  offscreen.height = srcH * 2
  const ctx = offscreen.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.drawImage(canvas, srcX, srcY, srcW, srcH, 0, 0, offscreen.width, offscreen.height)

  const link = document.createElement('a')
  link.download = `${zone.name}.png`
  link.href = offscreen.toDataURL('image/png')
  link.click()
}

function generateZoneMD(zone: SeatZone): string {
  const seatSymbol = (s: typeof zone.seats[number]) => {
    if (s.deleted) return '×'
    if (s.isFixed) return '■'
    if (s.occupied) return '●'
    return '○'
  }

  const maxCol = Math.max(...zone.seats.map(s => s.col))
  const maxRow = Math.max(...zone.seats.map(s => s.row))

  const colHeaders = Array.from({ length: maxCol + 1 }, (_, c) => c + 1).join('  ')
  const rowLines: string[] = []
  for (let r = 0; r <= maxRow; r++) {
    const rowSeats = zone.seats.filter(s => s.row === r).sort((a, b) => a.col - b.col)
    const symbols = Array.from({ length: maxCol + 1 }, (_, c) => {
      const seat = rowSeats.find(s => s.col === c)
      return seat ? seatSymbol(seat) : ' '
    }).join('  ')
    rowLines.push(`${String(r + 1).padStart(2, ' ')}  ${symbols}`)
  }

  const exportData = {
    name: zone.name,
    rows: zone.rows,
    cols: zone.cols,
    seatWidth: zone.seatWidth,
    seatHeight: zone.seatHeight,
    gapX: zone.gapX,
    gapY: zone.gapY,
    x: zone.x,
    y: zone.y,
    rotation: zone.rotation,
    color: zone.color,
    arcStrength: zone.arcStrength,
    seats: zone.seats.map(s => ({
      row: s.row,
      col: s.col,
      occupied: s.occupied,
      isFixed: s.isFixed,
      deleted: s.deleted,
    })),
  }

  return `# 座位区: ${zone.name}

| 属性 | 值 |
|------|------|
| 名称 | ${zone.name} |
| 行数 | ${zone.rows} |
| 列数 | ${zone.cols} |
| 座位宽 | ${zone.seatWidth}px |
| 座位高 | ${zone.seatHeight}px |
| 水平间距 | ${zone.gapX}px |
| 垂直间距 | ${zone.gapY}px |
| 位置 | (${zone.x}, ${zone.y}) |
| 旋转 | ${zone.rotation}° |
| 颜色 | ${zone.color} |
| 弧线强度 | ${zone.arcStrength} |

## 座位网格

\`\`\`
行\\列 ${colHeaders}
${rowLines.join('\n')}
\`\`\`

○=空闲  ●=已占  ■=固定  ×=已删除

\`\`\`json
${JSON.stringify(exportData, null, 2)}
\`\`\`
`
}

export function parseZoneMD(md: string): { zone: Omit<SeatZone, 'id' | 'seats'>; seats: { row: number; col: number; occupied: boolean; isFixed: boolean; deleted: boolean }[] } | null {
  const jsonMatch = md.match(/```json\s*\n([\s\S]*?)\n```/)
  if (!jsonMatch) return null
  try {
    const data = JSON.parse(jsonMatch[1])
    if (!data.name || !data.seats) return null
    const { seats, ...zoneConfig } = data
    return { zone: zoneConfig, seats }
  } catch {
    return null
  }
}

export function parseAllZonesMD(md: string): { zone: Omit<SeatZone, 'id' | 'seats'>; seats: { row: number; col: number; occupied: boolean; isFixed: boolean; deleted: boolean }[] }[] {
  const jsonMatch = md.match(/```json\s*\n\[([\s\S]*?)\]\n```/)
  if (jsonMatch) {
    try {
      const arr = JSON.parse(`[${jsonMatch[1]}]`)
      return Array.isArray(arr) ? arr.filter((d: any) => d.name && d.seats).map((d: any) => {
        const { seats, ...zoneConfig } = d
        return { zone: zoneConfig, seats }
      }) : []
    } catch { /* fall through */ }
  }
  const single = parseZoneMD(md)
  return single ? [single] : []
}

export function generateCanvasMD(zones: SeatZone[]): string {
  const exportData = zones.map(z => ({
    name: z.name,
    rows: z.rows,
    cols: z.cols,
    seatWidth: z.seatWidth,
    seatHeight: z.seatHeight,
    gapX: z.gapX,
    gapY: z.gapY,
    x: z.x,
    y: z.y,
    rotation: z.rotation,
    color: z.color,
    arcStrength: z.arcStrength,
    seats: z.seats.map(s => ({
      row: s.row,
      col: s.col,
      occupied: s.occupied,
      isFixed: s.isFixed,
      deleted: s.deleted,
    })),
  }))

  const zoneSummaries = zones.map(z => {
    const active = z.seats.filter(s => !s.deleted)
    const occ = active.filter(s => s.occupied).length
    return `- **${z.name}**: ${z.rows}×${z.cols}, ${occ}/${active.length} 已占`
  }).join('\n')

  return `# 排座布局 (${zones.length} 个区域)

## 区域列表

${zoneSummaries}

## 完整数据

\`\`\`json
${JSON.stringify(exportData, null, 2)}
\`\`\`
`
}

export default function PropertiesPanel() {
  const updateZone = useStore(s => s.updateZone)
  const removeZone = useStore(s => s.removeZone)
  const selectZone = useStore(s => s.selectZone)
  const selectSeat = useStore(s => s.selectSeat)
  const toggleOccupied = useStore(s => s.toggleOccupied)
  const deleteSeat = useStore(s => s.deleteSeat)
  const toggleFixedSeat = useStore(s => s.toggleFixedSeat)
  const selectedSeatId = useStore(s => s.selectedSeatId)
  const zone = useStore(s => s.zones.find(z => z.id === s.selectedZoneId) ?? null)
  const seatZone = useStore(s => selectedSeatId ? s.zones.find(z => z.seats.some(se => se.id === selectedSeatId)) ?? null : null)
  const selectedSeat = useMemo(() => seatZone?.seats.find(s => s.id === selectedSeatId) ?? null, [seatZone, selectedSeatId])

  const handleDelete = useCallback(() => {
    if (!zone) return
    removeZone(zone.id)
    selectZone(null)
  }, [zone, removeZone, selectZone])

  const handleExportPNG = useCallback(() => {
    if (!zone) return
    exportZonePNG(zone)
  }, [zone])

  const handleExportMD = useCallback(() => {
    if (!zone) return
    const md = generateZoneMD(zone)
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `${zone.name}.md`
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }, [zone])

  if (!zone) {
    if (selectedSeat && seatZone) {
      return (
        <div className="h-full flex flex-col p-3">
          <div className="flex items-center gap-2 pb-3">
            <Settings size={16} className="text-[#4fc3f7]" />
            <span className="text-sm font-semibold text-[#c8d6e5]">座位属性</span>
          </div>
          <div className="cyber-divider mb-3" />
          <div className="flex-1 space-y-3">
            <div>
              <label className="cyber-label">所在区域</label>
              <span className="text-sm text-[#4fc3f7] font-mono">{seatZone.name}</span>
            </div>
            <div>
              <label className="cyber-label">座位编号</label>
              <span className="text-sm text-[#8899aa] font-mono">{selectedSeat.row + 1}行 {selectedSeat.col + 1}列</span>
            </div>
            <div>
              <label className="cyber-label">状态</label>
              {selectedSeat.deleted ? (
                <span className="cyber-tag-gold">已删除</span>
              ) : selectedSeat.occupied ? (
                <span className="cyber-tag-green">已占座</span>
              ) : (
                <span className="cyber-tag">空闲</span>
              )}
            </div>
            <div>
              <label className="cyber-label">固定</label>
              <span className={selectedSeat.isFixed ? 'cyber-tag-gold' : 'text-[#556] text-sm'}>{selectedSeat.isFixed ? '已固定' : '否'}</span>
            </div>
          </div>
          <div className="flex-shrink-0 pt-3">
            <div className="cyber-divider mb-3" />
            <div className="text-[10px] text-[#556] mb-2 font-mono tracking-wider">快捷键: Space切换 | F固定 | Delete删除 | Esc取消</div>
            {selectedSeat.deleted ? (
              <button className="cyber-btn-primary w-full flex items-center justify-center gap-2 mb-2"
                onClick={() => {
                  if (selectedSeat && seatZone) {
                    useStore.getState().restoreSeat(seatZone.id, selectedSeat.id)
                  }
                }}
              >
                恢复此座 (右键恢复到原位)
              </button>
            ) : (
              <>
                <button className="cyber-btn w-full flex items-center justify-center gap-2 mb-2"
                  onClick={() => { if (selectedSeat) toggleOccupied(selectedSeat.id) }}
                >
                  切换占座 (Space)
                </button>
                <button className="cyber-btn w-full flex items-center justify-center gap-2 mb-2"
                  onClick={() => { if (selectedSeat) toggleFixedSeat(selectedSeat.id) }}
                >
                  固定座位 (F)
                </button>
                <button className="cyber-btn-danger w-full flex items-center justify-center gap-2 mb-2"
                  onClick={() => {
                    if (selectedSeat && seatZone) deleteSeat(seatZone.id, selectedSeat.id)
                  }}
                >
                  <Trash2 size={14} />
                  <span>删除此座 (Delete)</span>
                </button>
              </>
            )}
            <button className="cyber-btn w-full flex items-center justify-center gap-2"
              onClick={() => { selectSeat(null); selectZone(null) }}
            >
              取消选中
            </button>
          </div>
        </div>
      )
    }
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 p-6">
        <MousePointerClick size={36} className="text-[#556]" />
        <span className="cyber-label text-center">请选择一个座位区</span>
      </div>
    )
  }

  const makeNumHandler = (key: string, min: number, max: number) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      updateZone(zone.id, { [key]: clamp(parseInt(e.target.value) || min, min, max) })

  return (
    <div className="h-full flex flex-col p-3">
      <div className="flex items-center gap-2 pb-3">
        <Settings size={16} className="text-[#4fc3f7]" />
        <span className="text-sm font-semibold text-[#c8d6e5]">区域属性</span>
      </div>
      <div className="cyber-divider mb-3" />
      <div className="flex-1 overflow-auto space-y-3">
        <div>
          <label className="cyber-label">区域名称</label>
          <input type="text" className="cyber-input" value={zone.name}
            onChange={e => updateZone(zone.id, { name: e.target.value })} />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="cyber-label">行数</label>
            <input type="number" className="cyber-input-number" min={1} max={50}
              value={zone.rows} onChange={makeNumHandler('rows', 1, 50)} />
          </div>
          <div className="flex-1">
            <label className="cyber-label">列数</label>
            <input type="number" className="cyber-input-number" min={1} max={50}
              value={zone.cols} onChange={makeNumHandler('cols', 1, 50)} />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="cyber-label">座位宽度</label>
            <input type="number" className="cyber-input-number" min={10} max={100} step={5}
              value={zone.seatWidth} onChange={makeNumHandler('seatWidth', 10, 100)} />
          </div>
          <div className="flex-1">
            <label className="cyber-label">座位高度</label>
            <input type="number" className="cyber-input-number" min={10} max={100} step={5}
              value={zone.seatHeight} onChange={makeNumHandler('seatHeight', 10, 100)} />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="cyber-label">水平间距</label>
            <input type="number" className="cyber-input-number" min={0} max={50}
              value={zone.gapX} onChange={makeNumHandler('gapX', 0, 50)} />
          </div>
          <div className="flex-1">
            <label className="cyber-label">垂直间距</label>
            <input type="number" className="cyber-input-number" min={0} max={50}
              value={zone.gapY} onChange={makeNumHandler('gapY', 0, 50)} />
          </div>
        </div>
        <div>
          <label className="cyber-label">旋转角度</label>
          <div className="flex items-center gap-3">
            <input type="range" className="cyber-slider flex-1" min={0} max={360}
              value={zone.rotation}
              onChange={e => updateZone(zone.id, { rotation: parseInt(e.target.value) || 0 })} />
            <span className="text-xs text-[#4fc3f7] font-mono w-10 text-right">{zone.rotation}°</span>
          </div>
        </div>
        <div>
          <label className="cyber-label">弧线强度</label>
          <div className="flex items-center gap-3">
            <input type="range" className="cyber-slider flex-1" min={-10} max={10} step={1}
              value={zone.arcStrength}
              onChange={e => updateZone(zone.id, { arcStrength: parseInt(e.target.value) || 0 })} />
            <span className="font-display text-xs text-[#4fc3f7] w-10 text-right">{zone.arcStrength}</span>
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 pt-3">
        <div className="cyber-divider mb-3" />
        <button className="cyber-btn w-full flex items-center justify-center gap-2 mb-2" onClick={handleExportPNG}>
          <ImageDown size={14} />
          <span>导出PNG</span>
        </button>
        <button className="cyber-btn w-full flex items-center justify-center gap-2 mb-2" onClick={handleExportMD}>
          <FileDown size={14} />
          <span>导出MD数据</span>
        </button>
        <button className="cyber-btn-danger w-full flex items-center justify-center gap-2" onClick={handleDelete}>
          <Trash2 size={14} />
          <span>删除此区域</span>
        </button>
      </div>
    </div>
  )
}
