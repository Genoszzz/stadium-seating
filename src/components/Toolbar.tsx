import { useState, useRef } from 'react'
import { Plus, Eraser, ImageDown, CircleHelp, Upload, FileDown, ClipboardList } from 'lucide-react'
import { useStore } from '../store'
import { parseAllZonesMD, generateCanvasMD } from './PropertiesPanel'

interface ToolbarProps {
  onOpenHelp: () => void
}

export default function Toolbar({ onOpenHelp }: ToolbarProps) {
  const [text, setText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleApply = () => {
    useStore.getState().fillLetterPattern(text)
    setText('')
  }

  const handleExportCanvasPNG = () => {
    const stage = document.querySelector('.konvajs-content canvas') as HTMLCanvasElement | null
    if (!stage) return
    const link = document.createElement('a')
    link.download = '座位布局图.png'
    link.href = stage.toDataURL()
    link.click()
  }

  const handleExportCanvasMD = () => {
    const zones = useStore.getState().zones
    if (zones.length === 0) return
    const md = generateCanvasMD(zones)
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = '排座布局.md'
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExportTifoList = () => {
    const zones = useStore.getState().zones
    const rows = zones.flatMap(zone => {
      return zone.seats
        .filter(seat => seat.occupied && !seat.deleted)
        .sort((a, b) => a.row - b.row || a.col - b.col)
        .map((seat, index) => ({
          zone: zone.name,
          row: seat.row + 1,
          col: seat.col + 1,
          seat: `${seat.row + 1}行${seat.col + 1}列`,
          order: index + 1,
        }))
    })

    if (rows.length === 0) {
      alert('当前没有已占座位可导出')
      return
    }

    const headers = ['座位区域', '行', '列', '座位编号', '区域内序号']
    const escapeCsv = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`
    const csv = [
      headers.map(escapeCsv).join(','),
      ...rows.map(row => [row.zone, row.row, row.col, row.seat, row.order].map(escapeCsv).join(',')),
    ].join('\n')

    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = 'TIFO占座清单.csv'
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImportMD = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const items = parseAllZonesMD(text)
      if (items.length === 0) {
        alert('无法解析该文件，请确认是有效的排座数据文件')
        return
      }
      const st = useStore.getState()
      for (const item of items) {
        st.importZone(item.zone, item.seats)
      }
    } catch {
      alert('文件读取失败')
    }
    e.target.value = ''
  }

  return (
    <div className="flex items-center gap-1">
      <button className="cyber-btn flex items-center gap-1" onClick={() => useStore.getState().addZone()}>
        <Plus size={13} /><span className="hidden sm:inline">添加座位区</span>
      </button>
      <button className="cyber-btn flex items-center gap-1" onClick={handleImportMD} title="导入MD数据文件">
        <Upload size={13} /><span className="hidden sm:inline">导入</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".md"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <div className="w-px h-5 bg-cyber-border/30 mx-1" />
      <button className="cyber-btn flex items-center gap-1" onClick={() => useStore.getState().clearAll()}>
        <Eraser size={13} /><span className="hidden sm:inline">全部清空</span>
      </button>
      <div className="w-px h-5 bg-cyber-border/30 mx-1" />
      <input
        className="cyber-input w-20 h-7 text-center font-display text-xs uppercase tracking-wider"
        placeholder="字母"
        maxLength={20}
        value={text}
        onChange={e => setText(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
        onKeyDown={e => { if (e.key === 'Enter') handleApply() }}
      />
      <button className="cyber-btn-primary flex items-center gap-1 px-2 h-7" onClick={handleApply}>
        应用
      </button>
      <div className="w-px h-5 bg-cyber-border/30 mx-1" />
      <button className="cyber-btn flex items-center gap-1" onClick={handleExportCanvasPNG} title="导出整个画布为PNG">
        <ImageDown size={13} /><span className="hidden sm:inline">画布PNG</span>
      </button>
      <button className="cyber-btn flex items-center gap-1" onClick={handleExportCanvasMD} title="导出整个画布为MD数据文件">
        <FileDown size={13} /><span className="hidden sm:inline">画布MD</span>
      </button>
      <button className="cyber-btn flex items-center gap-1" onClick={handleExportTifoList} title="导出TIFO占座清单CSV">
        <ClipboardList size={13} /><span className="hidden sm:inline">TIFO清单</span>
      </button>
      <div className="w-px h-5 bg-cyber-border/30 mx-1" />
      <button className="cyber-btn flex items-center gap-1" onClick={onOpenHelp} title="操作教程">
        <CircleHelp size={13} /><span className="hidden sm:inline">帮助</span>
      </button>
    </div>
  )
}
