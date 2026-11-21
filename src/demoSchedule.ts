import { occurrenceId, todayLocalDate } from './dateUtils'
import type { Medicine, Occurrence, ScheduledDose } from './types'

/**
 * Fictional medicines for the repeatable demo schedule. These names are made
 * up and do not match any real medication, so the demo can never be mistaken
 * for real dosing advice.
 */
export const DEMO_MEDICINES: Medicine[] = [
  {
    id: 'lunoprin',
    name: 'Lunoprin 5mg',
    directions: 'Take one tablet with a glass of water.',
  },
  {
    id: 'vitaglow',
    name: 'VitaGlow D',
    directions: 'Take one capsule with breakfast.',
  },
]

/** Lunoprin appears twice today so recording one dose must leave the other dose untouched. */
export const DEMO_SCHEDULE: ScheduledDose[] = [
  { medicineId: 'lunoprin', time: '08:00' },
  { medicineId: 'vitaglow', time: '08:30' },
  { medicineId: 'lunoprin', time: '20:00' },
]

export function buildDemoOccurrences(date: Date = new Date()): Occurrence[] {
  const medicinesById = new Map(DEMO_MEDICINES.map((medicine) => [medicine.id, medicine]))
  const today = todayLocalDate(date)

  return DEMO_SCHEDULE.map((dose) => {
    const medicine = medicinesById.get(dose.medicineId)
    if (!medicine) {
      throw new Error(`Unknown medicine id in demo schedule: ${dose.medicineId}`)
    }
    return {
      id: occurrenceId(dose.medicineId, today, dose.time),
      medicineId: dose.medicineId,
      medicineName: medicine.name,
      directions: medicine.directions,
      time: dose.time,
      date: today,
      isGhost: false,
      isArchivedSource: false,
    }
  }).sort((a, b) => a.time.localeCompare(b.time))
}
