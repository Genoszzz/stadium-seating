import React, { useRef, useCallback, useEffect, useState } from 'react'
import { Stage, Layer, Group, Rect, Text, Transformer } from 'react-konva'
import { useStore } from '../store'
import { SeatZone } from '../types'
import Konva from 'konva'

const SNAP = 40

const hexToRgba = (hex: string, a: number): string =>
  `rgba(${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)},${a})`

const snapToGrid = (v: number) => Math.round(v / SNAP) * SNAP

const getZoneBounds = (zone: SeatZone) => {
  const maxSeatX = Math.max(...zone.seats.map(seat => seat.x + zone.seatWidth), 0)
  const maxSeatY = Math.max(...zone.seats.map(seat => seat.y + zone.seatHeight), 0)
  return { width: maxSeatX, height: maxSeatY }
}

export default function Canvas() {
  const stageContainerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const trRef = useRef<Konva.Transformer>(null)
  const isPanning = useRef(false)
  const isSelecting = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 })
  const [selRect, setSelRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null)

  const zones = useStore(s => s.zones)
  const selectedZoneId = useStore(s => s.selectedZoneId)
  const selectZone = useStore(s => s.selectZone)
  const selectSeat = useStore(s => s.selectSeat)
  const updateZone = useStore(s => s.updateZone)
  const setCanvasConfig = useStore(s => s.setCanvasConfig)
  const setSelectedSeatIds = useStore(s => s.setSelectedSeatIds)

  const selectSeatsInRect = useCallback((rx: number, ry: number, rw: number, rh: number) => {
    const ids = new Set<string>()
    const state = useStore.getState()
    state.zones.forEach(z => {
      const cos = Math.cos(-z.rotation * Math.PI / 180)
      const sin = Math.sin(-z.rotation * Math.PI / 180)
      z.seats.forEach(s => {
        if (s.isFixed || s.deleted) return
        const gx = z.x + s.x * cos - s.y * sin
        const gy = z.y + s.x * sin + s.y * cos
        if (gx >= rx && gx <= rx + rw && gy >= ry && gy <= ry + rh) {
          ids.add(s.id)
        }
      })
    })
    return ids
  }, [])

  useEffect(() => {
    const c = stageContainerRef.current
    if (!c) return
    const ro = new ResizeObserver(es => {
      const { width, height } = es[0].contentRect
      setStageSize({ width, height })
    })
    ro.observe(c)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const { scale, offsetX, offsetY } = useStore.getState().canvasConfig
    stage.scale({ x: scale, y: scale })
    stage.position({ x: offsetX, y: offsetY })
    stage.batchDraw()
  }, [])

  const zoomTimer = useRef(0)
  const panTimer = useRef(0)

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const stage = stageRef.current
    if (!stage) return
    const s = stage.scaleX()
    const p = stage.getPointerPosition()
    if (!p) return
    const mp = { x: (p.x - stage.x()) / s, y: (p.y - stage.y()) / s }
    let ns = e.deltaY > 0 ? s * 1.08 : s / 1.08
    ns = Math.max(0.05, Math.min(8, ns))
    stage.scale({ x: ns, y: ns })
    const np = { x: p.x - mp.x * ns, y: p.y - mp.y * ns }
    stage.position(np)
    clearTimeout(zoomTimer.current)
    zoomTimer.current = window.setTimeout(() => {
      setCanvasConfig({ scale: ns, offsetX: np.x, offsetY: np.y })
    }, 150)
  }, [setCanvasConfig])

  useEffect(() => {
    const c = stageContainerRef.current
    if (!c) return
    c.addEventListener('wheel', handleWheel, { passive: false })
    return () => c.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const state = useStore.getState()

      if (state.selectedSeatIds.size > 1 && e.key === 'Delete') {
        e.preventDefault()
        state.batchDeleteSeats(Array.from(state.selectedSeatIds))
        return
      }

      const sid = state.selectedSeatId
      if (!sid) return
      const seat = state.zones.flatMap(z => z.seats).find(s => s.id === sid)
      if (!seat) return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        for (const z of state.zones) {
          if (z.seats.some(s => s.id === sid && !s.deleted)) {
            state.deleteSeat(z.id, sid)
            return
          }
        }
      } else if (e.key === ' ') {
        e.preventDefault()
        if (!seat.deleted && !seat.isFixed) state.toggleOccupied(sid)
      } else if (e.key === 'Escape') {
        state.selectSeat(null)
        state.selectZone(null)
        state.setSelectedSeatIds(new Set())
      } else if (e.key === 'f' || e.key === 'F') {
        if (!seat.deleted) state.toggleFixedSeat(sid)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target !== e.target.getStage()) return
    const st = useStore.getState()
    st.selectZone(null)
    st.selectSeat(null)
    st.setSelectedSeatIds(new Set())

    if (e.evt.shiftKey) {
      isSelecting.current = true
      const stage = stageRef.current!
      const pp = stage.getPointerPosition()!
      const sx = (pp.x - stage.x()) / stage.scaleX()
      const sy = (pp.y - stage.y()) / stage.scaleY()
      lastPos.current = { x: sx, y: sy }
      setSelRect({ x: sx, y: sy, w: 0, h: 0 })
    } else {
      isPanning.current = true
      lastPos.current = { x: e.evt.clientX, y: e.evt.clientY }
      const c = stageContainerRef.current
      if (c) c.style.cursor = 'grabbing'
    }
  }, [])

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isSelecting.current) {
      const stage = stageRef.current!
      const pp = stage.getPointerPosition()!
      const sx = (pp.x - stage.x()) / stage.scaleX()
      const sy = (pp.y - stage.y()) / stage.scaleY()
      setSelRect(prev => prev ? {
        x: Math.min(lastPos.current.x, sx),
        y: Math.min(lastPos.current.y, sy),
        w: Math.abs(sx - lastPos.current.x),
        h: Math.abs(sy - lastPos.current.y),
      } : null)
      return
    }
    if (!isPanning.current) return
    const stage = stageRef.current!
    const np = {
      x: stage.x() + e.evt.clientX - lastPos.current.x,
      y: stage.y() + e.evt.clientY - lastPos.current.y,
    }
    stage.position(np)
    lastPos.current = { x: e.evt.clientX, y: e.evt.clientY }
    clearTimeout(panTimer.current)
    panTimer.current = window.setTimeout(() => {
      setCanvasConfig({ offsetX: np.x, offsetY: np.y })
    }, 150)
  }, [setCanvasConfig])

  const handleMouseUp = useCallback(() => {
    if (isSelecting.current) {
      isSelecting.current = false
      if (selRect && selRect.w > 4 && selRect.h > 4) {
        useStore.getState().setSelectedSeatIds(selectSeatsInRect(selRect.x, selRect.y, selRect.w, selRect.h))
      }
      setSelRect(null)
    } else {
      isPanning.current = false
      const c = stageContainerRef.current
      if (c) c.style.cursor = 'default'
      clearTimeout(panTimer.current)
      const stage = stageRef.current
      if (stage) {
        setCanvasConfig({ offsetX: stage.x(), offsetY: stage.y() })
      }
    }
  }, [selRect, selectSeatsInRect, setCanvasConfig])

  useEffect(() => {
    if (!stageRef.current || !trRef.current) return
    const node = selectedZoneId ? stageRef.current.findOne(`#zone-${selectedZoneId}`) : null
    trRef.current.nodes(node ? [node] : [])
    trRef.current.getLayer()?.batchDraw()
  }, [selectedZoneId, zones])

  return (
    <div className="absolute inset-0" ref={stageContainerRef}>
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <Layer>
          {zones.map(z => (
            <ZoneRenderer
              key={z.id}
              zone={z}
              isSelected={z.id === selectedZoneId}
              onSelect={() => { selectZone(z.id); selectSeat(null) }}
              onDragEnd={(x, y) => updateZone(z.id, { x: snapToGrid(x), y: snapToGrid(y) })}
            />
          ))}
          {selRect && (
            <Rect x={selRect.x} y={selRect.y} width={selRect.w} height={selRect.h}
              fill="rgba(79,195,247,0.1)" stroke="#4fc3f7" strokeWidth={1} dash={[4, 4]} listening={false} />
          )}
          <Transformer
            ref={trRef}
            enabledAnchors={[]}
            rotateEnabled={false}
            borderStroke="#4fc3f7"
            borderStrokeWidth={2}
            anchorSize={0}
          />
        </Layer>
      </Stage>
    </div>
  )
}

