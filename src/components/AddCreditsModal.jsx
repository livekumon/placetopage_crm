import { useEffect, useRef, useState } from 'react'
import { updateUserCredits } from '../api/client'

/**
 * Modal for admins to add/remove publishing credits for a user.
 *
 * Props:
 *   user   – { id, name, email, publishingCredits }
 *   onClose(updatedCredits?: number) – called on dismiss or success
 */
export default function AddCreditsModal({ user, onClose }) {
  const [mode, setMode]       = useState('add')   // 'add' | 'set'
  const [value, setValue]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const inputRef              = useRef(null)
  const backdropRef           = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleBackdrop(e) {
    if (e.target === backdropRef.current) onClose()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const num = parseInt(value, 10)
    if (isNaN(num)) { setError('Enter a valid number.'); return }
    if (mode === 'set' && num < 0) { setError('Cannot set negative credits.'); return }

    setError('')
    setLoading(true)
    try {
      const payload = mode === 'add' ? { add: num } : { set: num }
      const result  = await updateUserCredits(user.id, payload)
      onClose(result.publishingCredits)
    } catch (err) {
      setError(err.message || 'Failed to update credits.')
    } finally {
      setLoading(false)
    }
  }

  const currentCredits = user.publishingCredits ?? 0
  const preview = (() => {
    const n = parseInt(value, 10)
    if (isNaN(n)) return null
    if (mode === 'add') return Math.max(0, currentCredits + n)
    return Math.max(0, n)
  })()

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Manage Credits</h2>
            <p className="text-sm text-slate-500 mt-0.5 truncate max-w-[220px]">
              {user.name || user.email}
            </p>
          </div>
          <button
            onClick={() => onClose()}
            className="ml-2 rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Current balance */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <span className="text-sm text-slate-500 font-medium">Current balance</span>
          <span className={`text-xl font-bold ${currentCredits > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
            {currentCredits} credit{currentCredits !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-2">
            {[
              { key: 'add', label: 'Add / Remove' },
              { key: 'set', label: 'Set absolute' },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => { setMode(key); setValue(''); setError('') }}
                className={`flex-1 rounded-xl py-2 text-sm font-semibold border transition ${
                  mode === key
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Value input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              {mode === 'add' ? 'Credits to add (use negative to deduct)' : 'New total credits'}
            </label>
            <input
              ref={inputRef}
              type="number"
              value={value}
              onChange={(e) => { setValue(e.target.value); setError('') }}
              placeholder={mode === 'add' ? 'e.g. 5 or -2' : 'e.g. 10'}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
            />
          </div>

          {/* Preview */}
          {preview !== null && (
            <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-indigo-700">New balance</span>
              <span className="font-bold text-indigo-800 text-lg">{preview} credit{preview !== 1 ? 's' : ''}</span>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => onClose()}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !value}
              className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
