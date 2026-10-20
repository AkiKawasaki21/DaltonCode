'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const FRICTION = 0.935
const MIN_VELOCITY = 0.08
/** Under this travel a pointer sequence is a tap on a pin, not a drag. */
const DRAG_THRESHOLD_PX = 6

interface Options {
  /** How far the content overflows the container, in px. 0 disables panning. */
  overflow: number
  enabled: boolean
  /** Where to rest on entry, 0–1 across the overflow. */
  initial?: number
}

/**
 * Horizontal drag-pan with inertia, for when a cover-fitted image is wider
 * than the viewport. Returns the offset only — the caller decides what moves,
 * so the plate and its pins can share one transform and stay welded together.
 */
export function useDragPan({ overflow, enabled, initial = 0.5 }: Options) {
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [touched, setTouched] = useState(false)

  const drag = useRef({ active: false, startX: 0, startOffset: 0, moved: 0 })
  const velocity = useRef(0)
  const last = useRef({ x: 0, t: 0 })
  const raf = useRef<number | null>(null)
  const didInit = useRef(false)

  const clamp = useCallback(
    (v: number) => Math.min(0, Math.max(-overflow, v)),
    [overflow],
  )

  useEffect(() => {
    if (didInit.current || overflow <= 0) return
    didInit.current = true
    setOffset(-overflow * initial)
  }, [overflow, initial])

  useEffect(() => setOffset((o) => clamp(o)), [clamp])

  const stop = useCallback(() => {
    if (raf.current !== null) {
      cancelAnimationFrame(raf.current)
      raf.current = null
    }
  }, [])

  const glide = useCallback(() => {
    const step = () => {
      velocity.current *= FRICTION
      if (Math.abs(velocity.current) < MIN_VELOCITY) {
        raf.current = null
        return
      }
      let atEdge = false
      setOffset((o) => {
        const next = clamp(o + velocity.current)
        if (next === o) atEdge = true
        return next
      })
      if (atEdge) {
        velocity.current = 0
        raf.current = null
        return
      }
      raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
  }, [clamp])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled || overflow <= 0) return
      stop()
      drag.current = { active: true, startX: e.clientX, startOffset: offset, moved: 0 }
      last.current = { x: e.clientX, t: performance.now() }
      velocity.current = 0
      setTouched(true)
    },
    [enabled, overflow, offset, stop],
  )

  useEffect(() => {
    if (!enabled) return

    const onMove = (e: PointerEvent) => {
      if (!drag.current.active) return
      const dx = e.clientX - drag.current.startX
      drag.current.moved = Math.max(drag.current.moved, Math.abs(dx))
      if (drag.current.moved > DRAG_THRESHOLD_PX) setDragging(true)

      const now = performance.now()
      const dt = now - last.current.t
      if (dt > 0) velocity.current = ((e.clientX - last.current.x) / dt) * 16
      last.current = { x: e.clientX, t: now }

      setOffset(clamp(drag.current.startOffset + dx))
    }

    const onUp = () => {
      if (!drag.current.active) return
      drag.current.active = false
      setDragging(false)
      if (Math.abs(velocity.current) > MIN_VELOCITY) glide()
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [enabled, clamp, glide])

  useEffect(() => stop, [stop])

  /** True while the pointer travelled far enough that a tap should be ignored. */
  const suppressTap = () => drag.current.moved > DRAG_THRESHOLD_PX

  return { offset, dragging, touched, onPointerDown, suppressTap }
}
