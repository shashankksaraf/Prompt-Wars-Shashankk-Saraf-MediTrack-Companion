import { useMemo } from 'react'
import { buildDemoOccurrences } from './demoSchedule'
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
import type { DoseRecord, Occurrence } from './types'
import { useNow } from './useNow'
import './TodayScreen.css'

interface TodayScreenProps {
  onManage: () => void
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

  return (
    <li
      className={`occurrence-card${isCurrent ? ' is-current' : ''}${occurrence.isGhost ? ' is-ghost' : ''}`}
    >
      {isCurrent && <span className="current-badge">Up now</span>}

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

export default function TodayScreen({ onManage }: TodayScreenProps) {
  const now = useNow()
  const today = todayLocalDate(now)

  const { medicines } = usePersonalMedicines()
  const { records, recordDose, undoDose } = useDoseRecords()

  const todayHeading = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }).format(now),
    [today], // eslint-disable-line react-hooks/exhaustive-deps -- recompute only when the local date flips
  )

  const personalOccurrences = useMemo(
    () => buildPersonalOccurrences(medicines, records, today),
    [medicines, records, today],
  )
  const demoOccurrences = useMemo(() => buildDemoOccurrences(now), [today]) // eslint-disable-line react-hooks/exhaustive-deps

  const personalCurrentId = findCurrentOccurrenceId(personalOccurrences, records, now)
  const demoCurrentId = findCurrentOccurrenceId(demoOccurrences, records, now)

  const orderedPersonal = withCurrentFirst(personalOccurrences, personalCurrentId)
  const orderedDemo = withCurrentFirst(demoOccurrences, demoCurrentId)

  const renderList = (occurrences: Occurrence[], currentId: string | null) => (
    <ul className="occurrence-list">
      {occurrences.map((occurrence) => (
        <OccurrenceCard
          key={occurrence.id}
          occurrence={occurrence}
          isCurrent={occurrence.id === currentId}
          now={now}
          record={records[occurrence.id]}
          onTaken={() =>
            recordDose(occurrence.id, 'taken', {
              medicineName: occurrence.medicineName,
              directions: occurrence.directions,
              scheduledTime: occurrence.time,
            })
          }
          onSkip={() =>
            recordDose(occurrence.id, 'skipped', {
              medicineName: occurrence.medicineName,
              directions: occurrence.directions,
              scheduledTime: occurrence.time,
            })
          }
          onUndo={() => undoDose(occurrence.id)}
        />
      ))}
    </ul>
  )

  return (
    <main className="today-screen">
      <header className="today-header">
        <h1>Today</h1>
        <p className="today-date">{todayHeading}</p>
        <button type="button" className="manage-link" onClick={onManage}>
          Manage schedule
        </button>
      </header>

      <section className="schedule-section">
        <h2 className="section-heading">Your schedule</h2>
        {personalOccurrences.length === 0 ? (
          <p className="empty-state">
            No personal medicines yet. Use "Manage schedule" to add one for yourself or set one up
            for a family member on this device.
          </p>
        ) : (
          renderList(orderedPersonal, personalCurrentId)
        )}
      </section>

      <section className="schedule-section">
        <p className="demo-label">Fictional demo schedule</p>
        {renderList(orderedDemo, demoCurrentId)}
      </section>
    </main>
  )
}
