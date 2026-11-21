import { occurrenceId, parseOccurrenceId, toLocalDateTime } from './dateUtils'
import { DEMO_MEDICINE_IDS } from './demoSchedule'
import { formatRecordedTime, formatScheduledTime } from './formatTime'
import type { DoseRecord, DoseRecords, Occurrence, PersonalMedicine } from './types'

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Builds today's occurrences for a personal schedule:
 * - one per (active medicine, time), using live medicine data unless a
 *   record already exists for that slot, in which case the record's
 *   snapshot wins so later edits never rewrite history, and
 * - one "ghost" per record that still belongs to today but no longer comes
 *   from the active schedule (its medicine was edited away or archived),
 *   rendered entirely from the record's snapshot.
 */
export function buildPersonalOccurrences(
  medicines: PersonalMedicine[],
  records: DoseRecords,
  today: string,
): Occurrence[] {
  const activeMedicines = medicines.filter((m) => !m.archived)
  const activeIds = new Set<string>()

  const active: Occurrence[] = activeMedicines.flatMap((medicine) =>
    medicine.times.map((time) => {
      const id = occurrenceId(medicine.id, today, time)
      activeIds.add(id)
      const record = records[id]
      return {
        id,
        medicineId: medicine.id,
        medicineName: record?.medicineName ?? medicine.name,
        directions: record?.directions ?? medicine.directions,
        time,
        date: today,
        isGhost: false,
        isArchivedSource: false,
      }
    }),
  )

  const medicinesById = new Map(medicines.map((m) => [m.id, m]))
  const ghosts: Occurrence[] = Object.entries(records)
    .filter(([id]) => !activeIds.has(id))
    .map(([id, record]) => ({ id, parsed: parseOccurrenceId(id), record }))
    .filter(
      (entry): entry is { id: string; parsed: NonNullable<ReturnType<typeof parseOccurrenceId>>; record: DoseRecord } =>
        entry.parsed !== null &&
        entry.parsed.date === today &&
        !DEMO_MEDICINE_IDS.has(entry.parsed.medicineId),
    )
    .map(({ id, parsed, record }) => {
      const sourceMedicine = medicinesById.get(parsed.medicineId)
      return {
        id,
        medicineId: parsed.medicineId,
        medicineName: record.medicineName ?? sourceMedicine?.name ?? 'Medicine',
        directions: record.directions ?? sourceMedicine?.directions ?? '',
        time: record.scheduledTime ?? parsed.time,
        date: today,
        isGhost: true,
        isArchivedSource: sourceMedicine?.archived ?? false,
      }
    })

  return [...active, ...ghosts].sort((a, b) => a.time.localeCompare(b.time))
}

/** The next unrecorded, non-ghost occurrence due (or, if none are due yet, the next upcoming one). */
export function findCurrentOccurrenceId(
  occurrences: Occurrence[],
  records: DoseRecords,
  now: Date,
): string | null {
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const unrecorded = occurrences.filter((o) => !o.isGhost && !records[o.id])
  if (unrecorded.length === 0) return null

  const due = unrecorded.filter((o) => timeToMinutes(o.time) <= nowMinutes)
  if (due.length > 0) return due[due.length - 1].id

  return unrecorded[0].id
}

/** Puts the highlighted (current) occurrence first; keeps the rest in scheduled order. */
export function withCurrentFirst(occurrences: Occurrence[], currentId: string | null): Occurrence[] {
  if (!currentId) return occurrences
  const current = occurrences.find((o) => o.id === currentId)
  if (!current) return occurrences
  return [current, ...occurrences.filter((o) => o.id !== currentId)]
}

export type StatusKind = 'taken' | 'skipped' | 'upcoming' | 'due'

export interface StatusLabel {
  text: string
  kind: StatusKind
}

export function statusLabelFor(occurrence: Occurrence, record: DoseRecord | undefined, now: Date): StatusLabel {
  if (record?.status === 'taken') {
    return { text: `Taken at ${formatRecordedTime(record.recordedAt)}`, kind: 'taken' }
  }
  if (record?.status === 'skipped') {
    return { text: `Skipped at ${formatRecordedTime(record.recordedAt)}`, kind: 'skipped' }
  }

  const scheduledAt = toLocalDateTime(occurrence.date, occurrence.time)
  const formattedTime = formatScheduledTime(occurrence.time)
  if (scheduledAt.getTime() > now.getTime()) {
    return { text: `Upcoming at ${formattedTime}`, kind: 'upcoming' }
  }
  return { text: `Scheduled for ${formattedTime} · Unrecorded`, kind: 'due' }
}
