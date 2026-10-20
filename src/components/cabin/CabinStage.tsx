'use client'

import { useCallback, useMemo, useState } from 'react'
import { HOTSPOTS, type HotspotId } from '@/lib/hotspots'
import { useCoverBox } from '@/hooks/useCoverBox'
import styles from './cabin.module.css'
import { asset } from '@/lib/asset'

const PLATE_ASPECT = 3200 / 1800
/** Gap between the leader's end and the label's edge, in px. */
const LEADER_GAP = 9
/** Fixed callout width. Must match --callout-w in cabin.module.css — the
 *  leader has to terminate exactly at the label's edge, so the width can't
 *  be left to the content. */
const CALLOUT_W = 184

export function CabinStage({ revealed }: { revealed: boolean }) {
  const [activeId, setActiveId] = useState<HotspotId | null>(null)
  const [hoverId, setHoverId] = useState<HotspotId | null>(null)
  const { ref, box } = useCoverBox(PLATE_ASPECT)

  const toggle = useCallback(
    (id: HotspotId) => setActiveId((cur) => (cur === id ? null : id)),
    [],
  )

  const placed = useMemo(
    () =>
      HOTSPOTS.map((h) => {
        const px = box.x + (h.x / 100) * box.width
        const py = box.y + (h.y / 100) * box.height
        // Labels live in viewport space so the plate's side-crop can't eat them.
        const lx = (h.lx / 100) * box.containerWidth
        const ly = (h.ly / 100) * box.containerHeight
        // A callout on the left rail must grow INWARD (rightward) or it runs
        // off the screen; one on the right rail grows leftward. The leader
        // then terminates at whichever edge faces the pin.
        const growsRight = lx < px
        const side: 'left' | 'right' = growsRight ? 'right' : 'left'
        const endX = growsRight
          ? lx + CALLOUT_W + LEADER_GAP
          : lx - CALLOUT_W - LEADER_GAP
        return { hotspot: h, px, py, lx, ly, endX, side }
      }),
    [box],
  )

  const ready = box.width > 0

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`${styles.stage} ${revealed ? styles.revealed : ''}`}
      aria-label="Kontrolna tabla — gdje kodiramo"
      onClick={() => setActiveId(null)}
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

      <div className={styles.falloff} aria-hidden="true" />

      {ready && (
        <svg className={styles.leaders} aria-hidden="true">
          {placed.map(({ hotspot: h, px, py, ly, endX }) => {
            const live = activeId === h.id || hoverId === h.id
            // Elbow, not a curve: a drafting leader turns once and runs flat
            // into the label.
            const turnX = px + (endX - px) * 0.42
            return (
              <path
                key={h.id}
                d={`M ${px} ${py} L ${turnX} ${py} L ${endX} ${ly}`}
                className={live ? styles.leaderLive : styles.leader}
              />
            )
          })}
        </svg>
      )}

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
                toggle(h.id)
              }}
              onPointerEnter={() => setHoverId(h.id)}
              onPointerLeave={() => setHoverId(null)}
              aria-label={h.title}
              aria-expanded={activeId === h.id}
            />
          )
        })}

      {ready &&
        placed.map(({ hotspot: h, lx, ly, side }, i) => {
          const live = activeId === h.id || hoverId === h.id
          return (
            <button
              key={`${h.id}-label`}
              type="button"
              className={`${styles.callout} ${styles[side]} ${live ? styles.calloutLive : ''}`}
              style={{ left: `${lx}px`, top: `${ly}px`, animationDelay: `${320 + i * 55}ms` }}
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

    </section>
  )
}
