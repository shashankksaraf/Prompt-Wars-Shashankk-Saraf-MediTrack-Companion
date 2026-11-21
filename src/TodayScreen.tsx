import { useMemo, useState } from 'react'
import { todayLocalDate } from './dateUtils'
import { formatScheduledTime } from './formatTime'
import {
  buildPersonalOccurrences,
  findCurrentOccurrenceId,
  statusLabelFor,
  withCurrentFirst,
} from './occurrences'
import { usePersonalMedicines } from './personalSchedule'
import { useDoseRecords } from './storage'
import type { DoseRecord, Occurrence, PersonalMedicine } from './types'
import { useNow } from './useNow'
import './TodayScreen.css'

interface TodayScreenProps {
  medicinesKey: string
  recordsKey: string
  seed?: PersonalMedicine[]
  isDemo: boolean
  displayName: string
  onManage: () => void
  onExitDemo?: () => void
}

function OccurrenceCard({
  occurrence,
  isCurrent,
  now,
  record,
  onTaken,
  onSkip,
  onUndo,
}: {
  occurrence: Occurrence
  isCurrent: boolean
  now: Date
  record: DoseRecord | undefined
  onTaken: () => void
  onSkip: () => void
  onUndo: () => void
}) {
  const status = statusLabelFor(occurrence, record, now)
  const currentBadgeText = status.kind === 'due' ? 'Up now' : status.kind === 'upcoming' ? 'Upcoming' : null

  return (
    <li
      className={`occurrence-card${isCurrent ? ' is-current' : ''}${occurrence.isGhost ? ' is-ghost' : ''}`}
    >
      {isCurrent && currentBadgeText && <span className="current-badge">{currentBadgeText}</span>}

      <div className="occurrence-time">{formatScheduledTime(occurrence.time)}</div>
      <h2 className="occurrence-name">{occurrence.medicineName}</h2>
      {occurrence.directions && <p className="occurrence-directions">{occurrence.directions}</p>}
      {occurrence.isGhost && occurrence.isArchivedSource && (
        <p className="archived-tag">Archived medicine</p>
      )}

      <div className="occurrence-status" aria-live="polite">
        <p className={`status-text status-${status.kind}`}>{status.text}</p>

        {!record && !occurrence.isGhost && (
          <div className="occurrence-actions">
            <button type="button" className="mark-taken-button" onClick={onTaken}>
              Mark as taken
            </button>
            <button type="button" className="skip-button" onClick={onSkip}>
              Skip
            </button>
          </div>
        )}

        {record && (
          <button type="button" className="undo-button" onClick={onUndo}>
            Undo
          </button>
        )}
      </div>
    </li>
  )
}

export default function TodayScreen({
  medicinesKey,
  recordsKey,
  seed,
  isDemo,
  displayName,
  onManage,
  onExitDemo,
}: TodayScreenProps) {
  const { now, refresh: refreshNow } = useNow()
  const today = todayLocalDate(now)

  const { medicines } = usePersonalMedicines(medicinesKey, seed)
  const { records, recordDose, undoDose } = useDoseRecords(recordsKey)
  const [staleNotice, setStaleNotice] = useState<string | null>(null)

  function attemptRecord(occurrence: Occurrence, status: 'taken' | 'skipped') {
    const actualToday = todayLocalDate(new Date())
    if (occurrence.date !== actualToday) {
      // The day changed since this screen last updated (e.g. a tap right after local
      // midnight, before the next tick). Refresh to today's real schedule instead of
      // recording against the stale date, and have the user confirm on the new screen.
      refreshNow()
      setStaleNotice('The day just changed. Today’s schedule has been refreshed — please check and tap again.')
      return
    }
    setStaleNotice(null)
    recordDose(occurrence.id, status, {
      medicineName: occurrence.medicineName,
      directions: occurrence.directions,
      scheduledTime: occurrence.time,
    })
  }

  const todayHeading = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }).format(now),
    [today], // eslint-disable-line react-hooks/exhaustive-deps -- recompute only when the local date flips
  )

  const occurrences = useMemo(
    () => buildPersonalOccurrences(medicines, records, today),
    [medicines, records, today],
  )
  const currentId = findCurrentOccurrenceId(occurrences, records, now)
  const ordered = withCurrentFirst(occurrences, currentId)

  return (
    <main className="today-screen">
      <header className="today-header">
        <h1>{displayName}’s schedule · Today</h1>
        <p className="today-date">{todayHeading}</p>
        {isDemo && (
          <p className="demo-label">Fictional demo profile — changes here never affect your personal schedule.</p>
        )}
        <div className="header-actions">
          <button type="button" className="manage-link" onClick={onManage}>
            Manage schedule
          </button>
          {isDemo && onExitDemo && (
            <button type="button" className="exit-demo-link" onClick={onExitDemo}>
              Exit demo
            </button>
          )}
        </div>
      </header>

      {staleNotice && (
        <p className="stale-notice" role="status">
          {staleNotice}
        </p>
      )}

      <section className="schedule-section">
        {occurrences.length === 0 ? (
          <p className="empty-state">
            No medicines yet. Use "Manage schedule" to add the first one.
          </p>
        ) : (
          <ul className="occurrence-list">
            {ordered.map((occurrence) => (
              <OccurrenceCard
                key={occurrence.id}
                occurrence={occurrence}
                isCurrent={occurrence.id === currentId}
                now={now}
                record={records[occurrence.id]}
                onTaken={() => attemptRecord(occurrence, 'taken')}
                onSkip={() => attemptRecord(occurrence, 'skipped')}
                onUndo={() => undoDose(occurrence.id)}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
