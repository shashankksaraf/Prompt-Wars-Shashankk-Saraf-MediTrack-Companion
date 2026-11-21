import { useCallback, useEffect, useState } from 'react'
import type { DoseRecords, DoseStatus } from './types'

const STORAGE_KEY = 'meditrack.doseRecords.v1'

function loadRecords(): DoseRecords {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as DoseRecords) : {}
  } catch {
    return {}
  }
}

function saveRecords(records: DoseRecords) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
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

export function useDoseRecords() {
  const [records, setRecords] = useState<DoseRecords>(() => loadRecords())

  useEffect(() => {
    saveRecords(records)
  }, [records])

  const recordDose = useCallback(
    (occurrenceId: string, status: DoseStatus, snapshot: DoseSnapshot) => {
      setRecords((prev) => {
        // Guards against duplicate taps (including two clicks before a re-render):
        // the first write wins and keeps its original timestamp and snapshot.
        if (prev[occurrenceId]) return prev
        return {
          ...prev,
          [occurrenceId]: {
            status,
            recordedAt: new Date().toISOString(),
            medicineName: snapshot.medicineName,
            directions: snapshot.directions,
            scheduledTime: snapshot.scheduledTime,
          },
        }
      })
    },
    [],
  )

  const undoDose = useCallback((occurrenceId: string) => {
    setRecords((prev) => {
      if (!(occurrenceId in prev)) return prev
      const next = { ...prev }
      delete next[occurrenceId]
      return next
    })
  }, [])

  return { records, recordDose, undoDose }
}
