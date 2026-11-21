import { occurrenceId, parseOccurrenceId, toLocalDateTime } from './dateUtils'
import { formatRecordedTime, formatScheduledTime } from './formatTime'
import type { DoseRecord, DoseRecords, Occurrence, PersonalMedicine } from './types'

/**
 * Builds today's occurrences for a schedule (personal or demo):
 * - one per (active medicine, time), using live medicine data unless a
 *   record already exists for that slot, in which case the record's
 *   snapshot wins so later edits never rewrite history, and
 * - one "ghost" per record that still belongs to today but no longer comes
 *   from the active schedule (its medicine was edited away or archived),
 *   rendered entirely from the record's snapshot.
 *
 * `excludeMedicineIds` filters out records left over from a different store that
 * used to share this one's localStorage key (the personal store must not resurrect
 * legacy demo records as ghosts; the demo store itself must not exclude anything,
 * since its own medicines reuse those same ids).
 */
export function buildPersonalOccurrences(
  medicines: PersonalMedicine[],
  records: DoseRecords,
  today: string,
  excludeMedicineIds: Set<string> = new Set(),
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
        !excludeMedicineIds.has(entry.parsed.medicineId),
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

export interface TimeGroup {
  time: string
  occurrences: Occurrence[]
}

/** Unrecorded, non-ghost occurrences grouped by scheduled time, earliest group first. */
export function groupPendingByTime(occurrences: Occurrence[], records: DoseRecords): TimeGroup[] {
  const groupsByTime = new Map<string, Occurrence[]>()
  for (const occurrence of occurrences) {
    if (occurrence.isGhost || records[occurrence.id]) continue
    const group = groupsByTime.get(occurrence.time)
    if (group) group.push(occurrence)
    else groupsByTime.set(occurrence.time, [occurrence])
  }
  return [...groupsByTime.entries()]
    .map(([time, occs]) => ({ time, occurrences: occs }))
    .sort((a, b) => a.time.localeCompare(b.time))
}

export interface RecordedEntry {
  occurrence: Occurrence
  record: DoseRecord
}

/** Every recorded occurrence (including ghosts, which are always recorded), most recent first. */
export function getRecordedEntries(occurrences: Occurrence[], records: DoseRecords): RecordedEntry[] {
  const entries: RecordedEntry[] = []
  for (const occurrence of occurrences) {
    const record = records[occurrence.id]
    if (record) entries.push({ occurrence, record })
  }
  return entries.sort((a, b) => b.record.recordedAt.localeCompare(a.record.recordedAt))
}

export type StatusKind = 'taken' | 'skipped' | 'upcoming' | 'due'

export interface StatusLabel {
  text: string
  kind: StatusKind
}

/** Status line for a pending time group: whether its scheduled time is still ahead or has passed. */
export function groupStatusLabel(time: string, date: string, now: Date): StatusLabel {
  const scheduledAt = toLocalDateTime(date, time)
  const formattedTime = formatScheduledTime(time)
  if (scheduledAt.getTime() > now.getTime()) {
    return { text: `Upcoming at ${formattedTime}`, kind: 'upcoming' }
  }
  return { text: `Scheduled for ${formattedTime} · Unrecorded`, kind: 'due' }
}

/** Status line for an already-recorded occurrence. */
export function recordedStatusLabel(record: DoseRecord): StatusLabel {
  if (record.status === 'taken') {
    return { text: `Taken at ${formatRecordedTime(record.recordedAt)}`, kind: 'taken' }
  }
  return { text: `Skipped at ${formatRecordedTime(record.recordedAt)}`, kind: 'skipped' }
}
