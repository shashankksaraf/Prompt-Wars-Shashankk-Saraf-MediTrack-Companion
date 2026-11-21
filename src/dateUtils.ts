/** Local calendar date as "YYYY-MM-DD", using the device's local timezone (not UTC). */
export function todayLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function occurrenceId(medicineId: string, date: string, time: string): string {
  return `${medicineId}|${date}|${time}`
}

export function parseOccurrenceId(
  id: string,
): { medicineId: string; date: string; time: string } | null {
  const parts = id.split('|')
  if (parts.length !== 3) return null
  const [medicineId, date, time] = parts
  return { medicineId, date, time }
}

/** Combines a "YYYY-MM-DD" date and "HH:MM" time into a local Date. */
export function toLocalDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`)
}
