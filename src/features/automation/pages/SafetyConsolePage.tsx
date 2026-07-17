import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Moon,
  Pause,
  Play,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Square,
  Sun,
  WalletCards
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusPill } from '../../../shared/components/StatusPill'
import { useAppearance } from '../../../shared/hooks/useAppearance'
import { useSafetyConsole } from '../hooks/useSafetyConsole'
import type {
  AutomationSession,
  AutomationSessionState,
  ContractPreviewInput
} from '../types/automation.types'

type TradeForm = Omit<ContractPreviewInput, 'barrier'>
const initialTradeForm: TradeForm = {
  botType: 'Rise / Fall guard',
  market: 'R_100',
  contractType: 'CALL',
  stake: '1.00',
  duration: 1,
  durationUnit: 't'
}

const inputClassName =
  'mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-white'

const sessionTone: Record<
  AutomationSessionState,
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

function formatMoney(value: string, currency: string): string {
  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    return `${value} ${currency}`
  }

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(amount)
}

function formatDate(value: string | null): string {
  if (value === null) {
    return 'Not started'
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

function displayEvent(value: string): string {
  return value.replaceAll('_', ' ')
}

export function SafetyConsolePage() {
  const { isDark, setIsDark } = useAppearance()
  const {
    state,
    preview,
    actionMessage,
    isWorking,
    load,
    requestPreview,
    startPreview,
    actOnSession,
    saveAccountRisk,
    emergencyStop,
    resetEmergencyStop
  } = useSafetyConsole()
  const [tradeForm, setTradeForm] = useState<TradeForm>(initialTradeForm)

  const selectedAccount =
    state.status === 'success'
      ? (state.data.accountSession.accounts.find(
          (account) => account.accountId === state.data.selectedAccountId
        ) ?? null)
      : null

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
                  Safety console
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsDark((appearance) => !appearance)}
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
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-300 dark:text-emerald-700">
                <ShieldCheck className="size-4" aria-hidden="true" />
                Phase Two safety layer
              </p>
              <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Validate first. Control clearly. Execute nothing yet.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 dark:text-slate-600">
                A current Deriv proposal and account limits are required before
                a session can begin. This phase does not submit a contract
                purchase.
              </p>
            </div>
            <Link
              to="/accounts"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-white dark:border-slate-300 dark:text-slate-950"
            >
              <WalletCards className="size-4" aria-hidden="true" />
              Change account
            </Link>
          </div>
        </section>

        {state.status === 'loading' ? (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <RefreshCw
              className="mx-auto size-6 animate-spin text-slate-500 dark:text-slate-400"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-lg font-semibold">
              Checking session controls
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Loading account-scoped limits, contract state, and activity.
            </p>
          </section>
        ) : null}

        {state.status === 'empty' ? (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <WalletCards
              className="mx-auto size-8 text-slate-500 dark:text-slate-400"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-xl font-semibold">
              An account selection is required
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-300">
              {state.message}
            </p>
            <Link
              to="/accounts"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
            >
              Open accounts
              <ArrowLeft className="size-4 rotate-180" aria-hidden="true" />
            </Link>
          </section>
        ) : null}

        {state.status === 'error' ? (
          <section className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-900 dark:bg-rose-950">
            <CircleAlert
              className="mx-auto size-7 text-rose-700 dark:text-rose-300"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-lg font-semibold text-rose-950 dark:text-rose-100">
              Safety data is unavailable
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-rose-800 dark:text-rose-200">
              {state.message}
            </p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white dark:bg-rose-300 dark:text-rose-950"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Try again
            </button>
          </section>
        ) : null}

        {state.status === 'success' && selectedAccount !== null ? (
          <>
            {actionMessage === null ? null : (
              <p
                className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
                role="alert"
              >
                {actionMessage}
              </p>
            )}

            <section
              className="mt-8 grid gap-4 md:grid-cols-3"
              aria-label="Account safety status"
            >
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Account cycle
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-tight">
                  {state.data.snapshot.cycle.isActive ? 'Active' : 'Idle'}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Running P/L{' '}
                  {formatMoney(
                    state.data.snapshot.cycle.runningProfitLoss,
                    selectedAccount.currency
                  )}
                </p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Active contracts
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-tight">
                  {state.data.snapshot.contracts.length} /{' '}
                  {
                    state.data.snapshot.risk.account.limits
                      .maximumActiveContracts
                  }
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Synchronized from the selected account connection.
                </p>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Account connection
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-tight">
                  {selectedAccount.connectionState.replaceAll('_', ' ')}
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  A live connection is required for a fresh contract preview.
                </p>
              </article>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-5">
              <form
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3 dark:border-slate-800 dark:bg-slate-900"
                onSubmit={(event) => {
                  event.preventDefault()
                  void requestPreview({ ...tradeForm, barrier: null })
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                      Proposal gate
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                      Create a guarded preview
                    </h2>
                  </div>
                  <Bot
                    className="size-6 text-slate-500 dark:text-slate-400"
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  The preview checks current account limits first and expires
                  after 30 seconds. It is not a buy order.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium">
                    Session label
                    <input
                      value={tradeForm.botType}
                      onChange={(event) =>
                        setTradeForm((current) => ({
                          ...current,
                          botType: event.target.value
                        }))
                      }
                      className={inputClassName}
                      maxLength={64}
                      required
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Deriv symbol
                    <input
                      value={tradeForm.market}
                      onChange={(event) =>
                        setTradeForm((current) => ({
                          ...current,
                          market: event.target.value.toUpperCase()
                        }))
                      }
                      className={inputClassName}
                      pattern="\\w{2,30}"
                      required
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Contract direction
                    <select
                      value={tradeForm.contractType}
                      onChange={(event) =>
                        setTradeForm((current) => ({
                          ...current,
                          contractType: event.target.value as 'CALL' | 'PUT'
                        }))
                      }
                      className={inputClassName}
                    >
                      <option value="CALL">Rise</option>
                      <option value="PUT">Fall</option>
                    </select>
                  </label>
                  <label className="text-sm font-medium">
                    Stake ({selectedAccount.currency})
                    <input
                      value={tradeForm.stake}
                      onChange={(event) =>
                        setTradeForm((current) => ({
                          ...current,
                          stake: event.target.value
                        }))
                      }
                      className={inputClassName}
                      inputMode="decimal"
                      pattern="[0-9]+(?:\\.[0-9]{1,8})?"
                      required
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Duration
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={tradeForm.duration}
                      onChange={(event) =>
                        setTradeForm((current) => ({
                          ...current,
                          duration: Number(event.target.value)
                        }))
                      }
                      className={inputClassName}
                      required
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Duration unit
                    <select
                      value={tradeForm.durationUnit}
                      onChange={(event) =>
                        setTradeForm((current) => ({
                          ...current,
                          durationUnit: event.target
                            .value as TradeForm['durationUnit']
                        }))
                      }
                      className={inputClassName}
                    >
                      <option value="t">Ticks</option>
                      <option value="s">Seconds</option>
                      <option value="m">Minutes</option>
                      <option value="h">Hours</option>
                      <option value="d">Days</option>
                    </select>
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={
                    isWorking ||
                    state.data.snapshot.risk.account.emergencyStopActive
                  }
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950"
                >
                  <ShieldCheck className="size-4" aria-hidden="true" />
                  {isWorking ? 'Checking guardrails...' : 'Get guarded preview'}
                </button>
              </form>

              <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Preview status
                    </p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight">
                      {preview === null
                        ? 'Awaiting validation'
                        : 'Ready to start'}
                    </h2>
                  </div>
                  {preview === null ? (
                    <Clock3
                      className="size-5 text-slate-500 dark:text-slate-400"
                      aria-hidden="true"
                    />
                  ) : (
                    <CheckCircle2
                      className="size-5 text-emerald-600 dark:text-emerald-400"
                      aria-hidden="true"
                    />
                  )}
                </div>
                {preview === null ? (
                  <p className="mt-6 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    A connected account and current Deriv proposal are required
                    before this control becomes available.
                  </p>
                ) : (
                  <>
                    <dl className="mt-6 space-y-4 text-sm">
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-slate-500 dark:text-slate-400">
                          Ask price
                        </dt>
                        <dd className="font-semibold">
                          {formatMoney(preview.askPrice, preview.currency)}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-slate-500 dark:text-slate-400">
                          Potential payout
                        </dt>
                        <dd className="font-semibold">
                          {formatMoney(
                            preview.potentialPayout,
                            preview.currency
                          )}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-slate-500 dark:text-slate-400">
                          Expires
                        </dt>
                        <dd className="font-semibold">30 seconds</dd>
                      </div>
                    </dl>
                    <p className="mt-5 rounded-2xl bg-amber-50 p-3 text-sm leading-5 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                      Starting creates a protected session only. Contract
                      submission is intentionally unavailable in this phase.
                    </p>
                    <button
                      type="button"
                      onClick={() => void startPreview()}
                      disabled={isWorking}
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-400 dark:text-slate-950"
                    >
                      <Play className="size-4" aria-hidden="true" />
                      Start guarded session
                    </button>
                  </>
                )}
              </aside>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Automation sessions
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                      Account-bound controls
                    </h2>
                  </div>
                  <Activity
                    className="size-6 text-slate-500 dark:text-slate-400"
                    aria-hidden="true"
                  />
                </div>
                {state.data.snapshot.sessions.length === 0 ? (
                  <div className="mt-6 rounded-2xl bg-slate-100 p-5 text-sm leading-6 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    No automation session has passed the preview gate yet.
                  </div>
                ) : (
                  <div className="mt-6 space-y-3">
                    {state.data.snapshot.sessions.map((session) => (
                      <SessionRow
                        key={session.id}
                        session={session}
                        isWorking={isWorking}
                        onAction={actOnSession}
                      />
                    ))}
                  </div>
                )}
              </div>

              <form
                key={state.data.snapshot.risk.account.updatedAt}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900"
                onSubmit={(event) => {
                  event.preventDefault()
                  const formData = new FormData(event.currentTarget)
                  void saveAccountRisk({
                    maximumActiveContracts: Number(
                      formData.get('maximumActiveContracts')
                    ),
                    maximumSingleTradeStake: String(
                      formData.get('maximumSingleTradeStake')
                    ),
                    maximumCombinedRunningLoss: String(
                      formData.get('maximumCombinedRunningLoss')
                    )
                  })
                }}
              >
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Account limits
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  Centralized guardrails
                </h2>
                <div className="mt-5 space-y-4">
                  <label className="block text-sm font-medium">
                    Maximum active contracts
                    <input
                      type="number"
                      min="1"
                      max="50"
                      name="maximumActiveContracts"
                      defaultValue={
                        state.data.snapshot.risk.account.limits
                          .maximumActiveContracts
                      }
                      className={inputClassName}
                      required
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    Maximum single stake
                    <input
                      name="maximumSingleTradeStake"
                      defaultValue={
                        state.data.snapshot.risk.account.limits
                          .maximumSingleTradeStake
                      }
                      className={inputClassName}
                      inputMode="decimal"
                      required
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    Maximum combined running loss
                    <input
                      name="maximumCombinedRunningLoss"
                      defaultValue={
                        state.data.snapshot.risk.account.limits
                          .maximumCombinedRunningLoss
                      }
                      className={inputClassName}
                      inputMode="decimal"
                      required
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={isWorking}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
                >
                  <ShieldCheck className="size-4" aria-hidden="true" />
                  Save account limits
                </button>
              </form>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-5">
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 lg:col-span-2 dark:border-rose-900 dark:bg-rose-950">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300">
                    <ShieldAlert className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="font-semibold text-rose-950 dark:text-rose-100">
                      Emergency Stop
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-rose-800 dark:text-rose-200">
                      Stops all automation sessions for this account
                      immediately. Existing contracts are not sold or closed.
                    </p>
                  </div>
                </div>
                {state.data.snapshot.risk.account.emergencyStopActive ? (
                  <button
                    type="button"
                    onClick={() => void resetEmergencyStop()}
                    disabled={isWorking}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-rose-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-950 dark:text-rose-200"
                  >
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                    Clear Emergency Stop
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void emergencyStop()}
                    disabled={isWorking}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-rose-700 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-rose-300 dark:text-rose-950"
                  >
                    <AlertTriangle className="size-4" aria-hidden="true" />
                    Emergency stop this account
                  </button>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Open contract state
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                      Status and availability
                    </h2>
                  </div>
                  <StatusPill tone="planned">No actions submitted</StatusPill>
                </div>
                {state.data.snapshot.contracts.length === 0 ? (
                  <p className="mt-6 rounded-2xl bg-slate-100 p-5 text-sm leading-6 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    There are no reconciled open contracts for this account.
                  </p>
                ) : (
                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full min-w-max text-left text-sm">
                      <thead className="text-xs tracking-wide text-slate-500 uppercase dark:text-slate-400">
                        <tr>
                          <th className="pb-3 font-semibold">Contract</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold">P/L</th>
                          <th className="pb-3 font-semibold">Availability</th>
                        </tr>
                      </thead>
                      <tbody>
                        {state.data.snapshot.contracts.map((contract) => (
                          <tr
                            key={contract.contractId}
                            className="border-t border-slate-100 dark:border-slate-800"
                          >
                            <td className="py-3 font-medium">
                              {contract.contractId}
                            </td>
                            <td className="py-3 capitalize">
                              {contract.platformStatus.replaceAll('_', ' ')}
                            </td>
                            <td className="py-3">
                              {contract.profitLoss === null
                                ? 'Awaiting update'
                                : formatMoney(
                                    contract.profitLoss,
                                    selectedAccount.currency
                                  )}
                            </td>
                            <td className="py-3 text-slate-600 dark:text-slate-300">
                              {contract.canSell
                                ? 'Sell eligibility tracked'
                                : contract.canCancel
                                  ? 'Cancel eligibility tracked'
                                  : contract.actionReason}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Activity log
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    Meaningful account events
                  </h2>
                </div>
                <Activity
                  className="size-6 text-slate-500 dark:text-slate-400"
                  aria-hidden="true"
                />
              </div>
              {state.data.snapshot.activity.length === 0 ? (
                <p className="mt-6 rounded-2xl bg-slate-100 p-5 text-sm leading-6 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  No safety events have been recorded for this account yet.
                </p>
              ) : (
                <ol className="mt-6 divide-y divide-slate-100 dark:divide-slate-800">
                  {state.data.snapshot.activity.map((event) => (
                    <li key={event.id} className="flex gap-4 py-4 first:pt-0">
                      <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <Activity className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold capitalize">
                          {displayEvent(event.event)}
                        </p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          {event.status.replaceAll('_', ' ')}
                          {event.market === null ? '' : ` · ${event.market}`}
                        </p>
                      </div>
                      <time className="ml-auto shrink-0 text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(event.occurredAt)}
                      </time>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </>
        ) : null}
      </main>
    </div>
  )
}

type SessionRowProps = Readonly<{
  session: AutomationSession
  isWorking: boolean
  onAction: (sessionId: string, action: 'pause' | 'resume' | 'stop') => void
}>

function SessionRow({ session, isWorking, onAction }: SessionRowProps) {
  const canPause = session.state === 'running'
  const canResume = session.state === 'paused'
  const canStop = session.state === 'running' || session.state === 'paused'

  return (
    <article className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{session.botType}</p>
            <StatusPill tone={sessionTone[session.state]}>
              {session.state.replaceAll('_', ' ')}
            </StatusPill>
          </div>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {session.market} · Started {formatDate(session.startedAt)} · Running
            P/L {session.runningProfitLoss}
          </p>
        </div>
        <div className="flex gap-2">
          {canPause ? (
            <button
              type="button"
              disabled={isWorking}
              onClick={() => onAction(session.id, 'pause')}
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
              onClick={() => onAction(session.id, 'resume')}
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
              onClick={() => onAction(session.id, 'stop')}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
            >
              <Square className="size-4" aria-hidden="true" />
              Stop
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}
