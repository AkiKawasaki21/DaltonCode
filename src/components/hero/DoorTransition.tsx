'use client'

import { useEffect, useRef, useState } from 'react'
import { useCoverBox } from '@/hooks/useCoverBox'
import { asset } from '@/lib/asset'
import styles from './door.module.css'

/** Must match the encoded clip length in public/media/door-720.mp4. */
const CLIP_MS = 4375
/** The clip's last frame IS the cabin plate, so we hand off late and the
 *  dissolve is invisible — the two images are identical. */
const HANDOFF_AT = 0.88
const CLIP_ASPECT = 16 / 9

interface Props {
  active: boolean
  onHandoff: () => void
  onDone: () => void
}

export function DoorTransition({ active, onHandoff, onDone }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [dissolving, setDissolving] = useState(false)
  const { ref, box } = useCoverBox(CLIP_ASPECT)

  useEffect(() => {
    if (!active) return
    const v = videoRef.current
    v?.play().catch(() => {
      /* Autoplay blocked — the timers below still drive the handoff. */
    })

    const toHandoff = window.setTimeout(() => {
      setDissolving(true)
      onHandoff()
    }, CLIP_MS * HANDOFF_AT)
    const toDone = window.setTimeout(onDone, CLIP_MS)

    return () => {
      window.clearTimeout(toHandoff)
      window.clearTimeout(toDone)
    }
  }, [active, onHandoff, onDone])

  if (!active) return null

  // A 16:9 shot cover-fitted into a portrait phone shows about a quarter of
  // the frame — you'd never see the car. So the clip opens letterboxed at the
  // contain scale and zooms to full-bleed, arriving exactly on the cabin's
  // framing just as the camera reaches the dashboard.
  const startScale = box.width > 0 ? box.containerWidth / box.width : 1

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`${styles.wrap} ${dissolving ? styles.dissolving : ''}`}
      aria-hidden="true"
      style={{ ['--start-scale' as string]: startScale.toFixed(4) }}
    >
      <video
        ref={videoRef}
        className={styles.clip}
        style={
          box.width > 0
            ? { width: box.width, height: box.height, left: box.x, top: box.y }
            : undefined
        }
        muted
        playsInline
        preload="auto"
        poster={asset('/media/hero-poster.jpg')}
      >
        <source src={asset('/media/door-480.mp4')} type="video/mp4" media="(max-width: 560px)" />
        <source src={asset('/media/door-720.mp4')} type="video/mp4" />
      </video>
    </div>
  )
}
