import {
  Activity,
  ArrowRight,
  Bot,
  CircleAlert,
  Gauge,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  WalletCards,
  Zap
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAccounts } from '../../accounts/hooks/useAccounts'
import type { AuthorizedAccount } from '../../accounts/types/accounts.types'

function balance(account: AuthorizedAccount): string {
  return account.balance === null
    ? 'Waiting for Deriv'
    : `${account.balance} ${account.currency}`
}

export function DashboardPage() {
  const { state, refresh } = useAccounts()
  const selectedAccount =
    state.status === 'success'
      ? (state.session.accounts.find(
          (account) => account.accountId === state.session.selectedAccountId
        ) ?? null)
      : null

  return (
    <main className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="grid gap-5 xl:grid-cols-5">
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-slate-950/20 sm:p-8 xl:col-span-3">
          <div
            className="absolute -top-20 -right-20 size-56 rounded-full bg-sky-400/10 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative">
            <p className="flex items-center gap-2 text-xs font-bold tracking-wider text-sky-600 uppercase dark:text-sky-300">
              <span className="flex size-6 items-center justify-center rounded-full bg-sky-400/15">
                <Gauge className="size-3.5" aria-hidden="true" />
              </span>
              Command center
            </p>
            <h1 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              A calmer view of your account, market, and risk limits.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Validate a trade preview before starting. Market observations help
              you review data; they never predict a future trade.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/bots"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-sky-300"
              >
                <Bot className="size-4" aria-hidden="true" /> Build a bot{' '}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                to="/analysis"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:border-sky-400 hover:text-sky-300"
              >
                <Activity className="size-4" aria-hidden="true" /> Explore
                analysis
              </Link>
            </div>
          </div>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Selected account
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Account data is reported by Deriv.
              </p>
            </div>
            <WalletCards
              className="size-5 text-sky-600 dark:text-sky-300"
              aria-hidden="true"
            />
          </div>
          {state.status === 'loading' ? <LoadingAccount /> : null}
          {state.status === 'empty' ? <EmptyAccount /> : null}
          {state.status === 'error' ? (
            <ErrorAccount message={state.message} />
          ) : null}
          {selectedAccount !== null ? (
            <ConnectedAccount
              account={selectedAccount}
              onRefresh={() => refresh()}
            />
          ) : null}
        </aside>
      </section>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatusCard
          label="Automation"
          value="Idle"
          detail="No active session"
          icon={Bot}
        />
        <StatusCard
          label="Market data"
          value="Ready"
          detail="Choose a feed in Analysis"
          icon={Activity}
        />
        <StatusCard
          label="Contracts"
          value="0 open"
          detail="No trade action implied"
          icon={Zap}
        />
        <StatusCard
          label="Risk guard"
          value="Available"
          detail="Emergency Stop is ready"
          icon={ShieldAlert}
        />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-5">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold tracking-wider text-sky-600 uppercase dark:text-sky-300">
                Live tick workspace
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Connect a market to populate the digit board.
              </h2>
            </div>
            <Link
              to="/analysis"
              className="inline-flex items-center gap-2 text-sm font-bold text-sky-700 transition hover:text-sky-500 dark:text-sky-300 dark:hover:text-sky-200"
            >
              Open analysis <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 lg:col-span-2 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                Latest tick
              </p>
              <p className="mt-4 text-4xl font-semibold tracking-tight">—</p>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Select an authorized account and market feed to view live data.
              </p>
            </div>
            <div
              className="grid grid-cols-5 gap-2 lg:col-span-3"
              aria-label="Empty digit board"
            >
              {Array.from({ length: 10 }, (_, digit) => (
                <div
                  key={digit}
                  className="flex aspect-square items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                >
                  {digit}
                </div>
              ))}
            </div>
          </div>
          <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Frequency is historical observation, not a probability of the next
            independent tick.
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <p className="flex items-center gap-2 text-xs font-bold tracking-wider text-amber-700 uppercase dark:text-amber-300">
            <CircleAlert className="size-4" aria-hidden="true" /> Risk reminder
          </p>
          <h2 className="mt-4 text-xl font-semibold tracking-tight">
            Keep loss limits visible before any trade.
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Automation can lose money. Historical observations do not predict
            outcomes, and martingale or bulk entries can increase losses.
          </p>
          <Link
            to="/risk"
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-800 transition hover:border-sky-400 hover:text-sky-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
          >
            Open risk controls{' '}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </article>
      </section>
    </main>
  )
}

function LoadingAccount() {
  return (
    <div className="mt-8 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
      <LoaderCircle
        className="size-5 animate-spin text-sky-600 dark:text-sky-300"
        aria-hidden="true"
      />{' '}
      Checking account connection…
    </div>
  )
}

function EmptyAccount() {
  return (
    <div className="mt-8">
      <p className="text-lg font-semibold">No account connected</p>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
        Connect a Deriv account to see balance, connection state, and
        account-bound controls.
      </p>
      <Link
        to="/accounts"
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-sky-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-sky-300"
      >
        <WalletCards className="size-4" aria-hidden="true" /> Open accounts
      </Link>
    </div>
  )
}

function ErrorAccount({ message }: Readonly<{ message: string }>) {
  return (
    <div className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm leading-6 text-rose-700 dark:text-rose-200">
      {message}
    </div>
  )
}

function ConnectedAccount({
  account,
  onRefresh
}: Readonly<{ account: AuthorizedAccount; onRefresh: () => void }>) {
  const connected =
    account.connectionState === 'demo_connected' ||
    account.connectionState === 'real_connected'
  return (
    <div className="mt-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-semibold tracking-tight">
            {account.displayName}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {balance(account)}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${account.kind === 'real' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300' : 'bg-sky-500/15 text-sky-700 dark:text-sky-300'}`}
        >
          {account.kind === 'real' ? 'Real' : 'Demo'}
        </span>
      </div>
      <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-950">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {account.connectionState.replaceAll('_', ' ')}
        </span>
        <span
          className={`size-2 rounded-full ${connected ? 'bg-sky-400' : 'bg-slate-400'}`}
          aria-label={connected ? 'Connected' : 'Disconnected'}
        />
      </div>
      <button
        type="button"
        onClick={onRefresh}
        className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-sky-700 transition hover:text-sky-500 dark:text-sky-300"
      >
        <RefreshCw className="size-4" aria-hidden="true" /> Refresh account
      </button>
    </div>
  )
}

function StatusCard({
  label,
  value,
  detail,
  icon: Icon
}: Readonly<{
  label: string
  value: string
  detail: string
  icon: typeof Bot
}>) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-400/60 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      <span className="flex size-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <p className="mt-5 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        {detail}
      </p>
    </article>
  )
}
