import { useState, type FormEvent } from 'react'
import { formatScheduledTime } from './formatTime'
import { usePersonalMedicines, validateMedicineInput, type MedicineInput } from './personalSchedule'
import type { PersonalMedicine } from './types'
import './ManageScreen.css'

interface ManageScreenProps {
  medicinesKey: string
  seed?: PersonalMedicine[]
  isDemo: boolean
  onBack: () => void
}

const EMPTY_FORM: MedicineInput = { name: '', directions: '', times: [''] }

function toFormInput(medicine: PersonalMedicine): MedicineInput {
  return { name: medicine.name, directions: medicine.directions, times: [...medicine.times] }
}

export default function ManageScreen({ medicinesKey, seed, isDemo, onBack }: ManageScreenProps) {
  const { medicines, addMedicine, updateMedicine, archiveMedicine } = usePersonalMedicines(
    medicinesKey,
    seed,
  )

  const activeMedicines = medicines.filter((m) => !m.archived)
  const archivedMedicines = medicines.filter((m) => m.archived)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(() => activeMedicines.length === 0)
  const [form, setForm] = useState<MedicineInput>(EMPTY_FORM)
  const [errors, setErrors] = useState<string[]>([])

  function openAddForm() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setErrors([])
    setFormOpen(true)
  }

  function startEdit(medicine: PersonalMedicine) {
    setEditingId(medicine.id)
    setForm(toFormInput(medicine))
    setErrors([])
    setFormOpen(true)
  }

  function closeForm() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setErrors([])
    setFormOpen(activeMedicines.length === 0)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const validationErrors = validateMedicineInput(form)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    if (editingId) {
      updateMedicine(editingId, form)
      // Make it easy to go back and see the updated time take effect.
      onBack()
      return
    }

    addMedicine(form)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setErrors([])
    setFormOpen(false)
  }

  function handleArchive(id: string) {
    archiveMedicine(id)
    if (editingId === id) closeForm()
  }

  function updateTime(index: number, value: string) {
    setForm((prev) => ({
      ...prev,
      times: prev.times.map((t, i) => (i === index ? value : t)),
    }))
  }

  function addTimeField() {
    setForm((prev) => ({ ...prev, times: [...prev.times, ''] }))
  }

  function removeTimeField(index: number) {
    setForm((prev) => ({
      ...prev,
      times: prev.times.length > 1 ? prev.times.filter((_, i) => i !== index) : [''],
    }))
  }

  const formHeading = editingId
    ? 'Edit medicine'
    : activeMedicines.length === 0
      ? 'Add your first medicine'
      : 'Add a medicine'

  return (
    <main className="manage-screen">
      <header className="manage-header">
        <button type="button" className="back-link" onClick={onBack}>
          ← Back to Today
        </button>
        <h1>Manage schedule</h1>
        <p className="manage-subtitle">
          {isDemo
            ? 'This is the fictional demo schedule. Changes here are isolated from your personal data.'
            : 'Add your own medicines, or set up a schedule for a family member on this device.'}
        </p>
      </header>

      <section className="medicine-list-section">
        {activeMedicines.length > 0 && (
          <>
            <h2 className="section-heading">Your medicines</h2>
            <ul className="medicine-list">
            {activeMedicines.map((medicine) => (
              <li className="medicine-item" key={medicine.id}>
                <h3 className="medicine-item-name">{medicine.name}</h3>
                {medicine.directions && (
                  <p className="medicine-item-directions">{medicine.directions}</p>
                )}
                <p className="medicine-item-times">
                  {medicine.times.map(formatScheduledTime).join(' · ')}
                </p>
                <div className="medicine-item-actions">
                  <button type="button" className="edit-button" onClick={() => startEdit(medicine)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="archive-button"
                    onClick={() => handleArchive(medicine.id)}
                  >
                    Archive
                  </button>
                </div>
              </li>
            ))}
            </ul>
          </>
        )}

        {!formOpen && (
          <button type="button" className="add-medicine-button" onClick={openAddForm}>
            + Add medicine
          </button>
        )}
      </section>

      {formOpen && (
        <form className="medicine-form" onSubmit={handleSubmit}>
          <h2 className="form-heading">{formHeading}</h2>

          <label className="field-label" htmlFor="medicine-name">
            Medicine name
          </label>
          <input
            id="medicine-name"
            className="text-input"
            type="text"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Metformin 500mg"
          />

          <label className="field-label" htmlFor="medicine-directions">
            Directions
          </label>
          <textarea
            id="medicine-directions"
            className="text-input"
            value={form.directions}
            onChange={(e) => setForm((prev) => ({ ...prev, directions: e.target.value }))}
            placeholder="e.g. Take one tablet with breakfast"
            rows={2}
          />

          <span className="field-label">Times</span>
          <div className="times-list">
            {form.times.map((time, index) => (
              <div className="time-row" key={index}>
                <input
                  type="time"
                  className="time-input"
                  aria-label={`Time ${index + 1}`}
                  value={time}
                  onChange={(e) => updateTime(index, e.target.value)}
                />
                <button
                  type="button"
                  className="remove-time-button"
                  onClick={() => removeTimeField(index)}
                  aria-label={`Remove time ${index + 1}`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="add-time-button" onClick={addTimeField}>
            Add another time
          </button>

          {errors.length > 0 && (
            <ul className="form-errors" aria-live="polite">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}

          <div className="form-actions">
            <button type="submit" className="save-button">
              {editingId ? 'Save changes' : 'Add medicine'}
            </button>
            {activeMedicines.length > 0 && (
              <button type="button" className="cancel-button" onClick={closeForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {archivedMedicines.length > 0 && (
        <section className="medicine-list-section archived-section">
          <h2 className="section-heading">Archived</h2>
          <ul className="medicine-list">
            {archivedMedicines.map((medicine) => (
              <li className="medicine-item is-archived" key={medicine.id}>
                <h3 className="medicine-item-name">{medicine.name}</h3>
                <p className="medicine-item-times">
                  {medicine.times.map(formatScheduledTime).join(' · ')}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
