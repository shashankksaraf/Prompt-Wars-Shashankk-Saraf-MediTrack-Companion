import type { PersonalMedicine } from './types'

/** The fictional person judges see in "Try an editable demo". Clearly not a real profile. */
export const DEMO_PERSONA_NAME = 'Priya Sharma'

/**
 * Seeds the demo medicine store the first time it's opened. These names are
 * made up and do not match any real medication, and the schedule is fully
 * editable from here using the real editor, isolated from personal data.
 */
export const DEMO_SEED_MEDICINES: PersonalMedicine[] = [
  {
    id: 'lunoprin',
    name: 'Lunoprin 5mg',
    directions: 'Take one tablet with a glass of water.',
    times: ['08:00', '20:00'],
    archived: false,
  },
  {
    id: 'vitaglow',
    name: 'VitaGlow D',
    directions: 'Take one capsule with breakfast.',
    times: ['08:30'],
    archived: false,
  },
]

/** Phase 1/2 shared one doseRecords store for demo and personal data under these ids. */
const LEGACY_DEMO_MEDICINE_IDS = ['amlodipine', 'vitamin-d3']

/** Every medicine id the demo schedule has ever used, so legacy records never leak into a personal view. */
export const DEMO_MEDICINE_IDS = new Set<string>([
  ...DEMO_SEED_MEDICINES.map((medicine) => medicine.id),
  ...LEGACY_DEMO_MEDICINE_IDS,
])
