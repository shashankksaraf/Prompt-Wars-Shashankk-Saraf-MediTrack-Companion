import { useEffect, useState } from 'react'

/**
 * The current time, re-read on an interval and whenever the tab becomes
 * visible or regains focus again (e.g. after the laptop slept through a
 * scheduled time or local midnight).
 */
export function useNow(intervalMs = 15000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const tick = () => setNow(new Date())
    const id = window.setInterval(tick, intervalMs)

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('focus', tick)

    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('focus', tick)
    }
  }, [intervalMs])

  return now
}
