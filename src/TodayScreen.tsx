import { useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { todayLocalDate } from './dateUtils'
import { DEMO_MEDICINE_IDS } from './demoSchedule'
import { formatScheduledTime } from './formatTime'
import {
  buildPersonalOccurrences,
  getRecordedEntries,
  groupPendingByTime,
  groupStatusLabel,
  recordedStatusLabel,
} from './occurrences'
import { usePersonalMedicines } from './personalSchedule'
import { useDoseRecords } from './storage'
import type { Occurrence, PersonalMedicine } from './types'
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
  const allRecordedRef = useRef<HTMLParagraphElement>(null)
  const recordedHeadingRef = useRef<HTMLHeadingElement>(null)

  const occurrences = useMemo(
    () => buildPersonalOccurrences(medicines, records, today, isDemo ? undefined : DEMO_MEDICINE_IDS),
    [medicines, records, today, isDemo],
  )
  const pendingGroups = useMemo(() => groupPendingByTime(occurrences, records), [occurrences, records])
  const recordedEntries = useMemo(() => getRecordedEntries(occurrences, records), [occurrences, records])

  function focusAfterChange(preferredSelector: string | null) {
    if (preferredSelector) {
      const preferred = document.querySelector<HTMLElement>(preferredSelector)
      if (preferred) {
        preferred.focus()
        return
      }
    }
    const nextPending = document.querySelector<HTMLElement>('.mark-taken-button')
    if (nextPending) {
      nextPending.focus()
      return
    }
    allRecordedRef.current?.focus()
    recordedHeadingRef.current?.focus()
  }

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
    flushSync(() => {
      recordDose(occurrence.id, status, {
        medicineName: occurrence.medicineName,
        directions: occurrence.directions,
        scheduledTime: occurrence.time,
      })
    })
    // Keep the user moving through the pending list instead of losing focus to <body>.
    focusAfterChange(null)
  }

  function handleUndo(occurrence: Occurrence) {
    flushSync(() => {
      undoDose(occurrence.id)
    })
    // Return focus to the occurrence's own action, now that it's back in its time group.
    focusAfterChange(`[data-occurrence-id="${CSS.escape(occurrence.id)}"] .mark-taken-button`)
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

      {occurrences.length === 0 ? (
        <p className="empty-state">No medicines yet. Use "Manage schedule" to add the first one.</p>
      ) : (
        <>
          <section className="pending-section" aria-label="Pending medicines">
            {pendingGroups.length === 0 ? (
              <p className="all-recorded-message" tabIndex={-1} ref={allRecordedRef}>
                All scheduled medicines have been recorded for today
              </p>
            ) : (
              pendingGroups.map((group, index) => {
                const status = groupStatusLabel(group.time, today, now)
                const isCurrent = index === 0
                const badgeText = status.kind === 'due' ? 'Up now' : 'Upcoming'
                const heading =
                  group.occurrences.length > 1
                    ? `${formatScheduledTime(group.time)} · ${group.occurrences.length} medicines`
                    : formatScheduledTime(group.time)

                return (
                  <section
                    key={group.time}
                    className={`time-group${isCurrent ? ' is-current' : ''}`}
                  >
                    {isCurrent && <span className="current-badge">{badgeText}</span>}
                    <div className="group-header">
                      <h2 className="group-time">{heading}</h2>
                      <p className={`status-text status-${status.kind}`}>{status.text}</p>
                    </div>
                    <ul className="medicine-rows">
                      {group.occurrences.map((occurrence) => (
                        <li
                          className="medicine-row"
                          key={occurrence.id}
                          data-occurrence-id={occurrence.id}
                        >
                          <h3 className="medicine-row-name">{occurrence.medicineName}</h3>
                          {occurrence.directions && (
                            <p className="medicine-row-directions">{occurrence.directions}</p>
                          )}
                          <div className="occurrence-actions">
                            <button
                              type="button"
                              className="mark-taken-button"
                              onClick={() => attemptRecord(occurrence, 'taken')}
                            >
                              Mark as taken
                            </button>
                            <button
                              type="button"
                              className="skip-button"
                              onClick={() => attemptRecord(occurrence, 'skipped')}
                            >
                              Skip
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                )
              })
            )}
          </section>

          {recordedEntries.length > 0 && (
            <section className="recorded-section" aria-label="Recorded today">
              <h2 className="section-heading" tabIndex={-1} ref={recordedHeadingRef}>
                Recorded today
              </h2>
              <ul className="recorded-list">
                {recordedEntries.map(({ occurrence, record }) => {
                  const status = recordedStatusLabel(record)
                  return (
                    <li
                      className={`recorded-item${occurrence.isGhost ? ' is-ghost' : ''}`}
                      key={occurrence.id}
                      data-occurrence-id={occurrence.id}
                    >
                      <div className="recorded-item-main">
                        <span className="recorded-item-name">{occurrence.medicineName}</span>
                        <span className="recorded-item-time">{formatScheduledTime(occurrence.time)}</span>
                      </div>
                      {occurrence.isGhost && occurrence.isArchivedSource && (
                        <p className="archived-tag">Archived medicine</p>
                      )}
                      <p className={`status-text status-${status.kind}`}>{status.text}</p>
                      <button
                        type="button"
                        className="undo-button"
                        onClick={() => handleUndo(occurrence)}
                      >
                        Undo
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </>
      )}
    </main>
  )
}
