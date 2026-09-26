import { useEffect, useState } from 'react'
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
import { supabase } from '../lib/supabase'

interface Subject {
  id: string
  name: string
  is_archived: boolean
}

interface StudySession {
  id: string
  subject: string
  startedAt: string
  endedAt: string
  duration: number
}

const MAX_CONTINUOUS_SECONDS = 4 * 60 * 60
const HEARTBEAT_INTERVAL_MS = 20_000

const timerAnimations = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes floatGlow {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(12px, -10px) scale(1.05); }
  }

  @keyframes timerPulse {
    0%, 100% { text-shadow: 0 0 0 rgba(139, 92, 246, 0); }
    50% { text-shadow: 0 0 30px rgba(139, 92, 246, 0.35); }
  }

  @keyframes statusPulse {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
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
  const [subjectId, setSubjectId] = useState('')
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [subjectsLoading, setSubjectsLoading] = useState(true)

  const [activeStartedAt, setActiveStartedAt] =
    useState<number | null>(null)

  /*
   * IMPORTANT:
   * This tracks the beginning of the CURRENT
   * continuous run only.
   *
   * It is reset whenever the user pauses
   * and starts again.
   */
  const [continuousStartedAt, setContinuousStartedAt] =
    useState<number | null>(null)

  const [databaseSessionId, setDatabaseSessionId] =
    useState<string | null>(null)

  const [sessionStart, setSessionStart] =
    useState<number | null>(null)

  const [sessions, setSessions] =
    useState<StudySession[]>([])

  const [isCalculatorOpen, setIsCalculatorOpen] =
    useState(false)

  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  /*
   * Load subjects
   */
  useEffect(() => {
    const loadSubjects = async () => {
      setSubjectsLoading(true)

      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, is_archived')
        .eq('is_archived', false)
        .order('name')

      if (error) {
        console.error('Failed to load subjects:', error)

        setErrorMessage(
          `Failed to load subjects: ${error.message}`,
        )
      } else {
        setSubjects(data ?? [])
      }

      setSubjectsLoading(false)
    }

    loadSubjects()
  }, [])

  /*
   * Refresh recovery.
   */
  useEffect(() => {
    if (subjectsLoading || subjects.length === 0) {
      return
    }

    const recoverSession = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: session, error } = await supabase
        .from('study_sessions')
        .select(`
          id,
          subject_id,
          started_at,
          active_started_at,
          focused_seconds,
          status,
          pause_started_at
        `)
        .eq('user_id', user.id)
        .in('status', ['active', 'paused'])
        .order('created_at', {
          ascending: false,
        })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error(
          'Failed to recover session:',
          error,
        )
        return
      }

      if (!session) return

      const selectedSubject = subjects.find(
        (item) => item.id === session.subject_id,
      )

      if (!selectedSubject) {
        setErrorMessage(
          'The subject for this session could not be found.',
        )
        return
      }

      setDatabaseSessionId(session.id)

      setSessionStart(
        new Date(session.started_at).getTime(),
      )

      setSeconds(session.focused_seconds)

      setSubjectId(session.subject_id)

      setSubject(selectedSubject.name)

      /*
       * ACTIVE SESSION
       */
      if (
        session.status === 'active' &&
        session.active_started_at
      ) {
        const activeStartedMs =
          new Date(
            session.active_started_at,
          ).getTime()

        const elapsed = Math.floor(
          (Date.now() - activeStartedMs) / 1000,
        )

        /*
         * IMPORTANT:
         *
         * 4-hour limit applies ONLY to the
         * current active run.
         *
         * Previously this incorrectly used:
         *
         * focused_seconds + elapsed
         *
         * which made the 4-hour limit apply
         * to the entire session.
         */
        if (elapsed >= MAX_CONTINUOUS_SECONDS) {
          const pauseAt = new Date(
            activeStartedMs +
              MAX_CONTINUOUS_SECONDS * 1000,
          )

          const newTotal =
            session.focused_seconds +
            MAX_CONTINUOUS_SECONDS

          const { error: pauseError } =
            await supabase
              .from('study_sessions')
              .update({
                status: 'paused',
                focused_seconds: newTotal,
                active_started_at: null,
                pause_started_at:
                  pauseAt.toISOString(),
                last_heartbeat_at:
                  new Date().toISOString(),
              })
              .eq('id', session.id)

          if (pauseError) {
            console.error(
              'Failed to recover auto-pause:',
              pauseError,
            )
            return
          }

          setSeconds(newTotal)
          setActiveStartedAt(null)
          setContinuousStartedAt(null)
          setIsRunning(false)

          setErrorMessage(
            '4-hour continuous study limit reached. The timer has been paused. You can resume whenever you are ready.',
          )

          return
        }

        setActiveStartedAt(activeStartedMs)

        /*
         * Recovery means this active run started
         * at active_started_at.
         */
        setContinuousStartedAt(activeStartedMs)

        setIsRunning(true)
      } else {
        /*
         * PAUSED SESSION
         */
        setActiveStartedAt(null)
        setContinuousStartedAt(null)
        setIsRunning(false)
      }
    }

    recoverSession()
  }, [subjects, subjectsLoading])

  /*
   * Force React to re-render once per second.
   */
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    if (!isRunning) {
      return
    }

    const interval = window.setInterval(() => {
      forceUpdate((value) => value + 1)
    }, 1000)

    return () =>
      window.clearInterval(interval)
  }, [isRunning])

  /*
   * Calculate current focused seconds.
   */
  const getCurrentSeconds = () => {
    if (
      !isRunning ||
      activeStartedAt === null
    ) {
      return seconds
    }

    const currentActiveSeconds =
      Math.floor(
        (Date.now() - activeStartedAt) / 1000,
      )

    return seconds + currentActiveSeconds
  }

  /*
   * Heartbeat + 4-hour automatic pause.
   *
   * IMPORTANT:
   * 4-hour calculation uses ONLY the current
   * continuous run.
   */
  useEffect(() => {
    if (
      !isRunning ||
      !databaseSessionId ||
      activeStartedAt === null ||
      continuousStartedAt === null
    ) {
      return
    }

    const checkSession = async () => {
      const nowMs = Date.now()

      /*
       * Current continuous run duration.
       */
      const continuousSeconds =
        Math.floor(
          (nowMs - continuousStartedAt) / 1000,
        )

      /*
       * Total session duration:
       * previous focused time + current run.
       */
      const activeSeconds =
        Math.floor(
          (nowMs - activeStartedAt) / 1000,
        )

      const totalSeconds =
        seconds + activeSeconds

      /*
       * 4-hour continuous limit.
       */
      if (
        continuousSeconds >=
        MAX_CONTINUOUS_SECONDS
      ) {
        const pauseAt = new Date(
          continuousStartedAt +
            MAX_CONTINUOUS_SECONDS * 1000,
        )

        const newTotal =
          seconds +
          MAX_CONTINUOUS_SECONDS

        const { error } =
          await supabase
            .from('study_sessions')
            .update({
              status: 'paused',
              focused_seconds: newTotal,
              active_started_at: null,
              pause_started_at:
                pauseAt.toISOString(),
              last_heartbeat_at:
                new Date().toISOString(),
            })
            .eq('id', databaseSessionId)

        if (error) {
          console.error(
            'Failed to auto-pause session:',
            error,
          )
          return
        }

        setSeconds(newTotal)
        setActiveStartedAt(null)
        setContinuousStartedAt(null)
        setIsRunning(false)

        setErrorMessage(
          '4-hour continuous study limit reached. The timer has been paused. You can resume whenever you are ready.',
        )

        return
      }

      /*
       * Heartbeat.
       */
      const heartbeatTime =
        new Date().toISOString()

      const { error } = await supabase
        .from('study_sessions')
        .update({
          focused_seconds:
            totalSeconds,
          last_heartbeat_at:
            heartbeatTime,
        })
        .eq('id', databaseSessionId)

      if (error) {
        console.error(
          'Heartbeat failed:',
          error,
        )
      }
    }

    /*
     * Run immediately.
     */
    checkSession()

    /*
     * Then every 20 seconds.
     */
    const interval = window.setInterval(
      checkSession,
      HEARTBEAT_INTERVAL_MS,
    )

    return () =>
      window.clearInterval(interval)
  }, [
    isRunning,
    databaseSessionId,
    activeStartedAt,
    continuousStartedAt,
    seconds,
  ])

  /*
   * Subject selection.
   */
  const handleSubjectChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const selectedId =
      event.target.value

    setSubjectId(selectedId)

    const selectedSubject =
      subjects.find(
        (item) =>
          item.id === selectedId,
      )

    setSubject(
      selectedSubject?.name ?? '',
    )
  }

  /*
   * Start new session.
   */
  const handleStart = async () => {
    if (!subjectId) {
      alert(
        'Please select what you are studying first.',
      )
      return
    }

    setSaving(true)
    setErrorMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setErrorMessage(
        'You must be logged in to start a study session.',
      )
      setSaving(false)
      return
    }

    /*
     * Check if another open session exists.
     */
    const { data: existingSession } =
      await supabase
        .from('study_sessions')
        .select('id, status')
        .eq('user_id', user.id)
        .in('status', [
          'active',
          'paused',
        ])
        .limit(1)
        .maybeSingle()

    if (existingSession) {
      setErrorMessage(
        'You already have an open study session. Recovering it instead of starting another one.',
      )

      setSaving(false)

      window.location.reload()

      return
    }

    const now = new Date()
    const nowMs = now.getTime()

    const { data, error } =
      await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          subject_id: subjectId,
          mode: 'stopwatch',
          status: 'active',
          started_at:
            now.toISOString(),
          active_started_at:
            now.toISOString(),
          focused_seconds: 0,
          last_heartbeat_at:
            now.toISOString(),
        })
        .select('id')
        .single()

    if (error) {
      console.error(
        'Failed to create study session:',
        error,
      )

      setErrorMessage(
        `Could not start session: ${error.message}`,
      )

      setSaving(false)
      return
    }

    setDatabaseSessionId(data.id)
    setSessionStart(nowMs)
    setActiveStartedAt(nowMs)

    /*
     * NEW continuous run starts here.
     */
    setContinuousStartedAt(nowMs)

    setSeconds(0)
    setIsRunning(true)

    /*
     * Polished start message.
     */
    setErrorMessage(
      'Study session started. You can study for up to 4 hours continuously. The timer will pause automatically after 4 hours. You can resume whenever you are ready.',
    )

    setSaving(false)
  }

  /*
   * Pause.
   */
  const handlePause = async () => {
    if (
      !isRunning ||
      activeStartedAt === null ||
      !databaseSessionId
    ) {
      return
    }

    setSaving(true)
    setErrorMessage('')

    const now = new Date()
    const nowMs = now.getTime()

    const activeSeconds =
      Math.floor(
        (nowMs - activeStartedAt) / 1000,
      )

    /*
     * Manual pause ends the current continuous
     * run but keeps total focused time.
     */
    const newTotalSeconds =
      seconds + activeSeconds

    const { error } =
      await supabase
        .from('study_sessions')
        .update({
          status: 'paused',
          focused_seconds:
            newTotalSeconds,
          pause_started_at:
            now.toISOString(),
          active_started_at: null,
          last_heartbeat_at:
            now.toISOString(),
        })
        .eq('id', databaseSessionId)

    if (error) {
      console.error(
        'Failed to pause study session:',
        error,
      )

      setErrorMessage(
        `Could not pause session: ${error.message}`,
      )

      setSaving(false)
      return
    }

    setSeconds(newTotalSeconds)
    setActiveStartedAt(null)

    /*
     * Current continuous run is finished.
     */
    setContinuousStartedAt(null)

    setIsRunning(false)

    setSaving(false)
  }

  /*
   * Resume.
   */
  const handleResume = async () => {
    if (
      !databaseSessionId ||
      sessionStart === null
    ) {
      return
    }

    setSaving(true)
    setErrorMessage('')

    const now = new Date()
    const nowMs = now.getTime()

    const { error } =
      await supabase
        .from('study_sessions')
        .update({
          status: 'active',
          active_started_at:
            now.toISOString(),
          pause_started_at: null,
          last_heartbeat_at:
            now.toISOString(),
        })
        .eq('id', databaseSessionId)

    if (error) {
      console.error(
        'Failed to resume study session:',
        error,
      )

      setErrorMessage(
        `Could not resume session: ${error.message}`,
      )

      setSaving(false)
      return
    }

    setActiveStartedAt(nowMs)

    /*
     * NEW continuous 4-hour window.
     *
     * Previous focused time is preserved in
     * `seconds`.
     */
    setContinuousStartedAt(nowMs)

    setIsRunning(true)

    setSaving(false)
  }

  /*
   * Finish session.
   */
  const handleFinish = async () => {
    if (
      !databaseSessionId ||
      sessionStart === null
    ) {
      return
    }

    setSaving(true)
    setErrorMessage('')

    const finalDuration =
      getCurrentSeconds()

    if (finalDuration <= 0) {
      setSaving(false)
      return
    }

    const endedAt = new Date()

    const { error } =
      await supabase
        .from('study_sessions')
        .update({
          status: 'completed',
          ended_at:
            endedAt.toISOString(),
          focused_seconds:
            finalDuration,
          active_started_at: null,
          pause_started_at: null,
          last_heartbeat_at:
            endedAt.toISOString(),
          updated_at:
            endedAt.toISOString(),
        })
        .eq('id', databaseSessionId)

    if (error) {
      console.error(
        'Failed to finish study session:',
        error,
      )

      setErrorMessage(
        `Could not finish session: ${error.message}`,
      )

      setSaving(false)
      return
    }

    const newSession: StudySession = {
      id: databaseSessionId,
      subject: subject.trim(),
      startedAt:
        new Date(
          sessionStart,
        ).toISOString(),
      endedAt:
        endedAt.toISOString(),
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
    setContinuousStartedAt(null)
    setDatabaseSessionId(null)
    setSubject('')
    setSubjectId('')

    setSaving(false)
  }

  /*
   * Discard session.
   */
  const handleReset = async () => {
    if (databaseSessionId) {
      setSaving(true)

      const { error } =
        await supabase
          .from('study_sessions')
          .update({
            status: 'finalized',
            ended_at:
              new Date().toISOString(),
            active_started_at: null,
            pause_started_at: null,
            focused_seconds: 0,
          })
          .eq('id', databaseSessionId)

      if (error) {
        console.error(
          'Failed to discard study session:',
          error,
        )

        setErrorMessage(
          `Could not discard session: ${error.message}`,
        )

        setSaving(false)
        return
      }

      setSaving(false)
    }

    setIsRunning(false)
    setSeconds(0)
    setSessionStart(null)
    setActiveStartedAt(null)
    setContinuousStartedAt(null)
    setDatabaseSessionId(null)
    setSubject('')
    setSubjectId('')
    setErrorMessage('')
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
                <span>FOCUS MODE</span>
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
                <CalculatorIcon
                  size={16}
                />
                <span>Calculator</span>
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

                  <select
                    id="subject"
                    value={subjectId}
                    disabled={
                      sessionStart !== null ||
                      subjectsLoading ||
                      saving
                    }
                    onChange={
                      handleSubjectChange
                    }
                    className="timer-input w-full cursor-pointer bg-transparent px-4 py-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option
                      value=""
                      className="bg-slate-900 text-slate-400"
                    >
                      {subjectsLoading
                        ? 'Loading subjects...'
                        : subjects.length ===
                            0
                          ? 'No subjects yet — add one first'
                          : 'Select a subject'}
                    </option>

                    {subjects.map(
                      (item) => (
                        <option
                          key={item.id}
                          value={item.id}
                          className="bg-slate-900 text-white"
                        >
                          {item.name}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <p className="mt-2 px-1 text-xs text-slate-500">
                  {sessionStart !== null
                    ? 'Finish or discard this session to change the subject.'
                    : subjects.length ===
                        0
                      ? 'Go to Subjects and add your first subject.'
                      : 'Choose one of your saved subjects for this session.'}
                </p>
              </div>

              {/* Error */}
              {errorMessage && (
                <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {errorMessage}
                </div>
              )}

              {/* Timer modes */}
              <div className="mx-auto flex w-fit rounded-full border border-white/10 bg-black/30 p-1">
                <button
                  type="button"
                  className="mode-button flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg"
                >
                  <Clock3
                    size={16}
                  />
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

                {isRunning && (
                  <p className="mt-3 text-xs text-slate-500">
                    Maximum continuous run:
                    4 hours
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap justify-center gap-3">

                {sessionStart === null && (
                  <button
                    type="button"
                    onClick={handleStart}
                    disabled={
                      saving ||
                      subjectsLoading
                    }
                    className="action-button group flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-slate-950 shadow-lg shadow-white/10 hover:bg-slate-100 hover:shadow-xl hover:shadow-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Play
                      size={18}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />

                    {saving
                      ? 'Starting...'
                      : 'Start Session'}
                  </button>
                )}

                {sessionStart !== null &&
                  isRunning && (
                    <button
                      type="button"
                      onClick={
                        handlePause
                      }
                      disabled={saving}
                      className="action-button flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-6 py-3.5 font-medium text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-50"
                    >
                      <Pause
                        size={18}
                      />

                      {saving
                        ? 'Saving...'
                        : 'Pause'}
                    </button>
                  )}

                {sessionStart !== null &&
                  !isRunning && (
                    <button
                      type="button"
                      onClick={
                        handleResume
                      }
                      disabled={saving}
                      className="action-button flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-slate-950 shadow-lg hover:bg-slate-100 disabled:opacity-50"
                    >
                      <Play
                        size={18}
                      />

                      {saving
                        ? 'Saving...'
                        : 'Resume'}
                    </button>
                  )}

                {sessionStart !== null &&
                  currentSeconds > 0 && (
                    <button
                      type="button"
                      onClick={
                        handleFinish
                      }
                      disabled={saving}
                      className="action-button flex items-center gap-2 rounded-full bg-violet-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-violet-500/20 hover:bg-violet-400 disabled:opacity-50"
                    >
                      <Check
                        size={18}
                      />

                      {saving
                        ? 'Saving...'
                        : 'Finish Session'}
                    </button>
                  )}

                {sessionStart !== null && (
                  <button
                    type="button"
                    onClick={
                      handleReset
                    }
                    disabled={saving}
                    className="action-button flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-5 py-3.5 font-medium text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-50"
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
                  (currentSeconds % 3600) /
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
                {sessions.length ===
                1
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