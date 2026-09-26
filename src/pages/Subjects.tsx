import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Subject = {
  id: string
  name: string
  is_archived: boolean
}

function normalizeSubjectName(name: string) {
  return name.trim().toLowerCase()
}

export default function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadSubjects = async () => {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('subjects')
      .select('id, name, is_archived')
      .eq('is_archived', false)
      .order('name')

    if (error) {
      setError(error.message)
    } else {
      setSubjects(data ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadSubjects()
  }, [])

  const handleAddSubject = async (event: React.FormEvent) => {
    event.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName) return

    setSaving(true)
    setError('')

    const normalizedName = normalizeSubjectName(trimmedName)

    const existing = subjects.find(
      (subject) =>
        normalizeSubjectName(subject.name) === normalizedName,
    )

    if (existing) {
      setError('This subject already exists.')
      setSaving(false)
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
       setError('You must be logged in.')
       setSaving(false)
       return
    }

    const { error } = await supabase.from('subjects').insert({
       user_id: user.id,
       name: trimmedName,
       normalized_name: normalizedName,
    })
    if (error) {
      setError(error.message)
    } else {
      setName('')
      await loadSubjects()
    }

    setSaving(false)
  }

  const handleArchive = async (id: string) => {
    const { error } = await supabase
      .from('subjects')
      .update({ is_archived: true })
      .eq('id', id)

    if (error) {
      setError(error.message)
      return
    }

    await loadSubjects()
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white">Subjects</h1>

      <p className="mt-2 text-slate-400">
        What are you studying today?
      </p>

      <form
        onSubmit={handleAddSubject}
        className="mt-6 flex max-w-xl gap-3"
      >
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Indian Polity, React, Thermodynamics"
          className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
        />

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
        >
          {saving ? 'Adding...' : 'Add'}
        </button>
      </form>

      {error && (
        <p className="mt-4 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="mt-8 max-w-xl">
        {loading ? (
          <p className="text-slate-400">Loading subjects...</p>
        ) : subjects.length === 0 ? (
          <p className="text-slate-400">
            No subjects yet. Add your first subject.
          </p>
        ) : (
          <div className="space-y-3">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-4"
              >
                <span className="font-medium text-white">
                  {subject.name}
                </span>

                <button
                  type="button"
                  onClick={() => handleArchive(subject.id)}
                  className="text-sm text-slate-400 hover:text-red-400"
                >
                  Archive
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}