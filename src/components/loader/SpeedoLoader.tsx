'use client'

import { memo, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import styles from './speedo.module.css'

interface Props {
  onComplete: () => void
}

interface Point {
  x: number
  y: number
}

interface Tick {
  value: number
  major: boolean
  outer: Point
  inner: Point
  label: Point | null
}

/* ── Timing ─────────────────────────────────────────────────────────────── */

/** Top of the scale, and where the needle lands. */
const MAX_KMH = 260
/** Needle travel time, 0 to MAX_KMH. */
const SWEEP_MS = 2200
/** Rest on MAX_KMH before handing over, so the arrival reads as an arrival. */
const HOLD_MS = 300
/** Reduced motion: the finished dial is shown at once, then handed over. */
const REDUCED_HOLD_MS = 900

/* ── Scale ──────────────────────────────────────────────────────────────── */

/** km/h between ticks. */
const MINOR_STEP = 20
/** km/h between numerals. */
const MAJOR_STEP = 40
/** km/h per slice of the arc fill. Fine enough that the slice being lit never
 *  strays more than a few degrees ahead of the needle. */
const SLICE_KMH = 2.5
const SLICE_COUNT = MAX_KMH / SLICE_KMH
/** Slices overlap their predecessor by this much so no antialiasing seam shows. */
const SLICE_OVERLAP_DEG = 0.4

/* ── Dial geometry ──────────────────────────────────────────────────────── */
/* SVG user units. The dial, the fill and the needle are separate layers that
   share one viewBox, so they register without any measuring. Angles run
   clockwise from 12 o'clock; the scale spans 270 degrees, 7:30 round to 4:30. */

const VIEW_W = 400
const VIEW_H = 344
const CX = 200
const CY = 188
const START_DEG = -135
const SWEEP_DEG = 270

const R_ARC = 172
const R_FACE = 182
const R_TICK = 156
const R_LABEL = 116
const ARC_WIDTH = 8
const TICK_MAJOR_LEN = 18
const TICK_MINOR_LEN = 10

const NEEDLE_LEN = 148
const NEEDLE_TAIL = 28
const NEEDLE_TIP_HALF = 0.6
const NEEDLE_HUB_HALF = 4.5
const NEEDLE_TAIL_HALF = 3.4
const TIP_GLOW_R = 16
const HUB = { ring: 17, core: 10, halo: 6.5, dot: 3.2 } as const

/** The glow never drops below this, so the dial is lit from the first frame. */
const GLOW_FLOOR = 0.25

const VIEWBOX = `0 0 ${VIEW_W} ${VIEW_H}`
/** Pivot of the needle layer, as a share of its box. */
const NEEDLE_ORIGIN = `${(CX / VIEW_W) * 100}% ${(CY / VIEW_H) * 100}%`
const GLOW_TOP = `${(CY / VIEW_H) * 100}%`

/* ── Pure helpers ───────────────────────────────────────────────────────── */

const round2 = (v: number): number => Math.round(v * 100) / 100
const clamp01 = (v: number): number => Math.min(Math.max(v, 0), 1)
const classes = (...names: Array<string | false | undefined>): string =>
  names.filter(Boolean).join(' ')

/** Strong at the start, long tail: acceleration running out of road. */
const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3

/** km/h to degrees clockwise from 12 o'clock. */
const speedToDeg = (kmh: number): number => START_DEG + (kmh / MAX_KMH) * SWEEP_DEG

function polar(radius: number, deg: number): Point {
  const rad = (deg * Math.PI) / 180
  return { x: round2(CX + radius * Math.sin(rad)), y: round2(CY - radius * Math.cos(rad)) }
}

/** Clockwise arc on the dial between two angles. */
function arcPath(radius: number, fromDeg: number, toDeg: number): string {
  const a = polar(radius, fromDeg)
  const b = polar(radius, toDeg)
  const largeArc = toDeg - fromDeg > 180 ? 1 : 0
  return `M ${a.x} ${a.y} A ${radius} ${radius} 0 ${largeArc} 1 ${b.x} ${b.y}`
}

/* ── Static shapes, built once ──────────────────────────────────────────── */

const END_DEG = START_DEG + SWEEP_DEG
const ARC_START = polar(R_ARC, START_DEG)
const ARC_END = polar(R_ARC, END_DEG)
const TRACK_PATH = arcPath(R_ARC, START_DEG, END_DEG)

const TICKS: readonly Tick[] = Array.from({ length: MAX_KMH / MINOR_STEP + 1 }, (_, i) => {
  const value = i * MINOR_STEP
  const major = value % MAJOR_STEP === 0
  const deg = speedToDeg(value)
  return {
    value,
    major,
    outer: polar(R_TICK, deg),
    inner: polar(R_TICK - (major ? TICK_MAJOR_LEN : TICK_MINOR_LEN), deg),
    label: major ? polar(R_LABEL, deg) : null,
  }
})

/* The fill is cut into slices because SVG has no conic gradient, and sweeping
   a stroke-dashoffset would repaint the arc every frame. Slices sit under one
   shared gradient and are switched on by opacity alone. */
const SLICE_PATHS: readonly string[] = Array.from({ length: SLICE_COUNT }, (_, i) =>
  arcPath(
    R_ARC,
    speedToDeg(i * SLICE_KMH) - (i === 0 ? 0 : SLICE_OVERLAP_DEG),
    speedToDeg((i + 1) * SLICE_KMH),
  ),
)

const NEEDLE_POINTS = [
  [CX - NEEDLE_TIP_HALF, CY - NEEDLE_LEN],
  [CX + NEEDLE_TIP_HALF, CY - NEEDLE_LEN],
  [CX + NEEDLE_HUB_HALF, CY],
  [CX + NEEDLE_TAIL_HALF, CY + NEEDLE_TAIL],
  [CX - NEEDLE_TAIL_HALF, CY + NEEDLE_TAIL],
  [CX - NEEDLE_HUB_HALF, CY],
]
  .map(([x, y]) => `${x},${y}`)
  .join(' ')

/* ── Layers ─────────────────────────────────────────────────────────────── */

/** Face and unlit track. Never changes, so it never re-renders. */
const DialFace = memo(function DialFace() {
  return (
    <>
      <defs>
        <radialGradient id="speedo-face">
          <stop offset="0" className={styles.stopFaceCore} />
          <stop offset="1" className={styles.stopFaceEdge} />
        </radialGradient>
      </defs>
      <circle cx={CX} cy={CY} r={R_FACE} fill="url(#speedo-face)" />
      <path d={TRACK_PATH} fill="none" strokeWidth={ARC_WIDTH} className={styles.track} />
    </>
  )
})

interface TicksProps {
  /** How many ticks, counting from 0 km/h, the needle has already reached. */
  lit: number
}

/** Re-renders only when the needle crosses a tick, not every frame. */
const Ticks = memo(function Ticks({ lit }: TicksProps) {
  return (
    <>
      {TICKS.map((tick, i) => {
        const reached = i < lit
        return (
          <g key={tick.value}>
            <line
              x1={tick.outer.x}
              y1={tick.outer.y}
              x2={tick.inner.x}
              y2={tick.inner.y}
              className={classes(styles.tick, tick.major && styles.tickMajor, reached && styles.lit)}
            />
            {tick.label && (
              <text
                x={tick.label.x}
                y={tick.label.y}
                dy="0.35em"
                className={classes(styles.numeral, reached && styles.lit)}
              >
                {tick.value}
              </text>
            )}
          </g>
        )
      })}
    </>
  )
})

interface FillArcProps {
  progress: number
}

function FillArc({ progress }: FillArcProps) {
  const reach = progress * SLICE_COUNT
  return (
    <>
      <defs>
        <linearGradient
          id="speedo-fill"
          gradientUnits="userSpaceOnUse"
          x1={ARC_START.x}
          y1={0}
          x2={ARC_END.x}
          y2={0}
        >
          <stop offset="0" className={styles.stopEmber} />
          <stop offset="0.55" className={styles.stopGold} />
          <stop offset="1" className={styles.stopHot} />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#speedo-fill)" strokeWidth={ARC_WIDTH}>
        {SLICE_PATHS.map((d, i) => (
          <path key={i} d={d} style={{ opacity: round2(clamp01(reach - i)) }} />
        ))}
      </g>
    </>
  )
}

/** Needle, tip glow and hub. Drawn upright; the layer around it does the turning. */
const NeedleArt = memo(function NeedleArt() {
  return (
    <>
      <defs>
        <radialGradient id="speedo-tip">
          <stop offset="0" className={styles.stopTipCore} />
          <stop offset="1" className={styles.stopTipEdge} />
        </radialGradient>
        {/* Hard split down the middle: two facets, so the blade reads as a ridge. */}
        <linearGradient id="speedo-needle">
          <stop offset="0" className={styles.stopHot} />
          <stop offset="0.5" className={styles.stopHot} />
          <stop offset="0.5" className={styles.stopGold} />
          <stop offset="1" className={styles.stopGold} />
        </linearGradient>
      </defs>
      <circle cx={CX} cy={CY - NEEDLE_LEN} r={TIP_GLOW_R} fill="url(#speedo-tip)" />
      <polygon points={NEEDLE_POINTS} fill="url(#speedo-needle)" />
      <circle cx={CX} cy={CY} r={HUB.ring} className={styles.hubRing} />
      <circle cx={CX} cy={CY} r={HUB.core} className={styles.hubCore} />
      <circle cx={CX} cy={CY} r={HUB.halo} className={styles.hubHalo} />
      <circle cx={CX} cy={CY} r={HUB.dot} className={styles.hubDot} />
    </>
  )
})

interface ReadoutProps {
  speed: number
}

function Readout({ speed }: ReadoutProps) {
  const digits = String(speed).padStart(3, '0')
  const ghosts = speed >= 100 ? 0 : speed >= 10 ? 1 : 2
  return (
    <div className={styles.readout}>
      <span className={styles.digits}>
        {Array.from(digits, (digit, i) => (
          <span key={i} className={i < ghosts ? styles.ghost : undefined}>
            {digit}
          </span>
        ))}
      </span>
      <span className={styles.unit}>km/h</span>
    </div>
  )
}

interface GaugeProps {
  /** 0 to 1. The one value the needle, the fill and the number all derive from. */
  progress: number
}

function Gauge({ progress }: GaugeProps) {
  const kmh = progress * MAX_KMH
  const speed = Math.round(kmh)
  const litTicks = Math.floor(speed / MINOR_STEP) + 1
  const glow = round2(GLOW_FLOOR + (1 - GLOW_FLOOR) * progress)

  return (
    <div className={styles.gauge} style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}>
      <div className={styles.glow} style={{ top: GLOW_TOP, opacity: glow }} />
      <svg className={styles.layer} viewBox={VIEWBOX}>
        <DialFace />
        <Ticks lit={litTicks} />
      </svg>
      <svg className={styles.layer} viewBox={VIEWBOX}>
        <FillArc progress={progress} />
      </svg>
      <svg
        className={classes(styles.layer, styles.needle)}
        viewBox={VIEWBOX}
        style={{
          transform: `rotate(${round2(speedToDeg(kmh))}deg)`,
          transformOrigin: NEEDLE_ORIGIN,
        }}
      >
        <NeedleArt />
      </svg>
      <Readout speed={speed} />
    </div>
  )
}

