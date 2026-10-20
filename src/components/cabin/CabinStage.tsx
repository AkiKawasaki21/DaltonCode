'use client'

import { useCallback, useMemo, useState } from 'react'
import { HOTSPOTS, type HotspotId } from '@/lib/hotspots'
import { useCoverBox } from '@/hooks/useCoverBox'
import { useDragPan } from '@/hooks/useDragPan'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { asset } from '@/lib/asset'
import styles from './cabin.module.css'

const PLATE_ASPECT = 3200 / 1800
/** Gap between the leader's end and the label's edge, in px. */
const LEADER_GAP = 9
/** Fixed callout width. Must match --callout-w in tokens.css. */
const CALLOUT_W = 184
/** Phone tooltip geometry. Must match .tip in cabin.module.css. */
const TIP_MAX = 272
const TIP_GUTTER = 14
/** Vertical clearance below the ring. */
const TIP_DROP = 24

export function CabinStage({ revealed }: { revealed: boolean }) {
  const isPhone = useMediaQuery('(max-width: 860px)')
  const [activeId, setActiveId] = useState<HotspotId | null>(null)
  const [hoverId, setHoverId] = useState<HotspotId | null>(null)
  const { ref, box } = useCoverBox(PLATE_ASPECT)

  // How far the cover-fitted plate overflows the viewport. On a phone this is
  // most of the cabin, which is why it has to be draggable.
  const overflow = Math.max(0, box.width - box.containerWidth)
  const { offset, dragging, touched, onPointerDown, suppressTap } = useDragPan({
    overflow,
    enabled: isPhone,
    initial: 0.5,
  })

  const toggle = useCallback((id: HotspotId) => {
    setActiveId((cur) => (cur === id ? null : id))
  }, [])

  const placed = useMemo(
    () =>
      HOTSPOTS.map((h) => ({
        hotspot: h,
        // Inside the panning layer, so these need no offset of their own.
        px: (h.x / 100) * box.width,
        py: (h.y / 100) * box.height,
        cardPctX: h.lx,
        cardPctY: h.ly,
        cardPxX: (h.lx / 100) * box.containerWidth,
        cardPxY: (h.ly / 100) * box.containerHeight,
      })),
    [box],
  )

  const ready = box.width > 0

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`${styles.stage} ${revealed ? styles.revealed : ''} ${
        isPhone && overflow > 0 ? styles.pannable : ''
      } ${dragging ? styles.dragging : ''}`}
      aria-label="Kontrolna tabla — gdje kodiramo"
      onClick={() => setActiveId(null)}
      onPointerDown={onPointerDown}
    >
      <div
        className={styles.panLayer}
        style={
          ready
            ? { width: box.width, height: box.height, top: box.y, transform: `translate3d(${offset}px,0,0)` }
            : undefined
        }
      >
        <picture className={styles.plate}>
          <source srcSet={asset('/media/dashboard.avif')} type="image/avif" />
          <source srcSet={asset('/media/dashboard.webp')} type="image/webp" />
          <img
            src={asset('/media/dashboard.jpg')}
            alt="Kontrolna tabla Mercedes GLE sa ambijentalnim osvjetljenjem"
            width={3200}
            height={1800}
            draggable={false}
            decoding="async"
          />
        </picture>

        {ready &&
          placed.map(({ hotspot: h, px, py }, i) => {
            const live = activeId === h.id || hoverId === h.id
            return (
              <button
                key={`${h.id}-ring`}
                type="button"
                className={`${styles.ring} ${live ? styles.ringLive : ''}`}
                style={{ left: `${px}px`, top: `${py}px`, animationDelay: `${260 + i * 55}ms` }}
                onClick={(e) => {
                  e.stopPropagation()
                  // A drag that ends over a pin must not count as a tap.
                  if (suppressTap()) return
                  toggle(h.id)
                }}
                onPointerEnter={() => !isPhone && setHoverId(h.id)}
                onPointerLeave={() => !isPhone && setHoverId(null)}
                aria-label={h.title}
                aria-expanded={activeId === h.id}
              />
            )
          })}

        {/* Phone callout sits BELOW its pin and is clamped to the viewport.
            At 375px neither side of a centred pin has room for it. */}
        {isPhone &&
          ready &&
          placed.map(({ hotspot: h, px, py }) => {
            if (activeId !== h.id) return null
            const tipW = Math.min(box.containerWidth - TIP_GUTTER * 2, TIP_MAX)
            const left = Math.min(
              Math.max(px - tipW / 2, TIP_GUTTER - offset),
              box.containerWidth - tipW - TIP_GUTTER - offset,
            )
            return (
              <span
                key={`${h.id}-tip`}
                className={styles.tip}
                style={{ left: `${left}px`, top: `${py + TIP_DROP}px`, width: `${tipW}px` }}
              >
                <span className={styles.tipTitle}>{h.title}</span>
                <span className={styles.tipBlurb}>{h.blurb}</span>
              </span>
            )
          })}
      </div>

      <div className={styles.falloff} aria-hidden="true" />

      {!isPhone && ready && (
        <svg className={styles.leaders} aria-hidden="true">
          {placed.map(({ hotspot: h, px, py, cardPxX, cardPxY }) => {
            const live = activeId === h.id || hoverId === h.id
            const vx = px + offset
            const growsRight = cardPxX < vx
            const endX = growsRight ? cardPxX + CALLOUT_W + LEADER_GAP : cardPxX - CALLOUT_W - LEADER_GAP
            const turnX = vx + (endX - vx) * 0.42
            return (
              <path
                key={h.id}
                d={`M ${vx} ${py + box.y} L ${turnX} ${py + box.y} L ${endX} ${cardPxY}`}
                className={live ? styles.leaderLive : styles.leader}
              />
            )
          })}
        </svg>
      )}

      {!isPhone &&
        ready &&
        placed.map(({ hotspot: h, px, cardPctX, cardPctY, cardPxX }, i) => {
          const live = activeId === h.id || hoverId === h.id
          const growsRight = cardPxX < px + offset
          return (
            <button
              key={`${h.id}-label`}
              type="button"
              className={`${styles.callout} ${growsRight ? styles.right : styles.left} ${
                live ? styles.calloutLive : ''
              }`}
              style={{ left: `${cardPctX}%`, top: `${cardPctY}%`, animationDelay: `${320 + i * 55}ms` }}
              onClick={(e) => {
                e.stopPropagation()
                toggle(h.id)
              }}
              onPointerEnter={() => setHoverId(h.id)}
              onPointerLeave={() => setHoverId(null)}
              tabIndex={-1}
            >
              <span className={styles.label}>{h.title}</span>
              <span className={styles.blurb}>
                <span>{h.blurb}</span>
              </span>
            </button>
          )
        })}

      {isPhone && overflow > 0 && !touched && (
        <p className={styles.dragHint} aria-hidden="true">
          <span className={styles.dragArrow}>‹</span>
          prevucite kroz kabinu
          <span className={styles.dragArrow}>›</span>
        </p>
      )}
    </section>
  )
}
