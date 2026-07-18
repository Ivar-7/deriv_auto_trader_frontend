import {
  Activity,
  ArrowLeft,
  Bot,
  CircleAlert,
  ClipboardCheck,
  LoaderCircle,
  Moon,
  Pause,
  Play,
  Save,
  ShieldAlert,
  Square,
  Sun,
  TrendingUp,
  WalletCards
} from 'lucide-react'
import { type FormEvent, type ReactNode, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusPill } from '../../../shared/components/StatusPill'
import { useAppearance } from '../../../shared/hooks/useAppearance'
import { useBotConsole } from '../hooks/useBotConsole'
import type {
  BotConfiguration,
  BotOutcome,
  BotSession,
  BotType
} from '../types/bots.types'

const inputClassName =
  'mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-white'

const botOptions: readonly { value: BotType; label: string; detail: string }[] =
  [
    {
      value: 'rise_fall',
      label: 'Rise / Fall',
      detail: 'Directional movement confidence, excluding neutral ticks.'
    },
    {
      value: 'over_under',
      label: 'Over / Under',
      detail: 'Digit observations with equal-to-barrier kept separate.'
    },
    {
      value: 'even_odd',
      label: 'Even / Odd',
      detail: 'Digit parity observations over the selected window.'
    },
    {
      value: 'matches_differs',
      label: 'Matches / Differs',
      detail: 'Observed digit outcome for the selected barrier.'
    },
    {
      value: 'smart_auto',
      label: 'Smart Auto Trader',
      detail: 'Chooses the strongest eligible observed deviation, or No Signal.'
    }
  ]

const outcomesByBot: Readonly<
  Record<
    Exclude<BotType, 'smart_auto'>,
    readonly Exclude<BotOutcome, 'no_signal'>[]
  >
> = {
  rise_fall: ['rise', 'fall'],
  over_under: ['over', 'under'],
  even_odd: ['even', 'odd'],
  matches_differs: ['matches', 'differs']
}

const sessionTone: Record<
  BotSession['state'],
  'ready' | 'attention' | 'planned'
> = {
  idle: 'planned',
  starting: 'attention',
  running: 'ready',
  paused: 'attention',
  stopping: 'attention',
  stopped: 'planned',
  reconnecting: 'attention',
  risk_limit_reached: 'attention',
  completed: 'ready',
  error: 'attention'
}

