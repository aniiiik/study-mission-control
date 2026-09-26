import { useCallback, useEffect, useState } from 'react'
import {
  Calculator as CalculatorIcon,
  Check,
  Clock3,
  Flame,
  Pause,
  Play,
  Sparkles,
  X,
} from 'lucide-react'
import Calculator from '../components/calculator/Calculator'

interface StudySession {
  id: number
  subject: string
  startedAt: string
  endedAt: string
  duration: number
}

const timerAnimations = `
  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes floatGlow {
    0%, 100% {
      transform: translate(0, 0) scale(1);
    }

    50% {
      transform: translate(12px, -10px) scale(1.05);
    }
  }

  @keyframes timerPulse {
    0%, 100% {
      text-shadow: 0 0 0 rgba(139, 92, 246, 0);
    }

    50% {
      text-shadow: 0 0 30px rgba(139, 92, 246, 0.35);
    }
  }

  @keyframes statusPulse {
    0%, 100% {
      opacity: 0.7;
    }

    50% {
      opacity: 1;
    }
  }

  .timer-fade-up {
    animation: fadeUp 0.6s ease-out both;
  }

  .timer-float-glow {
    animation: floatGlow 7s ease-in-out infinite;
  }

  .timer-running {
    animation: timerPulse 2s ease-in-out infinite;
  }

  .timer-status-running {
    animation: statusPulse 2s ease-in-out infinite;
  }

  .timer-card {
    transition:
      transform 300ms ease,
      border-color 300ms ease,
      background 300ms ease,
      box-shadow 300ms ease;
  }

  .timer-card:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.16);

    box-shadow:
      0 25px 60px rgba(0, 0, 0, 0.35),
      0 0 40px rgba(139, 92, 246, 0.04);
  }

  .timer-input {
    transition:
      border-color 250ms ease,
      box-shadow 250ms ease,
      background 250ms ease;
  }

  .timer-input:focus {
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.08);
    background: rgba(255, 255, 255, 0.02);
  }

  .info-card {
    transition:
      transform 200ms ease,
      border-color 200ms ease,
      background 200ms ease,
      box-shadow 200ms ease;
  }

  .info-card:hover {
    transform: translateY(-4px);
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.05);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  }

  .mode-button {
    transition:
      transform 180ms ease,
      background 180ms ease,
      color 180ms ease,
      box-shadow 180ms ease;
  }

  .mode-button:hover {
    transform: translateY(-1px);
  }

  .action-button {
    transition:
      transform 150ms ease,
      background 150ms ease,
      color 150ms ease,
      box-shadow 150ms ease;
  }

  .action-button:hover {
    transform: translateY(-2px) scale(1.03);
  }

  .action-button:active {
    transform: scale(0.95);
  }

  .icon-button {
    transition:
      transform 200ms ease,
      color 200ms ease;
  }

  .icon-button:hover {
    transform: rotate(4deg) scale(1.08);
  }

  .streak-pill {
    transition:
      transform 200ms ease,
      border-color 200ms ease,
      background 200ms ease;
  }

  .streak-pill:hover {
    transform: translateY(-2px);
    border-color: rgba(249, 115, 22, 0.35);
    background: rgba(249, 115, 22, 0.15);
  }

  .status-pill {
    transition:
      transform 250ms ease,
      border-color 250ms ease,
      background 250ms ease;
  }

  .status-pill:hover {
    transform: translateY(-1px);
  }

  .session-row {
    transition:
      transform 200ms ease,
      background 200ms ease,
      border-color 200ms ease;
  }

  .session-row:hover {
    transform: translateX(3px);
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .calculator-trigger {
    transition:
      transform 180ms ease,
      border-color 180ms ease,
      background 180ms ease,
      box-shadow 180ms ease;
  }

  .calculator-trigger:hover {
    transform: translateY(-2px);
    border-color: rgba(139, 92, 246, 0.35);
    background: rgba(139, 92, 246, 0.12);
    box-shadow: 0 10px 30px rgba(139, 92, 246, 0.08);
  }

  .calculator-trigger:active {
    transform: scale(0.97);
  }

  @media (prefers-reduced-motion: reduce) {
    .timer-fade-up,
    .timer-float-glow,
    .timer-running,
    .timer-status-running {
      animation: none;
    }

    .timer-card,
    .timer-input,
    .info-card,
    .mode-button,
    .action-button,
    .icon-button,
    .streak-pill,
    .status-pill,
    .session-row,
    .calculator-trigger {
      transition: none;
    }
  }
`

