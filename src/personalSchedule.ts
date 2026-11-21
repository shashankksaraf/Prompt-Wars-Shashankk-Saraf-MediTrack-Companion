import { useCallback, useEffect, useState } from 'react'
import type { PersonalMedicine } from './types'

const STORAGE_KEY = 'meditrack.personalMedicines.v1'

function loadMedicines(): PersonalMedicine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as PersonalMedicine[]) : []
  } catch {
    return []
  }
}

function saveMedicines(medicines: PersonalMedicine[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(medicines))
  } catch {
    // Storage may be unavailable (e.g. private browsing quota). The UI still
    // works for the session; it just won't survive a refresh.
  }
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

export function usePersonalMedicines() {
  const [medicines, setMedicines] = useState<PersonalMedicine[]>(() => loadMedicines())

  useEffect(() => {
    saveMedicines(medicines)
  }, [medicines])

  const addMedicine = useCallback((input: MedicineInput) => {
    const medicine: PersonalMedicine = {
      id: newMedicineId(),
      name: input.name.trim(),
      directions: input.directions.trim(),
      times: [...new Set(input.times.filter((t) => t.trim() !== ''))].sort(),
      archived: false,
    }
    setMedicines((prev) => [...prev, medicine])
    return medicine
  }, [])

  const updateMedicine = useCallback((id: string, input: MedicineInput) => {
    setMedicines((prev) =>
      prev.map((medicine) =>
        medicine.id === id
          ? {
              ...medicine,
              name: input.name.trim(),
              directions: input.directions.trim(),
              times: [...new Set(input.times.filter((t) => t.trim() !== ''))].sort(),
            }
          : medicine,
      ),
    )
  }, [])

  const archiveMedicine = useCallback((id: string) => {
    setMedicines((prev) =>
      prev.map((medicine) => (medicine.id === id ? { ...medicine, archived: true } : medicine)),
    )
  }, [])

  return { medicines, addMedicine, updateMedicine, archiveMedicine }
}
