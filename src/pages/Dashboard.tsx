import { useNavigate } from 'react-router-dom'
function Dashboard() {
    const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Good morning 👋
          </h1>

          <p className="mt-2 text-slate-400">
            Ready to complete today's mission?
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Today's Goal */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-sm text-slate-400">Today's Goal</p>
            <p className="mt-2 text-3xl font-bold text-white">0h 0m</p>
            <p className="mt-1 text-sm text-slate-500">
              Goal: 2h
            </p>
          </div>

          {/* Focused Time */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-sm text-slate-400">Focused Time</p>
            <p className="mt-2 text-3xl font-bold text-white">0h 0m</p>
            <p className="mt-1 text-sm text-slate-500">
              Today
            </p>
          </div>

          {/* Current Streak */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-sm text-slate-400">Current Streak</p>
            <p className="mt-2 text-3xl font-bold text-white">0 days</p>
            <p className="mt-1 text-sm text-slate-500">
              Keep going 🔥
            </p>
          </div>

          {/* Sessions */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
            <p className="text-sm text-slate-400">Sessions Today</p>
            <p className="mt-2 text-3xl font-bold text-white">0</p>
            <p className="mt-1 text-sm text-slate-500">
              Study sessions
            </p>
          </div>
        </div>

        {/* Today's Mission */}
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-6">
          <h2 className="text-xl font-semibold text-white">
            Today's Mission
          </h2>

          <p className="mt-2 text-slate-400">
            Start a study session and make progress toward your daily goal.
          </p>

          <button
            onClick={() => navigate('/timer')}
            className="mt-5 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
          >
            Start Studying
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard