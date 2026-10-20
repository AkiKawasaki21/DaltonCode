'use client'

import { useEffect, useRef, useState } from 'react'

export interface CoverBox {
  /** The cover-fitted image's rect, relative to the container's top-left. */
  x: number
  y: number
  width: number
  height: number
  /** The container's own size, for anything anchored to the viewport. */
  containerWidth: number
  containerHeight: number
}

const EMPTY: CoverBox = {
  x: 0, y: 0, width: 0, height: 0, containerWidth: 0, containerHeight: 0,
}

/**
 * Where a cover-fitted image actually lands inside its container.
 *
 * Markers are authored as percentages of the IMAGE, but `object-fit: cover`
 * crops it, so image percentages and viewport percentages are not the same
 * thing. This returns both rects so markers can be placed in exact pixels
 * rather than drifting with the crop.
 */
export function useCoverBox(aspect: number) {
  const ref = useRef<HTMLElement | null>(null)
  const [box, setBox] = useState<CoverBox>(EMPTY)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const measure = () => {
      const cw = el.clientWidth
      const ch = el.clientHeight
      if (!cw || !ch) return
      const width = Math.max(cw, ch * aspect)
      const height = width / aspect
      setBox({
        x: (cw - width) / 2,
        y: (ch - height) / 2,
        width,
        height,
        containerWidth: cw,
        containerHeight: ch,
      })
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [aspect])

  return { ref, box }
}