/* ── Loader ─────────────────────────────────────────────────────────────── */

/** One sweep, 0 to 1 over SWEEP_MS, then `onDone` after the hold. Returns a canceller. */
function runSweep(onProgress: (progress: number) => void, onDone: () => void): () => void {
  let frame = 0
  let hold = 0
  let startedAt: number | null = null

  // Progress comes from the clock, not from counting frames, so a dropped
  // frame costs smoothness but never time.
  const step = (now: number) => {
    startedAt ??= now
    const t = Math.min((now - startedAt) / SWEEP_MS, 1)
    onProgress(easeOutCubic(t))

    if (t < 1) {
      frame = requestAnimationFrame(step)
    } else {
      hold = window.setTimeout(onDone, HOLD_MS)
    }
  }
  frame = requestAnimationFrame(step)

  return () => {
    cancelAnimationFrame(frame)
    window.clearTimeout(hold)
  }
}

/** Runs the sweep. Returns progress, 0 to 1, and calls `onComplete` exactly once. */
function useSweep(onComplete: () => void): number {
  const reducedMotion = useReducedMotion()
  const [progress, setProgress] = useState(0)

  // Parents tend to pass a fresh closure every render. Reading it through a
  // ref keeps that from restarting the sweep.
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  const completedRef = useRef(false)

  useEffect(() => {
    if (completedRef.current) return

    const finish = () => {
      completedRef.current = true
      onCompleteRef.current()
    }

    if (reducedMotion) {
      const timer = window.setTimeout(finish, REDUCED_HOLD_MS)
      return () => window.clearTimeout(timer)
    }

    return runSweep(setProgress, finish)
  }, [reducedMotion])

  return reducedMotion ? 1 : progress
}

export function SpeedoLoader({ onComplete }: Props) {
  const progress = useSweep(onComplete)

  return (
    <div className={styles.loader} role="status">
      <span className={styles.visuallyHidden}>Dalton Coding, učitavanje</span>
      <div className={styles.stage} aria-hidden="true">
        <Gauge progress={progress} />
        <p className={styles.brandMark}>DALTON</p>
      </div>
    </div>
  )
}
