import {
  ArrowLeft,
  CircleAlert,
  Copy,
  LoaderCircle,
  Moon,
  Pause,
  Play,
  ShieldCheck,
  Square,
  Sun,
  WalletCards
} from 'lucide-react'
import { type FormEvent, type ReactNode, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusPill } from '../../../shared/components/StatusPill'
import { useAppearance } from '../../../shared/hooks/useAppearance'
import { useCopyTrading } from '../hooks/useCopyTrading'
import type {
  CopyAction,
  CopyStakeMode,
  CopyTradingSession
} from '../types/copy.types'

const inputClassName =
  'mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-white'
const contractTypes = ['CALL', 'PUT', 'DIGITDIFF', 'DIGITMATCH'] as const

function sessionTone(state: CopyTradingSession['state']) {
  return state === 'running' ? 'ready' : 'attention'
}

function label(value: string): string {
  return value.replaceAll('_', ' ')
}

export function CopyTradingPage() {
  const { isDark, setIsDark } = useAppearance()
  const { state, isWorking, actionMessage, create, act, actSubAccount } =
    useCopyTrading()
  const [masterAccountId, setMasterAccountId] = useState('')
  const [selectedSubAccountIds, setSelectedSubAccountIds] = useState<
    readonly string[]
  >([])
  const [stakeMode, setStakeMode] = useState<CopyStakeMode>('fixed')
  const [fixedStake, setFixedStake] = useState('1.00')
  const [multiplier, setMultiplier] = useState('1.00')
  const [maximumStake, setMaximumStake] = useState('2.00')
  const [stopLoss, setStopLoss] = useState('5.00')
  const [allowedContractTypes, setAllowedContractTypes] = useState<
    readonly string[]
  >(['DIGITDIFF'])
  const accounts = useMemo(
    () =>
      state.status === 'success' ? state.data.accountSession.accounts : [],
    [state]
  )
  const activeMasterAccountId =
    masterAccountId || accounts.at(0)?.accountId || ''
  const availableSubAccounts = useMemo(
    () =>
      accounts.filter((account) => account.accountId !== activeMasterAccountId),
    [accounts, activeMasterAccountId]
  )
  const effectiveSubAccountIds =
    selectedSubAccountIds.length > 0
      ? selectedSubAccountIds.filter((accountId) =>
          availableSubAccounts.some(
            (account) => account.accountId === accountId
          )
        )
      : availableSubAccounts.map((account) => account.accountId)
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (
      activeMasterAccountId.length === 0 ||
      effectiveSubAccountIds.length === 0
    )
      return
    void create(
      activeMasterAccountId,
      effectiveSubAccountIds.map((accountId) => ({
        accountId,
        enabled: true,
        stakeMode,
        fixedStake: stakeMode === 'fixed' ? fixedStake : null,
        proportionalMultiplier:
          stakeMode === 'proportional' ? multiplier : null,
        maximumStake: maximumStake.trim().length === 0 ? null : maximumStake,
        stopLoss: stopLoss.trim().length === 0 ? null : stopLoss,
        allowedContractTypes
      }))
    )
  }
  const toggleSub = (accountId: string) =>
    setSelectedSubAccountIds((current) =>
      current.length === 0
        ? availableSubAccounts
            .map((account) => account.accountId)
            .filter((candidate) => candidate !== accountId)
        : current.includes(accountId)
          ? current.filter((candidate) => candidate !== accountId)
          : [...current, accountId]
    )
  const toggleContract = (contractType: string) =>
    setAllowedContractTypes((current) =>
      current.includes(contractType)
        ? current.filter((candidate) => candidate !== contractType)
        : [...current, contractType]
    )

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
          <button
            type="button"
            onClick={() => setIsDark((value) => !value)}
            className="flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"
            aria-label={isDark ? 'Use light appearance' : 'Use dark appearance'}
          >
            {isDark ? (
              <Sun className="size-4" aria-hidden="true" />
            ) : (
              <Moon className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8 dark:bg-white dark:text-slate-950">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-violet-300 dark:text-violet-700">
                <Copy className="size-4" aria-hidden="true" />
                Phase Six copy trading
              </p>
              <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Copy accepted entries between your own authorised accounts.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 dark:text-slate-600">
                Every sub-account is independently checked for connection,
                contract permissions, stake caps, account risk, and its own loss
                limit. A rejection on one account never blocks eligible
                accounts.
              </p>
            </div>
            <Link
              to="/history"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-white dark:border-slate-300 dark:text-slate-950"
            >
              View trade records
              <ArrowLeft className="size-4 rotate-180" aria-hidden="true" />
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
            title="Loading authorised accounts"
            message="Checking the accounts available for a private master and sub-account configuration."
          />
        ) : null}
        {state.status === 'empty' ? (
          <StateCard
            icon={<WalletCards className="size-7" aria-hidden="true" />}
            title="More authorised accounts are needed"
            message={state.message}
            action={
              <Link
                to="/accounts"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
              >
                <WalletCards className="size-4" aria-hidden="true" />
                Manage accounts
              </Link>
            }
          />
        ) : null}
        {state.status === 'error' ? (
          <StateCard
            icon={
              <CircleAlert
                className="size-7 text-rose-700 dark:text-rose-300"
                aria-hidden="true"
              />
            }
            title="Copy Trading is unavailable"
            message={state.message}
            danger
          />
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
                    <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">
                      New private copy session
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                      Master and sub-account safeguards
                    </h2>
                  </div>
                  <StatusPill tone="attention">Accepted trades only</StatusPill>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="Master account">
                    <select
                      value={activeMasterAccountId}
                      onChange={(event) =>
                        setMasterAccountId(event.target.value)
                      }
                      className={inputClassName}
                    >
                      {accounts.map((account) => (
                        <option
                          key={account.accountId}
                          value={account.accountId}
                        >
                          {account.displayName} · {account.kind}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Stake model">
                    <select
                      value={stakeMode}
                      onChange={(event) =>
                        setStakeMode(event.target.value as CopyStakeMode)
                      }
                      className={inputClassName}
                    >
                      <option value="fixed">Fixed stake per sub-account</option>
                      <option value="proportional">
                        Master stake multiplier
                      </option>
                    </select>
                  </Field>
                  {stakeMode === 'fixed' ? (
                    <Field label="Fixed copied stake">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={fixedStake}
                        onChange={(event) => setFixedStake(event.target.value)}
                        required
                        className={inputClassName}
                      />
                    </Field>
                  ) : (
                    <Field label="Proportional multiplier">
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={multiplier}
                        onChange={(event) => setMultiplier(event.target.value)}
                        required
                        className={inputClassName}
                      />
                    </Field>
                  )}
                  <Field label="Per-sub maximum stake">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={maximumStake}
                      onChange={(event) => setMaximumStake(event.target.value)}
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Per-sub loss limit">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={stopLoss}
                      onChange={(event) => setStopLoss(event.target.value)}
                      className={inputClassName}
                    />
                  </Field>
                </div>
                <fieldset className="mt-6">
                  <legend className="text-sm font-medium">
                    Allowed contract types
                  </legend>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {contractTypes.map((contractType) => (
                      <label
                        key={contractType}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm font-medium dark:border-slate-700"
                      >
                        <input
                          type="checkbox"
                          checked={allowedContractTypes.includes(contractType)}
                          onChange={() => toggleContract(contractType)}
                          className="size-4 rounded border-slate-300"
                        />
                        {contractType}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="mt-6">
                  <legend className="text-sm font-medium">
                    Enabled sub-accounts
                  </legend>
                  <div className="mt-3 grid gap-2">
                    {availableSubAccounts.map((account) => (
                      <label
                        key={account.accountId}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700"
                      >
                        <span>
                          <span className="block font-semibold">
                            {account.displayName}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {label(account.connectionState)} ·{' '}
                            {account.balance ?? 'Balance unavailable'}{' '}
                            {account.currency}
                          </span>
                        </span>
                        <input
                          type="checkbox"
                          checked={effectiveSubAccountIds.includes(
                            account.accountId
                          )}
                          onChange={() => toggleSub(account.accountId)}
                          className="size-4 rounded border-slate-300"
                        />
                      </label>
                    ))}
                  </div>
                </fieldset>
                <button
                  type="submit"
                  disabled={
                    isWorking ||
                    effectiveSubAccountIds.length === 0 ||
                    allowedContractTypes.length === 0
                  }
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950"
                >
                  <Play className="size-4" aria-hidden="true" />
                  Start guarded copy session
                </button>
              </form>
              <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
                <ShieldCheck
                  className="size-6 text-violet-700 dark:text-violet-300"
                  aria-hidden="true"
                />
                <h2 className="mt-5 text-xl font-semibold tracking-tight">
                  Independent execution
                </h2>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  <li>
                    Only master trades already accepted by Deriv can be
                    considered.
                  </li>
                  <li>
                    Each authorised sub-account validates its own connection,
                    risk cap, and loss limit.
                  </li>
                  <li>
                    Pause stops new copies. Stop ends the session and never
                    sells open contracts.
                  </li>
                  <li>
                    Rejected copies remain visible beside accepted entries for
                    an honest partial-success record.
                  </li>
                </ul>
              </aside>
            </section>
            <section className="mt-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Running and completed sessions
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                    Copy session records
                  </h2>
                </div>
                <StatusPill tone="planned">
                  {state.data.sessions.length} configured
                </StatusPill>
              </div>
              {state.data.sessions.length === 0 ? (
                <p className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  No copy sessions are configured. Choose a master and at least
                  one authorised sub-account to begin.
                </p>
              ) : (
                <div className="mt-5 grid gap-5">
                  {state.data.sessions.map((session) => (
                    <CopySessionCard
                      key={session.id}
                      session={session}
                      isWorking={isWorking}
                      onAction={(action) => void act(session.id, action)}
                      onSubAction={(accountId, action) =>
                        void actSubAccount(session.id, accountId, action)
                      }
                    />
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

function CopySessionCard({
  session,
  isWorking,
  onAction,
  onSubAction
}: Readonly<{
  session: CopyTradingSession
  isWorking: boolean
  onAction: (action: CopyAction) => void
  onSubAction: (accountId: string, action: CopyAction) => void
}>) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-semibold text-violet-700 dark:text-violet-300">
            Master {session.masterAccountId}
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight">
            {session.subAccounts.length} sub-account configuration
            {session.subAccounts.length === 1 ? '' : 's'}
          </h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Started {new Date(session.startedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill tone={sessionTone(session.state)}>
            {label(session.state)}
          </StatusPill>
          {session.state === 'running' ? (
            <button
              type="button"
              disabled={isWorking}
              onClick={() => onAction('pause')}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold disabled:opacity-50 dark:border-slate-700"
            >
              Pause all
            </button>
          ) : null}
          {session.state === 'paused' ||
          session.state === 'risk_limit_reached' ? (
            <button
              type="button"
              disabled={isWorking}
              onClick={() => onAction('resume')}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold disabled:opacity-50 dark:border-slate-700"
            >
              Resume all
            </button>
          ) : null}
          {session.state !== 'stopped' ? (
            <button
              type="button"
              disabled={isWorking}
              onClick={() => onAction('stop')}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
            >
              <Square className="size-3.5" aria-hidden="true" />
              Stop
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {session.subAccounts.map((sub) => (
          <section
            key={sub.configuration.accountId}
            className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{sub.configuration.accountId}</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  {sub.configuration.stakeMode === 'fixed'
                    ? `Fixed ${sub.configuration.fixedStake ?? '—'}`
                    : `Multiplier ${sub.configuration.proportionalMultiplier ?? '—'}`}{' '}
                  · cap {sub.configuration.maximumStake ?? 'none'}
                </p>
              </div>
              <StatusPill
                tone={sub.state === 'running' ? 'ready' : 'attention'}
              >
                {label(sub.state)}
              </StatusPill>
            </div>
            <dl className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
              <Stat label="Accepted" value={sub.statistics.accepted} />
              <Stat label="Rejected" value={sub.statistics.rejected} />
              <Stat
                label="Open"
                value={sub.statistics.pending + sub.statistics.open}
              />
              <Stat label="P/L" value={sub.statistics.totalProfitLoss} />
            </dl>
            <div className="mt-4 flex gap-2">
              {sub.state === 'running' ? (
                <button
                  type="button"
                  disabled={isWorking}
                  onClick={() =>
                    onSubAction(sub.configuration.accountId, 'pause')
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold disabled:opacity-50 dark:border-slate-600"
                >
                  <Pause className="size-3.5" aria-hidden="true" /> Pause
                </button>
              ) : null}
              {sub.state === 'paused' || sub.state === 'risk_limit_reached' ? (
                <button
                  type="button"
                  disabled={isWorking}
                  onClick={() =>
                    onSubAction(sub.configuration.accountId, 'resume')
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold disabled:opacity-50 dark:border-slate-600"
                >
                  <Play className="size-3.5" aria-hidden="true" /> Resume
                </button>
              ) : null}
              {sub.state !== 'stopped' ? (
                <button
                  type="button"
                  disabled={isWorking}
                  onClick={() =>
                    onSubAction(sub.configuration.accountId, 'stop')
                  }
                  className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 disabled:opacity-50 dark:border-rose-900 dark:text-rose-300"
                >
                  Stop sub
                </button>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}

function Field({
  label,
  children
}: Readonly<{ label: string; children: ReactNode }>) {
  return (
    <label className="block text-sm font-medium">
      {label}
      {children}
    </label>
  )
}

function Stat({
  label,
  value
}: Readonly<{ label: string; value: string | number }>) {
  return (
    <div>
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  )
}

function StateCard({
  icon,
  title,
  message,
  action,
  danger = false
}: Readonly<{
  icon: ReactNode
  title: string
  message: string
  action?: ReactNode
  danger?: boolean
}>) {
  return (
    <section
      className={`mt-8 rounded-3xl border p-8 text-center ${danger ? 'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}
    >
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
        {icon}
      </div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
        {message}
      </p>
      {action}
    </section>
  )
}
