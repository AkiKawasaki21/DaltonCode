'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './door.module.css'
import { asset } from '@/lib/asset'

/** Must match the encoded clip length in public/media/door-720.mp4. */
const CLIP_MS = 4375
/** The clip's last frame IS the dashboard plate, so we can hand off late and
 *  the dissolve is invisible — the two images are identical. */
const HANDOFF_AT = 0.88

interface Props {
  active: boolean
  onHandoff: () => void
  onDone: () => void
}

export function DoorTransition({ active, onHandoff, onDone }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [dissolving, setDissolving] = useState(false)

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

  return (
    <div className={`${styles.wrap} ${dissolving ? styles.dissolving : ''}`} aria-hidden="true">
      {/* No CSS push-in: the camera move is baked into the clip itself. */}
      <video
        ref={videoRef}
        className={styles.clip}
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
