'use client'

import { useCallback, useState } from 'react'
import { SpeedoLoader } from '@/components/loader/SpeedoLoader'
import { DoorTransition } from '@/components/hero/DoorTransition'
import { CabinStage } from '@/components/cabin/CabinStage'
import { ServiceIndex } from '@/components/services/ServiceIndex'
import { TopBar } from '@/components/ui/TopBar'
import { BookingBar } from '@/components/ui/BookingBar'

type Phase = 'loading' | 'opening' | 'cabin'

export default function Page() {
  const [phase, setPhase] = useState<Phase>('loading')
  const [revealed, setRevealed] = useState(false)

  // The speedometer doubles as the preload window: by the time it hits 260 the
  // clip is buffered, so the door opens straight out of it with no gap.
  const startTransition = useCallback(() => setPhase('opening'), [])

  // Fired before the clip ends. Its final frame IS the cabin plate, so the
  // stage fades up underneath rather than cutting.
  const handoff = useCallback(() => {
    setPhase('cabin')
    setRevealed(true)
  }, [])

  const entered = phase !== 'loading'

  return (
    <main style={{ position: 'relative' }}>
      {entered && (
        <>
          <TopBar />
          <CabinStage revealed={revealed} />
          <ServiceIndex />
          <BookingBar />
        </>
      )}

      <DoorTransition
        active={phase === 'opening'}
        onHandoff={handoff}
        onDone={() => setPhase('cabin')}
      />

      {phase === 'loading' && <SpeedoLoader onComplete={startTransition} />}
    </main>
  )
}
