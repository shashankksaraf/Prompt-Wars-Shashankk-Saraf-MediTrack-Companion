/** Formats a 24-hour "HH:MM" string as "8:00 AM". */
export function formatScheduledTime(time: string): string {
  const [hoursStr, minutesStr] = time.split(':')
  const hours = Number(hoursStr)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 === 0 ? 12 : hours % 12
  return `${displayHours}:${minutesStr.padStart(2, '0')} ${period}`
}

/** Formats an ISO timestamp as the local clock time, e.g. "8:03 AM". */
export function formatRecordedTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 === 0 ? 12 : hours % 12
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`
}
