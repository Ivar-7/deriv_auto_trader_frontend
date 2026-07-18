import {
  ArrowLeft,
  Bot,
  CircleAlert,
  LoaderCircle,
  Moon,
  Pause,
  Play,
  Save,
  Square,
  Sun,
  WalletCards
} from 'lucide-react'
import { type FormEvent, type ReactNode, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusPill } from '../../../shared/components/StatusPill'
import { useAppearance } from '../../../shared/hooks/useAppearance'
import { useBulkConsole } from '../hooks/useBulkConsole'
import type {
  BulkOutcome,
  BulkRun,
  BulkRunConfiguration
} from '../types/bulk.types'

const inputClassName =
  'mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-white'
const outcomeOptions: readonly BulkOutcome[] = [
  'differs',
  'matches',
  'over',
  'under',
  'rise',
  'fall'
]

function needsBarrier(outcome: BulkOutcome): boolean {
  return ['differs', 'matches', 'over', 'under'].includes(outcome)
}
function label(value: string): string {
  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}
function money(value: string, currency: string): string {
  return `${value} ${currency}`
}

export function BulkTraderPage() {
  const { isDark, setIsDark } = useAppearance()
  const { state, isWorking, actionMessage, start, act, saveProfile } =
    useBulkConsole()
  const [market, setMarket] = useState('R_100')
  const [outcome, setOutcome] = useState<BulkOutcome>('differs')
  const [barrier, setBarrier] = useState(7)
  const [stake, setStake] = useState('1.00')
  const [count, setCount] = useState(3)
  const [delay, setDelay] = useState(5)
  const [maxActive, setMaxActive] = useState(1)
  const [smartMarket, setSmartMarket] = useState('')
  const [smartEnabled, setSmartEnabled] = useState(true)
  const selectedAccount =
    state.status === 'success'
      ? (state.data.accountSession.accounts.find(
          (account) => account.accountId === state.data.selectedAccountId
        ) ?? null)
      : null
  const configuration: BulkRunConfiguration = {
    market: market.trim().toUpperCase(),
    outcome,
    barrier: needsBarrier(outcome) ? barrier : null,
    stake,
    duration: 1,
    durationUnit: 't',
    count,
    entryDelaySeconds: delay,
    maximumActiveContracts: maxActive,
    stopLoss: null,
    takeProfit: null
  }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void start(configuration)
  }
  const saveSmartProfile = () => {
    void saveProfile({
      enabled: smartEnabled,
      market:
        smartMarket.trim().length === 0
          ? null
          : smartMarket.trim().toUpperCase(),
      configuration: {
        stake,
        duration: 1,
        durationUnit: 't',
        count,
        entryDelaySeconds: delay,
        maximumActiveContracts: maxActive,
        stopLoss: null,
        takeProfit: null
      }
    })
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
              <p className="hidden text-right text-sm font-semibold sm:block">
                {selectedAccount.displayName}
                <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">
                  Bulk Trader
                </span>
              </p>
            )}
            <button
              type="button"
              onClick={() => setIsDark((value) => !value)}
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
                Phase Five shared bulk engine
              </p>
              <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Fixed-stake contracts, submitted sequentially.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 dark:text-slate-600">
                Bulk Trader starts a manual run. Auto Bulk can follow a
                confirmed scanner result or an accepted Smart Auto Trader
                signal. Martingale is never used for bulk runs.
              </p>
            </div>
            <Link
              to="/scanner"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-white dark:border-slate-300 dark:text-slate-950"
            >
              <Play className="size-4" aria-hidden="true" />
              Open Scanner
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
            title="Loading bulk runs"
            message="Checking the selected account, manual runs, and Smart Auto Bulk profiles."
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
              Bulk Trader is unavailable
            </h2>
            <p className="mt-2 text-sm text-rose-800 dark:text-rose-200">
              {state.message}
            </p>
          </section>
        ) : null}
        {state.status === 'success' ? (
          <>
            {actionMessage === null ? null : (
              <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
                {actionMessage}
              </p>
            )}
            <section className="mt-8 grid gap-6 lg:grid-cols-5">
              <form
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3 dark:border-slate-800 dark:bg-slate-900"
                onSubmit={submit}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">
                      Manual Bulk Trader
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                      Validated fixed-stake run
                    </h2>
                  </div>
                  <StatusPill tone="attention">No martingale</StatusPill>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  The allowed count is checked against the current account
                  balance, account risk limits, and configured active-contract
                  cap before entry.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Market">
                    <input
                      value={market}
                      onChange={(event) => setMarket(event.target.value)}
                      pattern="\w{2,30}"
                      required
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Contract">
                    <select
                      value={outcome}
                      onChange={(event) =>
                        setOutcome(event.target.value as BulkOutcome)
                      }
                      className={inputClassName}
                    >
                      {outcomeOptions.map((value) => (
                        <option key={value} value={value}>
                          {label(value)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  {needsBarrier(outcome) ? (
                    <Field label="Digit barrier">
                      <select
                        value={barrier}
                        onChange={(event) =>
                          setBarrier(Number(event.target.value))
                        }
                        className={inputClassName}
                      >
                        {Array.from({ length: 10 }, (_, digit) => (
                          <option key={digit} value={digit}>
                            {digit}
                          </option>
                        ))}
                      </select>
                    </Field>
                  ) : (
                    <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      This contract does not use a digit barrier.
                    </div>
                  )}
                  <Field label="Stake">
                    <input
                      type="number"
                      min="0.35"
                      step="0.01"
                      value={stake}
                      onChange={(event) => setStake(event.target.value)}
                      required
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Count">
                    <input
                      type="number"
                      min="1"
                      value={count}
                      onChange={(event) => setCount(Number(event.target.value))}
                      required
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Delay (seconds)">
                    <input
                      type="number"
                      min="1"
                      value={delay}
                      onChange={(event) => setDelay(Number(event.target.value))}
                      required
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Maximum active contracts">
                    <input
                      type="number"
                      min="1"
                      value={maxActive}
                      onChange={(event) =>
                        setMaxActive(Number(event.target.value))
                      }
                      required
                      className={inputClassName}
                    />
                  </Field>
                </div>
                <button
                  type="submit"
                  disabled={isWorking}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950"
                >
                  <Play className="size-4" aria-hidden="true" />
                  Start sequential bulk run
                </button>
              </form>
              <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Smart Auto Bulk
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  Follow accepted Smart signals
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Save an enabled profile to automatically begin a fixed-stake
                  run whenever an eligible Smart Auto Trader signal is accepted.
                  Optionally scope it to one market.
                </p>
                <label className="mt-5 block text-sm font-medium">
                  Market filter
                  <input
                    value={smartMarket}
                    onChange={(event) => setSmartMarket(event.target.value)}
                    placeholder="Any Smart market"
                    className={inputClassName}
                  />
                </label>
                <label className="mt-4 flex items-center gap-3 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={smartEnabled}
                    onChange={(event) => setSmartEnabled(event.target.checked)}
                    className="size-4 rounded border-slate-300"
                  />
                  Enable this Smart profile
                </label>
                <button
                  type="button"
                  disabled={isWorking}
                  onClick={saveSmartProfile}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
                >
                  <Save className="size-4" aria-hidden="true" />
                  Save Smart Auto Bulk profile
                </button>
              </aside>
            </section>
            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Bulk-run ledger
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  Requested through settlement
                </h2>
              </div>
              {state.data.runs.length === 0 ? (
                <p className="mt-6 rounded-2xl bg-slate-100 p-5 text-sm leading-6 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  No bulk runs have started for this account. Manual and Auto
                  Bulk entries will appear here with their full state breakdown.
                </p>
              ) : (
                <div className="mt-6 space-y-4">
                  {state.data.runs.map((run) => (
                    <RunCard
                      key={run.id}
                      run={run}
                      isWorking={isWorking}
                      onAction={act}
                    />
                  ))}
                </div>
              )}
            </section>
            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Saved Smart profiles
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Account-scoped auto starts
              </h2>
              {state.data.profiles.length === 0 ? (
                <p className="mt-6 rounded-2xl bg-slate-100 p-5 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  No Smart Auto Bulk profiles have been saved.
                </p>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {state.data.profiles.map((profile) => (
                    <article
                      key={profile.id}
                      className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold">
                          {profile.market ?? 'Any Smart market'}
                        </p>
                        <StatusPill
                          tone={profile.enabled ? 'ready' : 'planned'}
                        >
                          {profile.enabled ? 'Enabled' : 'Disabled'}
                        </StatusPill>
                      </div>
                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                        {profile.configuration.count} fixed-stake contracts ·{' '}
                        {profile.configuration.stake} each
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

function RunCard({
  run,
  isWorking,
  onAction
}: Readonly<{
  run: BulkRun
  isWorking: boolean
  onAction: (
    runId: string,
    action: 'pause' | 'resume' | 'stop'
  ) => Promise<void>
}>) {
  const canPause = run.state === 'running'
  const canResume = run.state === 'paused'
  const canStop = canPause || canResume || run.state === 'risk_limit_reached'
  return (
    <article className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">
              {label(run.source)} · {run.configuration.market} ·{' '}
              {label(run.configuration.outcome)}
            </h3>
            <StatusPill
              tone={
                run.state === 'running' || run.state === 'completed'
                  ? 'ready'
                  : run.state === 'stopped'
                    ? 'planned'
                    : 'attention'
              }
            >
              {label(run.state)}
            </StatusPill>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Fixed {run.configuration.stake} stake ·{' '}
            {run.configuration.entryDelaySeconds}s delay · maximum{' '}
            {run.configuration.maximumActiveContracts} active
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canPause ? (
            <button
              type="button"
              disabled={isWorking}
              onClick={() => void onAction(run.id, 'pause')}
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
              onClick={() => void onAction(run.id, 'resume')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
            >
              <Play className="size-4" aria-hidden="true" />
              Resume
            </button>
          ) : null}
          {canStop ? (
            <button
              type="button"
              disabled={isWorking}
              onClick={() => void onAction(run.id, 'stop')}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
            >
              <Square className="size-4" aria-hidden="true" />
              Stop
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Requested / submitted"
          value={`${run.statistics.requested} / ${run.statistics.submitted}`}
        />
        <Metric
          label="Accepted / rejected"
          value={`${run.statistics.accepted} / ${run.statistics.rejected}`}
        />
        <Metric
          label="Pending / open"
          value={`${run.statistics.pending} / ${run.statistics.open}`}
        />
        <Metric
          label="Won / lost"
          value={`${run.statistics.won} / ${run.statistics.lost}`}
        />
        <Metric
          label="Cancelled before submission"
          value={String(run.statistics.cancelledBeforeSubmission)}
        />
        <Metric
          label="Total stake"
          value={money(run.statistics.totalStake, run.currency)}
        />
        <Metric
          label="Total payout"
          value={money(run.statistics.totalPayout, run.currency)}
        />
        <Metric
          label="Net result"
          value={money(run.statistics.totalProfitLoss, run.currency)}
        />
      </div>
    </article>
  )
}
function Metric({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  )
}
function Field({
  label,
  children
}: Readonly<{ label: string; children: ReactNode }>) {
  return (
    <label className="text-sm font-medium">
      {label}
      {children}
    </label>
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