function optionLabel(value: string): string {
  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function percent(value: number | null): string {
  return value === null ? 'Awaiting data' : `${(value * 100).toFixed(1)}%`
}

function money(value: string, currency: string): string {
  return `${value} ${currency}`
}

function optionalValue(value: FormDataEntryValue | null): string | null {
  const text = typeof value === 'string' ? value.trim() : ''
  return text.length === 0 ? null : text
}

export function BotConsolePage() {
  const { isDark, setIsDark } = useAppearance()
  const { state, actionMessage, isWorking, start, save, act, evaluate } =
    useBotConsole()
  const formRef = useRef<HTMLFormElement>(null)
  const [botType, setBotType] = useState<BotType>('rise_fall')
  const [outcome, setOutcome] =
    useState<Exclude<BotOutcome, 'no_signal'>>('rise')
  const [martingaleEnabled, setMartingaleEnabled] = useState(false)

  const selectedAccount =
    state.status === 'success'
      ? (state.data.accountSession.accounts.find(
          (account) => account.accountId === state.data.selectedAccountId
        ) ?? null)
      : null
  const selectedBot = botOptions.find((option) => option.value === botType)
  const selectedOutcomes =
    botType === 'smart_auto' ? [] : outcomesByBot[botType]
  const needsBarrier =
    botType === 'over_under' ||
    botType === 'matches_differs' ||
    botType === 'smart_auto'

  const configFromForm = (): BotConfiguration | null => {
    const form = formRef.current
    if (form === null || !form.reportValidity()) return null
    const values = new FormData(form)
    const number = (name: string): number => Number(values.get(name))
    const text = (name: string): string => String(values.get(name)).trim()
    return {
      botType,
      market: text('market').toUpperCase(),
      outcome: botType === 'smart_auto' ? null : outcome,
      barrier: needsBarrier ? number('barrier') : null,
      stake: text('stake'),
      duration: number('duration'),
      durationUnit: 't',
      movementWindow: number('movementWindow'),
      digitWindow: number('digitWindow'),
      confidenceThreshold: number('confidenceThreshold'),
      minimumSignalStrength: number('minimumSignalStrength'),
      entryDelaySeconds: number('entryDelaySeconds'),
      martingale: {
        enabled: martingaleEnabled,
        multiplier: text('multiplier'),
        maxSteps: number('maxSteps'),
        maxStake: optionalValue(values.get('maxStake')),
        resetAfterWin: values.get('resetAfterWin') === 'on',
        resetAtSessionEnd: values.get('resetAtSessionEnd') === 'on'
      },
      limits: {
        stopLoss: optionalValue(values.get('stopLoss')),
        takeProfit: optionalValue(values.get('takeProfit')),
        maximumTrades: optionalNumber(values.get('maximumTrades')),
        maximumConsecutiveLosses: optionalNumber(
          values.get('maximumConsecutiveLosses')
        ),
        maximumSingleStake: optionalValue(values.get('maximumSingleStake')),
        maximumCumulativeStake: optionalValue(
          values.get('maximumCumulativeStake')
        )
      }
    }
  }

  const startFromForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const configuration = configFromForm()
    if (configuration !== null) void start(configuration)
  }

  const saveFromForm = () => {
    const configuration = configFromForm()
    if (configuration === null) return
    const savedName = formRef.current
      ? String(new FormData(formRef.current).get('configurationName')).trim()
      : ''
    const name =
      savedName.length > 0
        ? savedName
        : `${optionLabel(configuration.botType)} ${configuration.market}`
    void save(name, configuration)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Deriv Auto Trader
          </Link>
          <div className="flex items-center gap-3">
            {selectedAccount === null ? null : (
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">
                  {selectedAccount.displayName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedAccount.kind} ·{' '}
                  {selectedAccount.connectionState.replaceAll('_', ' ')}
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsDark((current) => !current)}
              className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"
              aria-label={
                isDark ? 'Use light appearance' : 'Use dark appearance'
              }
            >
              {isDark ? (
                <Sun className="size-4" aria-hidden="true" />
              ) : (
                <Moon className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8 dark:bg-white dark:text-slate-950">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-sky-300 dark:text-sky-700">
                <Bot className="size-4" aria-hidden="true" />
                Phase Four single-bot sessions
              </p>
              <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Configure observed signals. Keep execution limits visible.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 dark:text-slate-600">
                Historical tick observations do not predict independent
                outcomes. A live session evaluates only fresh ticks, never sells
                an open contract when paused or stopped, and records its risk
                transitions.
              </p>
            </div>
            <Link
              to="/analysis"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-white dark:border-slate-300 dark:text-slate-950"
            >
              <Activity className="size-4" aria-hidden="true" />
              Open analysis
            </Link>
          </div>
        </section>

        {state.status === 'loading' ? (
          <StateCard
            icon={
              <LoaderCircle
                className="size-7 animate-spin"
                aria-hidden="true"
              />
            }
            title="Checking bot access"
            message="Loading the selected account, saved configurations, and bot sessions."
          />
        ) : null}

        {state.status === 'empty' ? (
          <StateCard
            icon={<WalletCards className="size-7" aria-hidden="true" />}
            title="An authorized account is required"
            message={state.message}
            action={
              <Link
                to="/accounts"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
              >
                <WalletCards className="size-4" aria-hidden="true" />
                Open accounts
              </Link>
            }
          />
        ) : null}

        {state.status === 'error' ? (
          <section className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-900 dark:bg-rose-950">
            <CircleAlert
              className="mx-auto size-7 text-rose-700 dark:text-rose-300"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-lg font-semibold text-rose-950 dark:text-rose-100">
              Bot console is unavailable
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-rose-800 dark:text-rose-200">
              {state.message}
            </p>
          </section>
        ) : null}

        {state.status === 'success' ? (
          <>
            {actionMessage === null ? null : (
              <p
                className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
                role="alert"
              >
                {actionMessage}
              </p>
            )}

            <section className="mt-8 grid gap-4 md:grid-cols-3">
              <MetricCard
                label="Bound account"
                value={selectedAccount?.displayName ?? 'Unavailable'}
                detail={
                  selectedAccount === null
                    ? 'Select an account before starting.'
                    : `${selectedAccount.kind} · ${selectedAccount.currency}`
                }
              />
              <MetricCard
                label="Active bot sessions"
                value={String(
                  state.data.sessions.filter(
                    (session) =>
                      session.state === 'running' || session.state === 'paused'
                  ).length
                )}
                detail="Each bot keeps its own signal, limits, and martingale sequence."
              />
              <MetricCard
                label="Saved configurations"
                value={String(state.data.configurations.length)}
                detail="Configurations are scoped to this authorized account."
              />
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-5">
              <form
                ref={formRef}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3 dark:border-slate-800 dark:bg-slate-900"
                onSubmit={startFromForm}
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">
                      Bot builder
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                      Single-session configuration
                    </h2>
                  </div>
                  <StatusPill tone="attention">Live execution</StatusPill>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Starting a session subscribes to its market and may enter on a
                  later eligible live tick. Review the session limits below
                  first.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium">
                    Bot type
                    <select
                      value={botType}
                      onChange={(event) => {
                        const next = event.target.value as BotType
                        setBotType(next)
                        if (next !== 'smart_auto')
                          setOutcome(outcomesByBot[next][0])
                      }}
                      className={inputClassName}
                    >
                      {botOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-medium">
                    Market
                    <input
                      name="market"
                      defaultValue="R_100"
                      pattern="\w{2,30}"
                      required
                      className={inputClassName}
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Reusable name
                    <input
                      name="configurationName"
                      placeholder="Optional saved name"
                      className={inputClassName}
                    />
                  </label>
                  {botType === 'smart_auto' ? (
                    <div className="rounded-2xl bg-sky-50 p-4 text-sm leading-6 text-sky-950 dark:bg-sky-950 dark:text-sky-100">
                      <p className="font-semibold">Smart selection</p>
                      <p className="mt-1">
                        Rise, Fall, Over, Under, Matches, and Differs compete by
                        normalized observed deviation. Even/Odd is excluded.
                      </p>
                    </div>
                  ) : (
                    <label className="text-sm font-medium">
                      Contract outcome
                      <select
                        value={outcome}
                        onChange={(event) =>
                          setOutcome(
                            event.target.value as Exclude<
                              BotOutcome,
                              'no_signal'
                            >
                          )
                        }
                        className={inputClassName}
                      >
                        {selectedOutcomes.map((value) => (
                          <option key={value} value={value}>
                            {optionLabel(value)}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  {needsBarrier ? (
                    <label className="text-sm font-medium">
                      Digit barrier
                      <select
                        name="barrier"
                        defaultValue="5"
                        className={inputClassName}
                      >
                        {Array.from({ length: 10 }, (_, digit) => (
                          <option key={digit} value={digit}>
                            {digit}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <div className="rounded-2xl bg-slate-100 p-4 text-sm leading-6 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <p className="font-semibold text-slate-950 dark:text-white">
                        No barrier needed
                      </p>
                      <p className="mt-1">
                        This contract type uses movement or parity rather than a
                        digit barrier.
                      </p>
                    </div>
                  )}
                  <label className="text-sm font-medium">
                    Base stake
                    <input
                      name="stake"
                      type="number"
                      min="0.35"
                      step="0.01"
                      defaultValue="1.00"
                      required
                      className={inputClassName}
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Duration in ticks
                    <input
                      name="duration"
                      type="number"
                      min="1"
                      max="1000"
                      defaultValue="1"
                      required
                      className={inputClassName}
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Movement window
                    <select
                      name="movementWindow"
                      defaultValue="30"
                      className={inputClassName}
                    >
                      <option value="20">20 ticks</option>
                      <option value="30">30 ticks</option>
                      <option value="40">40 ticks</option>
                      <option value="50">50 ticks</option>
                    </select>
                  </label>
                  <label className="text-sm font-medium">
                    Digit window
                    <select
                      name="digitWindow"
                      defaultValue="200"
                      className={inputClassName}
                    >
                      <option value="100">100 ticks</option>
                      <option value="200">200 ticks</option>
                      <option value="300">300 ticks</option>
                      <option value="500">500 ticks</option>
                    </select>
                  </label>
                  <label className="text-sm font-medium">
                    Confidence threshold
                    <input
                      name="confidenceThreshold"
                      type="number"
                      min="0.5"
                      max="1"
                      step="0.01"
                      defaultValue="0.60"
                      required
                      className={inputClassName}
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Minimum Smart strength
                    <input
                      name="minimumSignalStrength"
                      type="number"
                      min="0"
                      max="20"
                      step="0.1"
                      defaultValue="1"
                      required
                      className={inputClassName}
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Entry delay (seconds)
                    <input
                      name="entryDelaySeconds"
                      type="number"
                      min="1"
                      max="3600"
                      defaultValue="5"
                      required
                      className={inputClassName}
                    />
                  </label>
                  <div className="rounded-2xl bg-slate-100 p-4 text-sm leading-6 text-slate-600 sm:col-span-2 dark:bg-slate-800 dark:text-slate-300">
                    <p className="font-semibold text-slate-950 dark:text-white">
                      {selectedBot?.label}
                    </p>
                    <p className="mt-1">{selectedBot?.detail}</p>
                  </div>
                </div>

                <fieldset className="mt-6 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                  <legend className="px-2 text-sm font-semibold">
                    Martingale guardrail
                  </legend>
                  <label className="flex items-center gap-3 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={martingaleEnabled}
                      onChange={(event) =>
                        setMartingaleEnabled(event.target.checked)
                      }
                      className="size-4 rounded border-slate-300"
                    />
                    Enable after a settled loss only
                  </label>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    One sequence belongs to this session. It advances only after
                    a loss and stops entries if a next stake cannot fit the
                    configured or account-wide guardrails.
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <label className="text-sm font-medium">
                      Multiplier
                      <input
                        name="multiplier"
                        type="number"
                        min="1.01"
                        step="0.01"
                        defaultValue="2.00"
                        disabled={!martingaleEnabled}
                        required
                        className={inputClassName}
                      />
                    </label>
                    <label className="text-sm font-medium">
                      Maximum steps
                      <input
                        name="maxSteps"
                        type="number"
                        min="1"
                        max="20"
                        defaultValue="3"
                        disabled={!martingaleEnabled}
                        required
                        className={inputClassName}
                      />
                    </label>
                    <label className="text-sm font-medium">
                      Maximum stake
                      <input
                        name="maxStake"
                        type="number"
                        min="0.01"
                        step="0.01"
                        defaultValue="10.00"
                        disabled={!martingaleEnabled}
                        className={inputClassName}
                      />
                    </label>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-5 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        name="resetAfterWin"
                        type="checkbox"
                        defaultChecked
                        disabled={!martingaleEnabled}
                        className="size-4 rounded border-slate-300"
                      />
                      Reset after win
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        name="resetAtSessionEnd"
                        type="checkbox"
                        defaultChecked
                        disabled={!martingaleEnabled}
                        className="size-4 rounded border-slate-300"
                      />
                      Reset at session end
                    </label>
                  </div>
                </fieldset>

                <fieldset className="mt-6 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                  <legend className="px-2 text-sm font-semibold">
                    Session limits
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <LimitInput
                      name="stopLoss"
                      label="Stop loss"
                      placeholder="Optional"
                    />
                    <LimitInput
                      name="takeProfit"
                      label="Take profit"
                      placeholder="Optional"
                    />
                    <LimitInput
                      name="maximumTrades"
                      label="Maximum trades"
                      placeholder="Optional"
                      integer
                    />
                    <LimitInput
                      name="maximumConsecutiveLosses"
                      label="Consecutive losses"
                      placeholder="Optional"
                      integer
                    />
                    <LimitInput
                      name="maximumSingleStake"
                      label="Single stake cap"
                      placeholder="Optional"
                    />
                    <LimitInput
                      name="maximumCumulativeStake"
                      label="Cumulative stake cap"
                      placeholder="Optional"
                    />
                  </div>
                </fieldset>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={isWorking}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950"
                  >
                    <Play className="size-4" aria-hidden="true" />
                    Start live session
                  </button>
                  <button
                    type="button"
                    onClick={saveFromForm}
                    disabled={isWorking}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
                  >
                    <Save className="size-4" aria-hidden="true" />
                    Save configuration
                  </button>
                </div>
              </form>

              <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Execution principles
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  Safe session behavior
                </h2>
                <ul className="mt-6 space-y-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  <li className="flex gap-3">
                    <ShieldAlert
                      className="mt-1 size-4 shrink-0 text-amber-600 dark:text-amber-300"
                      aria-hidden="true"
                    />
                    <span>
                      Pause and Stop block new entries. Neither action sells or
                      closes an open Deriv contract.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <ClipboardCheck
                      className="mt-1 size-4 shrink-0 text-sky-600 dark:text-sky-300"
                      aria-hidden="true"
                    />
                    <span>
                      Smart Auto Trader logs only meaningful transitions into or
                      out of No Signal.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <TrendingUp
                      className="mt-1 size-4 shrink-0 text-emerald-600 dark:text-emerald-300"
                      aria-hidden="true"
                    />
                    <span>
                      Confidence, frequency, and deviation describe the observed
                      window, not the next independent tick.
                    </span>
                  </li>
                </ul>
                <div className="mt-7 rounded-2xl bg-rose-50 p-4 text-sm leading-6 text-rose-900 dark:bg-rose-950 dark:text-rose-100">
                  <p className="font-semibold">Risk disclaimer</p>
                  <p className="mt-1">
                    Automation and martingale can increase losses. No profit is
                    guaranteed; settings remain your responsibility.
                  </p>
                </div>
              </aside>
            </section>

            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Running and recent sessions
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    Signals, trade state, and results
                  </h2>
                </div>
                <StatusPill tone="planned">Tick-driven evaluation</StatusPill>
              </div>
              {state.data.sessions.length === 0 ? (
                <div className="mt-6 rounded-2xl bg-slate-100 p-6 text-sm leading-6 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  No bot sessions exist for this account. Build a configuration
                  above to start monitoring eligible live ticks.
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {state.data.sessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      isWorking={isWorking}
                      onAction={act}
                      onEvaluate={evaluate}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Reusable configurations
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Saved for this account
              </h2>
              {state.data.configurations.length === 0 ? (
                <p className="mt-6 rounded-2xl bg-slate-100 p-5 text-sm leading-6 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  Save a configuration to reuse its market, signal settings,
                  limits, and martingale guardrails later.
                </p>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {state.data.configurations.map((configuration) => (
                    <article
                      key={configuration.id}
                      className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold">{configuration.name}</p>
                        <StatusPill tone="planned">Saved</StatusPill>
                      </div>
                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                        {optionLabel(configuration.configuration.botType)} ·{' '}
                        {configuration.configuration.market}
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {configuration.configuration.outcome === null
                          ? 'Smart selection'
                          : optionLabel(
                              configuration.configuration.outcome
                            )}{' '}
                        · {configuration.configuration.stake} stake
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </main>
    </div>
  )
}

function optionalNumber(value: FormDataEntryValue | null): number | null {
  const text = typeof value === 'string' ? value.trim() : ''
  return text.length === 0 ? null : Number(text)
}

function LimitInput({
  name,
  label,
  placeholder,
  integer = false
}: Readonly<{
  name: string
  label: string
  placeholder: string
  integer?: boolean
}>) {
  return (
    <label className="text-sm font-medium">
      {label}
      <input
        name={name}
        type="number"
        min={integer ? '1' : '0.01'}
        step={integer ? '1' : '0.01'}
        placeholder={placeholder}
        className={inputClassName}
      />
    </label>
  )
}

function MetricCard({
  label,
  value,
  detail
}: Readonly<{ label: string; value: string; detail: string }>) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {detail}
      </p>
    </article>
  )
}

function StateCard({
  icon,
  title,
  message,
  action
}: Readonly<{
  icon: ReactNode
  title: string
  message: string
  action?: ReactNode
}>) {
  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        {icon}
      </span>
      <h2 className="mt-5 text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-300">
        {message}
      </p>
      {action}
    </section>
  )
}

function SessionCard({
  session,
  isWorking,
  onAction,
  onEvaluate
}: Readonly<{
  session: BotSession
  isWorking: boolean
  onAction: (
    sessionId: string,
    action: 'pause' | 'resume' | 'stop'
  ) => Promise<void>
  onEvaluate: (sessionId: string) => Promise<void>
}>) {
  const canPause = session.state === 'running'
  const canResume = session.state === 'paused'
  const canStop =
    canPause || canResume || session.state === 'risk_limit_reached'
  return (
    <article className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">
              {optionLabel(session.configuration.botType)} ·{' '}
              {session.configuration.market}
            </h3>
            <StatusPill tone={sessionTone[session.state]}>
              {optionLabel(session.state)}
            </StatusPill>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Signal:{' '}
            <span className="font-semibold">
              {optionLabel(session.currentSignal.outcome)}
            </span>{' '}
            · {session.currentSignal.reason}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canPause ? (
            <button
              type="button"
              disabled={isWorking}
              onClick={() => void onAction(session.id, 'pause')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
            >
              <Pause className="size-4" aria-hidden="true" />
              Pause
            </button>
          ) : null}
          {canResume ? (
            <button
              type="button"
              disabled={isWorking}
              onClick={() => void onAction(session.id, 'resume')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
            >
              <Play className="size-4" aria-hidden="true" />
              Resume
            </button>
          ) : null}
          {canPause ? (
            <button
              type="button"
              disabled={isWorking}
              onClick={() => void onEvaluate(session.id)}
              className="inline-flex items-center gap-2 rounded-lg border border-sky-200 px-3 py-2 text-sm font-semibold text-sky-800 disabled:opacity-50 dark:border-sky-800 dark:text-sky-200"
            >
              <Activity className="size-4" aria-hidden="true" />
              Evaluate now
            </button>
          ) : null}
          {canStop ? (
            <button
              type="button"
              disabled={isWorking}
              onClick={() => void onAction(session.id, 'stop')}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
            >
              <Square className="size-4" aria-hidden="true" />
              Stop
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SessionMetric
          label="Observed confidence"
          value={percent(session.currentSignal.observedConfidence)}
        />
        <SessionMetric
          label="Smart strength"
          value={
            session.currentSignal.signalStrength === null
              ? '—'
              : session.currentSignal.signalStrength.toFixed(2)
          }
        />
        <SessionMetric
          label="Next stake"
          value={money(session.martingale.nextStake, session.currency)}
        />
        <SessionMetric
          label="Martingale"
          value={`Step ${session.martingale.step} · ${optionLabel(session.martingale.lastTransition)}`}
        />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SessionMetric
          label="Accepted / open"
          value={`${session.statistics.acceptedTrades} / ${session.statistics.openTrades}`}
        />
        <SessionMetric
          label="Won / lost"
          value={`${session.statistics.wonTrades} / ${session.statistics.lostTrades}`}
        />
        <SessionMetric
          label="Total stake"
          value={money(session.statistics.totalStake, session.currency)}
        />
        <SessionMetric
          label="Session P/L"
          value={money(session.statistics.totalProfitLoss, session.currency)}
        />
      </div>
      {session.trades.length === 0 ? (
        <p className="mt-5 rounded-xl bg-slate-100 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          No accepted trades in this session yet.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-max text-left text-sm">
            <thead className="text-xs tracking-wide text-slate-500 uppercase dark:text-slate-400">
              <tr>
                <th className="pb-3 font-semibold">Contract</th>
                <th className="pb-3 font-semibold">Outcome</th>
                <th className="pb-3 font-semibold">Stake</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">P/L</th>
              </tr>
            </thead>
            <tbody>
              {session.trades.slice(0, 5).map((trade) => (
                <tr
                  key={trade.id}
                  className="border-t border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3 font-medium">{trade.derivContractId}</td>
                  <td className="py-3 capitalize">{trade.outcome}</td>
                  <td className="py-3">
                    {money(trade.stake, session.currency)}
                  </td>
                  <td className="py-3 capitalize">
                    {trade.status.replaceAll('_', ' ')}
                  </td>
                  <td className="py-3">
                    {trade.profitLoss === null
                      ? 'Awaiting settlement'
                      : money(trade.profitLoss, session.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  )
}

function SessionMetric({
  label,
  value
}: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  )
}
