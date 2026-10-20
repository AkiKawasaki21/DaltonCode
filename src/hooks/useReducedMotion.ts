'use client'

import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

const getSnapshot = () => window.matchMedia(QUERY).matches
/** The server cannot know the preference; false keeps hydration consistent. */
const getServerSnapshot = () => false

/**
 * Tracks the OS "reduce motion" setting.
 *
 * useSyncExternalStore rather than useState+useEffect so the real value is
 * read during the first client render instead of one frame later — otherwise
 * a reduced-motion user sees a frame of the pre-animation state.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
