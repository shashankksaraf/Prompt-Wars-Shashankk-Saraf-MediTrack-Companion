import { useCallback, useEffect, useState } from 'react'

export interface UseNowResult {
  now: Date
  /** Forces an immediate re-read of the current time, outside the regular interval. */
  refresh: () => void
}

/**
 * The current time, re-read on an interval and whenever the tab becomes
 * visible or regains focus again (e.g. after the laptop slept through a
 * scheduled time or local midnight).
 */
export function useNow(intervalMs = 15000): UseNowResult {
  const [now, setNow] = useState(() => new Date())
  const refresh = useCallback(() => setNow(new Date()), [])

  useEffect(() => {
    const id = window.setInterval(refresh, intervalMs)

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('focus', refresh)

    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('focus', refresh)
    }
  }, [intervalMs, refresh])

  return { now, refresh }
}
