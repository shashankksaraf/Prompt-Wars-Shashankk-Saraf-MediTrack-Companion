import { useCallback, useEffect, useRef, useState } from 'react'
import type { DoseRecords, DoseStatus } from './types'

function loadRecords(storageKey: string): DoseRecords {
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as DoseRecords) : {}
  } catch {
    return {}
  }
}

function saveRecords(storageKey: string, records: DoseRecords) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(records))
  } catch {
    // Storage may be unavailable (e.g. private browsing quota). The UI still
    // works for the session; it just won't survive a refresh.
  }
}

export interface DoseSnapshot {
  medicineName: string
  directions: string
  scheduledTime: string
}

/**
 * Manages dose records under the given storage key (personal or demo), kept
 * fully separate. Mutations read and write a ref synchronously, independent
 * of React's render/commit cycle, so that:
 * - a caller can navigate away in the same event handler without losing the
 *   write (a state-updater-based write would never run if this hook unmounts
 *   in the same batch), and
 * - duplicate taps are guarded against synchronously: two clicks processed
 *   before any re-render still see each other's effect immediately via the ref.
 */
export function useDoseRecords(storageKey: string) {
  // recordsRef is the synchronous source of truth (for the duplicate-tap guard and the
  // guaranteed-before-unmount write); `records` state only exists to trigger a re-render
  // with a value that's safe to read during render.
  const recordsRef = useRef<DoseRecords>({})
  const [records, setRecords] = useState<DoseRecords>(() => loadRecords(storageKey))
  // Effects run before the browser can process any user interaction, so by the time a
  // mutator below could possibly be called, the ref is already primed with real data.
  useEffect(() => {
    recordsRef.current = records
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only priming the ref on mount/key change, not tracking `records`
  }, [storageKey])

  const recordDose = useCallback(
    (occurrenceId: string, status: DoseStatus, snapshot: DoseSnapshot) => {
      // The first write wins and keeps its original timestamp and snapshot.
      if (recordsRef.current[occurrenceId]) return
      const next = {
        ...recordsRef.current,
        [occurrenceId]: {
          status,
          recordedAt: new Date().toISOString(),
          medicineName: snapshot.medicineName,
          directions: snapshot.directions,
          scheduledTime: snapshot.scheduledTime,
        },
      }
      recordsRef.current = next
      saveRecords(storageKey, next)
      setRecords(next)
    },
    [storageKey],
  )

  const undoDose = useCallback(
    (occurrenceId: string) => {
      if (!(occurrenceId in recordsRef.current)) return
      const next = { ...recordsRef.current }
      delete next[occurrenceId]
      recordsRef.current = next
      saveRecords(storageKey, next)
      setRecords(next)
    },
    [storageKey],
  )

  return { records, recordDose, undoDose }
}
