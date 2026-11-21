export type DoseStatus = 'taken' | 'skipped'

/** A medicine the user (or a caregiver on their behalf) has entered, with one or more daily times. */
export interface PersonalMedicine {
  id: string
  name: string
  directions: string
  /** Distinct 24-hour "HH:MM" local times, at least one. */
  times: string[]
  archived: boolean
}

export interface Occurrence {
  /** Stable id: medicineId + local calendar date + scheduled time */
  id: string
  medicineId: string
  medicineName: string
  directions: string
  /** 24-hour "HH:MM" local time */
  time: string
  /** Local calendar date, "YYYY-MM-DD" */
  date: string
  /**
   * True when this occurrence no longer comes from the active schedule (the
   * medicine was edited or archived) and is being shown only because a
   * record for it still exists.
   */
  isGhost: boolean
  /** True when the ghost occurrence's source medicine has been archived. */
  isArchivedSource: boolean
}

export interface DoseRecord {
  status: DoseStatus
  /** ISO timestamp of the actual local moment it was recorded */
  recordedAt: string
  /**
   * Snapshot of the medicine at the moment it was recorded, so later edits or
   * archiving never change how a past record reads. Optional because Phase 1
   * records were saved before these fields existed.
   */
  medicineName?: string
  directions?: string
  scheduledTime?: string
}

export type DoseRecords = Record<string, DoseRecord>