function Timer() {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [subject, setSubject] = useState('')
  const [sessionStart, setSessionStart] =
    useState<number | null>(null)
  const [activeStartedAt, setActiveStartedAt] =
    useState<number | null>(null)
  const [sessions, setSessions] =
    useState<StudySession[]>([])
  const [isCalculatorOpen, setIsCalculatorOpen] =
    useState(false)

  /*
   * Calculate the current elapsed study time.
   *
   * Because this uses Date.now(), the timer continues
   * counting even when the browser is minimized or
   * another tab/app is being used.
   */
  const getCurrentSeconds = useCallback(() => {
    if (
      !isRunning ||
      activeStartedAt === null
    ) {
      return seconds
    }

    const currentActiveSeconds = Math.floor(
      (Date.now() - activeStartedAt) / 1000,
    )

    return seconds + currentActiveSeconds
  }, [isRunning, activeStartedAt, seconds])

  /*
   * Update the visible timer once every second.
   *
   * Previously this was 250ms, which caused 4 React
   * updates per second. One update per second is enough
   * for a study timer and reduces unnecessary work.
   */
  useEffect(() => {
    if (
      !isRunning ||
      activeStartedAt === null
    ) {
      return
    }

    const interval = setInterval(() => {
      const currentSeconds =
        getCurrentSeconds()

      setSeconds((previousSeconds) =>
        Math.max(
          previousSeconds,
          currentSeconds,
        ),
      )
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [
    isRunning,
    activeStartedAt,
    getCurrentSeconds,
  ])

  const handleStart = () => {
    if (!subject.trim()) {
      alert(
        'Please enter what you are studying first.',
      )
      return
    }

    const now = Date.now()

    if (sessionStart === null) {
      setSessionStart(now)
    }

    setActiveStartedAt(now)
    setIsRunning(true)
  }

  const handlePause = () => {
    if (
      !isRunning ||
      activeStartedAt === null
    ) {
      return
    }

    const now = Date.now()

    const activeSeconds = Math.floor(
      (now - activeStartedAt) / 1000,
    )

    setSeconds(
      (previousSeconds) =>
        previousSeconds + activeSeconds,
    )

    setActiveStartedAt(null)
    setIsRunning(false)
  }

  const handleResume = () => {
    if (sessionStart === null) {
      return
    }

    setActiveStartedAt(Date.now())
    setIsRunning(true)
  }

  const handleFinish = () => {
    if (sessionStart === null) {
      return
    }

    let finalDuration = seconds

    if (
      isRunning &&
      activeStartedAt !== null
    ) {
      const activeSeconds = Math.floor(
        (Date.now() - activeStartedAt) /
          1000,
      )

      finalDuration =
        seconds + activeSeconds
    }

    if (finalDuration <= 0) {
      return
    }

    const endedAt = Date.now()

    const newSession: StudySession = {
      id: Date.now(),
      subject: subject.trim(),
      startedAt:
        new Date(
          sessionStart,
        ).toISOString(),
      endedAt:
        new Date(
          endedAt,
        ).toISOString(),
      duration: finalDuration,
    }

    setSessions(
      (previousSessions) => [
        newSession,
        ...previousSessions,
      ],
    )

    setIsRunning(false)
    setSeconds(0)
    setSessionStart(null)
    setActiveStartedAt(null)
    setSubject('')
  }

  const handleReset = () => {
    setIsRunning(false)
    setSeconds(0)
    setSessionStart(null)
    setActiveStartedAt(null)
    setSubject('')
  }

  const currentSeconds =
    getCurrentSeconds()

  const hours = Math.floor(
    currentSeconds / 3600,
  )

  const minutes = Math.floor(
    (currentSeconds % 3600) / 60,
  )

  const secs =
    currentSeconds % 60

  const formattedTime =
    `${hours
      .toString()
      .padStart(2, '0')}:` +
    `${minutes
      .toString()
      .padStart(2, '0')}:` +
    `${secs
      .toString()
      .padStart(2, '0')}`

  const formatDuration = (
    totalSeconds: number,
  ) => {
    const durationHours =
      Math.floor(
        totalSeconds / 3600,
      )

    const durationMinutes =
      Math.floor(
        (totalSeconds % 3600) / 60,
      )

    const durationSeconds =
      totalSeconds % 60

    if (durationHours > 0) {
      return `${durationHours}h ${durationMinutes}m`
    }

    if (durationMinutes > 0) {
      return `${durationMinutes}m ${durationSeconds}s`
    }

    return `${durationSeconds}s`
  }

  const formatTime = (
    isoTime: string,
  ) => {
    return new Date(
      isoTime,
    ).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
      <style>{timerAnimations}</style>

      <div className="min-h-screen bg-[#070b14] px-4 py-8 text-white sm:px-6">
        <div className="mx-auto max-w-4xl">

          {/* Header */}
          <div className="timer-fade-up mb-8 flex flex-wrap items-end justify-between gap-4">

            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-violet-400">
                <Sparkles
                  size={16}
                  className="icon-button"
                />

                <span>
                  FOCUS MODE
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Lock in. 🎧
              </h1>

              <p className="mt-2 text-slate-400">
                One session. One subject.
                Zero distractions.
              </p>
            </div>

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={() =>
                  setIsCalculatorOpen(true)
                }
                className="calculator-trigger flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-slate-300"
              >
                <CalculatorIcon size={16} />

                <span>
                  Calculator
                </span>
              </button>

              <div className="streak-pill hidden items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-sm text-orange-300 sm:flex">

                <Flame
                  size={15}
                  className={
                    isRunning
                      ? 'timer-status-running'
                      : ''
                  }
                />

                0 day streak
              </div>

            </div>
          </div>

          {/* Main Timer Card */}
          <div className="timer-card timer-fade-up relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-xl sm:p-8">

            <div className="timer-float-glow pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />

            <div
              className="timer-float-glow pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl"
              style={{
                animationDelay: '-3s',
              }}
            />

            <div className="relative">

              {/* Subject */}
              <div className="mb-8">

                <label
                  htmlFor="subject"
                  className="mb-3 block text-sm font-medium text-slate-300"
                >
                  What are you studying
                  today?
                </label>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-1.5 transition focus-within:border-violet-500/50">

                  <input
                    id="subject"
                    type="text"
                    value={subject}
                    disabled={
                      sessionStart !== null
                    }
                    onChange={(event) =>
                      setSubject(
                        event.target.value,
                      )
                    }
                    placeholder="e.g. Indian Polity, React, Thermodynamics..."
                    className="timer-input w-full bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                </div>

                <p className="mt-2 px-1 text-xs text-slate-500">
                  {sessionStart !== null
                    ? 'Finish or discard this session to change the subject.'
                    : "Type any subject. We'll remember it for your future sessions."}
                </p>

              </div>

              {/* Timer modes */}
              <div className="mx-auto flex w-fit rounded-full border border-white/10 bg-black/30 p-1">

                <button
                  type="button"
                  className="mode-button flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg"
                >
                  <Clock3 size={16} />

                  Stopwatch
                </button>

                <button
                  type="button"
                  className="mode-button rounded-full px-5 py-2 text-sm font-medium text-slate-400 hover:text-white"
                >
                  Pomodoro
                </button>

              </div>

              {/* Timer */}
              <div className="py-14 text-center">

                <div className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
                  Focused time
                </div>

                <div
                  className={`mt-4 font-mono text-6xl font-bold tracking-tighter text-white sm:text-8xl ${
                    isRunning
                      ? 'timer-running'
                      : ''
                  }`}
                >
                  {formattedTime}
                </div>

                <div
                  className={`mt-4 text-sm ${
                    isRunning
                      ? 'timer-status-running text-violet-300'
                      : 'text-slate-500'
                  }`}
                >
                  {isRunning
                    ? 'Focus mode is active. Stay locked in. ⚡'
                    : sessionStart !== null
                      ? 'Session paused. Resume when ready.'
                      : currentSeconds > 0
                        ? 'Session ready to continue.'
                        : 'Ready when you are.'}
                </div>

              </div>

              {/* Actions */}
              <div className="flex flex-wrap justify-center gap-3">

                {sessionStart === null && (
                  <button
                    type="button"
                    onClick={handleStart}
                    className="action-button group flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-slate-950 shadow-lg shadow-white/10 hover:bg-slate-100 hover:shadow-xl hover:shadow-white/10"
                  >
                    <Play
                      size={18}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />

                    Start Session
                  </button>
                )}

                {sessionStart !== null &&
                  isRunning && (
                    <button
                      type="button"
                      onClick={handlePause}
                      className="action-button flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-6 py-3.5 font-medium text-slate-300 hover:bg-white/10 hover:text-white"
                    >
                      <Pause size={18} />

                      Pause
                    </button>
                  )}

                {sessionStart !== null &&
                  !isRunning && (
                    <button
                      type="button"
                      onClick={handleResume}
                      className="action-button flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-slate-950 shadow-lg hover:bg-slate-100"
                    >
                      <Play size={18} />

                      Resume
                    </button>
                  )}

                {sessionStart !== null &&
                  currentSeconds > 0 && (
                    <button
                      type="button"
                      onClick={handleFinish}
                      className="action-button flex items-center gap-2 rounded-full bg-violet-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-violet-500/20 hover:bg-violet-400"
                    >
                      <Check size={18} />

                      Finish Session
                    </button>
                  )}

                {sessionStart !== null && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="action-button flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-5 py-3.5 font-medium text-slate-300 hover:bg-white/10 hover:text-white"
                  >
                    <X size={18} />

                    Discard
                  </button>
                )}

              </div>

              {/* Status */}
              <div className="mt-8 flex justify-center">

                <div className="status-pill rounded-full border border-white/5 bg-white/[0.03] px-4 py-2 text-xs text-slate-500">
                  💡 Background/minimized time
                  continues to count
                </div>

              </div>

            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-5 grid gap-4 sm:grid-cols-3">

            <div className="info-card timer-fade-up rounded-2xl border border-white/5 bg-white/[0.03] p-4">
              <p className="text-xs text-slate-500">
                Today's goal
              </p>

              <p className="mt-1 text-lg font-semibold">
                2h 00m
              </p>
            </div>

            <div
              className="info-card timer-fade-up rounded-2xl border border-white/5 bg-white/[0.03] p-4"
              style={{
                animationDelay: '100ms',
              }}
            >
              <p className="text-xs text-slate-500">
                Today's focus
              </p>

              <p className="mt-1 text-lg font-semibold">
                {Math.floor(
                  currentSeconds / 3600,
                )}
                h{' '}
                {Math.floor(
                  (currentSeconds %
                    3600) /
                    60,
                )
                  .toString()
                  .padStart(2, '0')}
                m
              </p>
            </div>

            <div
              className="info-card timer-fade-up rounded-2xl border border-white/5 bg-white/[0.03] p-4"
              style={{
                animationDelay: '200ms',
              }}
            >
              <p className="text-xs text-slate-500">
                Sessions today
              </p>

              <p className="mt-1 text-lg font-semibold">
                {sessions.length}
              </p>
            </div>

          </div>

          {/* Session History */}
          <div className="timer-fade-up mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:p-6">

            <div className="mb-5 flex items-center justify-between">

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400">
                  Activity
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  Today's Sessions
                </h2>
              </div>

              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-400">
                {sessions.length}{' '}
                {sessions.length === 1
                  ? 'session'
                  : 'sessions'}
              </span>

            </div>

            {sessions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 px-5 py-10 text-center">

                <Clock3
                  size={28}
                  className="mx-auto text-slate-600"
                />

                <p className="mt-3 text-sm text-slate-400">
                  No completed sessions
                  yet.
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  Start studying and your
                  sessions will appear
                  here.
                </p>

              </div>
            ) : (
              <div className="space-y-3">

                {sessions.map(
                  (session) => (
                    <div
                      key={session.id}
                      className="session-row flex flex-col gap-3 rounded-2xl border border-white/5 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >

                      <div className="min-w-0">

                        <p className="truncate font-medium text-white">
                          {session.subject}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatTime(
                            session.startedAt,
                          )}
                          {' → '}
                          {formatTime(
                            session.endedAt,
                          )}
                        </p>

                      </div>

                      <div className="flex items-center gap-2">

                        <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
                          {formatDuration(
                            session.duration,
                          )}
                        </span>

                      </div>

                    </div>
                  ),
                )}

              </div>
            )}

          </div>

        </div>
      </div>

      {/* Calculator */}
      {isCalculatorOpen && (
        <Calculator
          onClose={() =>
            setIsCalculatorOpen(false)
          }
        />
      )}
    </>
  )
}

export default Timer