type ZoneRendererProps = {
  zone: SeatZone
  isSelected: boolean
  onSelect: () => void
  onDragEnd: (x: number, y: number) => void
}

const ZoneRenderer = React.memo(function ZoneRenderer({
  zone, isSelected, onSelect, onDragEnd,
}: ZoneRendererProps) {
  const selectedSeatId = useStore(s => s.selectedSeatId)
  const selectedSeatIds = useStore(s => s.selectedSeatIds)
  const setSelectedSeatIds = useStore(s => s.setSelectedSeatIds)
  const bounds = getZoneBounds(zone)
  const w = bounds.width
  const h = bounds.height

  const handleGroupDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    onDragEnd(e.target.x(), e.target.y())
  }, [onDragEnd])

  const handleSeatClick = useCallback((seatId: string, isFixed: boolean, deleted: boolean, shiftKey: boolean) => {
    if (deleted) return
    const st = useStore.getState()
    const zoneWasSelected = st.selectedZoneId === zone.id

    st.selectZone(zone.id)

    if (shiftKey) {
      if (isFixed) return
      const ids = new Set(st.selectedSeatIds)
      if (ids.has(seatId)) ids.delete(seatId)
      else ids.add(seatId)
      st.setSelectedSeatIds(ids)
      if (ids.size > 0) {
        st.selectSeat(ids.values().next().value as string)
      } else {
        st.selectSeat(null)
      }
      return
    }

    st.setSelectedSeatIds(new Set())
    if (!zoneWasSelected) {
      st.selectSeat(seatId)
      return
    }
    if (!isFixed) st.toggleOccupied(seatId)
    st.selectSeat(seatId)
  }, [zone.id])

  const handleSeatContextMenu = useCallback((seatId: string, isFixed: boolean, deleted: boolean) => {
    const st = useStore.getState()
    st.selectZone(zone.id)

    if (deleted) {
      st.restoreSeat(zone.id, seatId)
      st.selectSeat(null)
      return
    }

    const multiIds = st.selectedSeatIds
    if (multiIds.size > 1 && multiIds.has(seatId)) {
      st.batchDeleteSeats(Array.from(multiIds))
      st.setSelectedSeatIds(new Set())
      st.selectSeat(null)
      return
    }

    st.setSelectedSeatIds(new Set())
    if (isFixed) {
      st.selectSeat(seatId)
    } else {
      st.deleteSeat(zone.id, seatId)
    }
  }, [zone.id])

  return (
    <Group
      id={`zone-${zone.id}`}
      x={zone.x} y={zone.y}
      rotation={zone.rotation}
      draggable={isSelected}
      onDragEnd={handleGroupDragEnd}
    >
      {isSelected && (
        <Rect x={-4} y={-4} width={w + 8} height={h + 8}
          fill={zone.color} opacity={0.05} listening={false} />
      )}
      <Rect x={0} y={0} width={w} height={h}
        fill={zone.color} opacity={0.12}
        stroke={hexToRgba(zone.color, isSelected ? 0.6 : 0.4)}
        strokeWidth={isSelected ? 2 : 1}
        onClick={() => onSelect()}
        onTap={() => onSelect()}
      />
      <Text x={5} y={-30} text={zone.name}
        fontSize={11} fill="#4fc3f7"
        fontFamily="Orbitron" fontStyle="bold"
        listening={false}
      />
      {Array.from({ length: zone.rows }, (_, r) => (
        (() => {
          const rowSeats = zone.seats.filter(seat => seat.row === r)
          const firstSeat = rowSeats.reduce((left, seat) => seat.x < left.x ? seat : left, rowSeats[0])
          const y = (firstSeat?.y ?? r * (zone.seatHeight + zone.gapY)) + (zone.seatHeight - 11) / 2
          return (
            <Text
              key={`rowlbl-${r}`}
              x={-28}
              y={y}
              text={`${r + 1}`}
              fontSize={11}
              fill="#b9d7ea"
              fontFamily="Orbitron"
              fontStyle="bold"
              align="right"
              width={22}
              shadowColor="#020817"
              shadowBlur={3}
              shadowOpacity={0.9}
              listening={false}
            />
          )
        })()
      ))}
      {Array.from({ length: zone.cols }, (_, c) => (
        (() => {
          const colSeats = zone.seats.filter(seat => seat.col === c)
          const firstSeat = colSeats.reduce((top, seat) => seat.y < top.y ? seat : top, colSeats[0])
          const labelWidth = 22
          const x = (firstSeat?.x ?? c * (zone.seatWidth + zone.gapX)) + (zone.seatWidth - labelWidth) / 2
          const y = (firstSeat?.y ?? 0) - 18
          return (
            <Text
              key={`collbl-${c}`}
              x={x}
              y={y}
              text={`${c + 1}`}
              fontSize={10}
              fill="#b9d7ea"
              fontFamily="Orbitron"
              fontStyle="bold"
              align="center"
              width={labelWidth}
              shadowColor="#020817"
              shadowBlur={3}
              shadowOpacity={0.9}
              listening={false}
            />
          )
        })()
      ))}
      {zone.seats.map(seat => {
        const isMultiSelected = selectedSeatIds.has(seat.id)
        const isSingleSelected = seat.id === selectedSeatId && !isMultiSelected

        if (seat.deleted) {
          return (
            <Group key={seat.id} x={seat.x} y={seat.y}
              onMouseDown={(e) => { if (!isSelected) e.cancelBubble = true }}
              onTouchStart={(e) => { if (!isSelected) e.cancelBubble = true }}
              onContextMenu={(e: Konva.KonvaEventObject<PointerEvent>) => {
                e.evt.preventDefault()
                e.evt.stopPropagation()
                handleSeatContextMenu(seat.id, seat.isFixed, true)
              }}
            >
              <Rect width={zone.seatWidth} height={zone.seatHeight}
                fill="transparent"
                cornerRadius={2}
              />
            </Group>
          )
        }

        let fill = '#2a3050'
        let stroke = 'rgba(79,195,247,0.15)'
        let sw = 1

        if (seat.occupied) {
          fill = hexToRgba(zone.color, 0.8)
          stroke = hexToRgba(zone.color, 0.5)
        }
        if (seat.isFixed) {
          fill = hexToRgba(zone.color, 0.55)
        }
        if (isMultiSelected) {
          stroke = '#00e676'
          sw = 2
        } else if (isSingleSelected) {
          stroke = '#4fc3f7'
          sw = 2
        }

        return (
          <Group key={seat.id} x={seat.x} y={seat.y}
            onMouseDown={(e) => { if (!isSelected) e.cancelBubble = true }}
            onTouchStart={(e) => { if (!isSelected) e.cancelBubble = true }}
            onClick={(e: Konva.KonvaEventObject<MouseEvent>) => {
              e.cancelBubble = true
              handleSeatClick(seat.id, seat.isFixed, false, e.evt.shiftKey)
            }}
            onTap={(e: Konva.KonvaEventObject<Event>) => {
              e.cancelBubble = true
              const native = (e as any).evt as MouseEvent | undefined
              handleSeatClick(seat.id, seat.isFixed, false, native?.shiftKey ?? false)
            }}
            onContextMenu={(e: Konva.KonvaEventObject<PointerEvent>) => {
              e.evt.preventDefault()
              e.evt.stopPropagation()
              handleSeatContextMenu(seat.id, seat.isFixed, false)
            }}
          >
            <Rect width={zone.seatWidth} height={zone.seatHeight}
              fill={fill} stroke={stroke} strokeWidth={sw}
              cornerRadius={2}
            />
            {seat.occupied && (
              <Text width={zone.seatWidth} height={zone.seatHeight}
                text="●" fontSize={10} fill="#fff"
                align="center" verticalAlign="middle" listening={false}
              />
            )}
            {isMultiSelected && (
              <Rect width={zone.seatWidth} height={zone.seatHeight}
                fill="rgba(0,230,118,0.12)" listening={false}
                cornerRadius={2}
              />
            )}
          </Group>
        )
      })}
    </Group>
  )
})
