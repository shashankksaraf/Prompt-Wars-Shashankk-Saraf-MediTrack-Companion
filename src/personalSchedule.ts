import { useCallback, useEffect, useRef, useState } from 'react'
import { PERSONAL_MEDICINES_KEY } from './storageKeys'
import type { PersonalMedicine } from './types'

function loadMedicines(storageKey: string): PersonalMedicine[] {
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as PersonalMedicine[]) : []
  } catch {
    return []
  }
}

function saveMedicines(storageKey: string, medicines: PersonalMedicine[]) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(medicines))
  } catch {
    // Storage may be unavailable (e.g. private browsing quota). The UI still
    // works for the session; it just won't survive a refresh.
  }
}

/** Raw check used to route a fresh app load, before any component mounts a hook. */
export function hasAnyPersonalMedicines(): boolean {
  return loadMedicines(PERSONAL_MEDICINES_KEY).length > 0
}

export interface MedicineInput {
  name: string
  directions: string
  times: string[]
}

/** Empty name and duplicate-time validation shared by add and edit. */
export function validateMedicineInput(input: MedicineInput): string[] {
  const errors: string[] = []

  if (!input.name.trim()) {
    errors.push('Enter a medicine name.')
  }

  const times = input.times.filter((t) => t.trim() !== '')
  if (times.length === 0) {
    errors.push('Add at least one time.')
  } else if (new Set(times).size !== times.length) {
    errors.push('Each time must be different.')
  }

  return errors
}

function newMedicineId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `medicine-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Manages one medicine list under the given storage key (personal or demo),
 * so the two stay in fully separate namespaces. If the store is empty, it is
 * seeded once with `seed` (used for the demo persona's starting schedule).
 *
 * Mutations read and write a ref synchronously, independent of React's
 * render/commit cycle: a caller may navigate away in the same event handler
 * (e.g. returning to Today right after saving an edit), which unmounts this
 * hook before a state-updater-based write would ever get a chance to run.
 */
export function usePersonalMedicines(storageKey: string, seed?: PersonalMedicine[]) {
  // medicinesRef is the synchronous source of truth (guaranteed to be written before any
  // unmount in the same event handler); `medicines` state only exists to trigger a
  // re-render with a value that's safe to read during render.
  const medicinesRef = useRef<PersonalMedicine[]>([])
  const [medicines, setMedicines] = useState<PersonalMedicine[]>(() => {
    const loaded = loadMedicines(storageKey)
    return loaded.length === 0 && seed ? seed : loaded
  })
  // Effects run before the browser can process any user interaction, so by the time a
  // mutator below could possibly be called, the ref is already primed with real data.
  useEffect(() => {
    medicinesRef.current = medicines
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only priming the ref on mount/key change, not tracking `medicines`
  }, [storageKey])

  // Another tab editing the same schedule fires this event here, but never in the tab
  // that made the change. Without it, this tab's next write would be based on a stale
  // in-memory copy and silently clobber the other tab's edit.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== storageKey) return
      const fresh = loadMedicines(storageKey)
      medicinesRef.current = fresh
      setMedicines(fresh)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [storageKey])

  const addMedicine = useCallback(
    (input: MedicineInput) => {
      const medicine: PersonalMedicine = {
        id: newMedicineId(),
        name: input.name.trim(),
        directions: input.directions.trim(),
        times: [...new Set(input.times.filter((t) => t.trim() !== ''))].sort(),
        archived: false,
      }
      const next = [...medicinesRef.current, medicine]
      medicinesRef.current = next
      saveMedicines(storageKey, next)
      setMedicines(next)
      return medicine
    },
    [storageKey],
  )

  const updateMedicine = useCallback(
    (id: string, input: MedicineInput) => {
      const next = medicinesRef.current.map((medicine) =>
        medicine.id === id
          ? {
              ...medicine,
              name: input.name.trim(),
              directions: input.directions.trim(),
              times: [...new Set(input.times.filter((t) => t.trim() !== ''))].sort(),
            }
          : medicine,
      )
      medicinesRef.current = next
      saveMedicines(storageKey, next)
      setMedicines(next)
    },
    [storageKey],
  )

  const archiveMedicine = useCallback(
    (id: string) => {
      const next = medicinesRef.current.map((medicine) =>
        medicine.id === id ? { ...medicine, archived: true } : medicine,
      )
      medicinesRef.current = next
      saveMedicines(storageKey, next)
      setMedicines(next)
    },
    [storageKey],
  )

  return { medicines, addMedicine, updateMedicine, archiveMedicine }
}
