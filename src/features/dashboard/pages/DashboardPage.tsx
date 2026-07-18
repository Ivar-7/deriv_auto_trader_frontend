import {
  Activity,
  ArrowRight,
  Bot,
  CircleAlert,
  Gauge,
  LoaderCircle,
  ShieldAlert,
  WalletCards,
  Zap
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAccounts } from '../../accounts/hooks/useAccounts'
import type { AuthorizedAccount } from '../../accounts/types/accounts.types'

function balance(account: AuthorizedAccount): string {
  if (account.balance === null) return 'Waiting for Deriv'
  return `${account.balance} ${account.currency}`
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
    <main className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8 lg:col-span-3 dark:bg-white dark:text-slate-950">
          <p className="flex items-center gap-2 text-sm font-bold text-emerald-300 dark:text-emerald-700">
            <Gauge className="size-4" aria-hidden="true" /> Automation overview
          </p>
          <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Watch the account, market, and risk boundary from one place.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 dark:text-slate-600">
            Start only after reviewing a valid trade preview. Live market
            information is observational; it is never a prediction of a future
            trade.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/bots"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-950 dark:bg-slate-950 dark:text-white"
            >
              <Bot className="size-4" aria-hidden="true" /> Open Bot Builder{' '}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              to="/analysis"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-bold text-white dark:border-slate-300 dark:text-slate-950"
            >
              <Activity className="size-4" aria-hidden="true" /> Analyze market
            </Link>
          </div>
        </div>
        <aside className="rounded-3xl border border-slate-200 bg-white p-6 lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            Selected account
          </p>
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

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatusCard
          label="Auto Trader"
          value="Idle"
          detail="No active session"
          icon={Bot}
          tone="slate"
        />
        <StatusCard
          label="Market workspace"
          value="Ready"
          detail="Connect a feed in Analysis"
          icon={Activity}
          tone="emerald"
        />
        <StatusCard
          label="Active contracts"
          value="0"
          detail="No contract action implied"
          icon={Zap}
          tone="slate"
        />
        <StatusCard
          label="Risk protection"
          value="Available"
          detail="Emergency Stop is one tap away"
          icon={ShieldAlert}
          tone="amber"
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-5">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 xl:col-span-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                Live tick workspace
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Connect a market to populate the digit board.
              </h2>
            </div>
            <Link
              to="/analysis"
              className="inline-flex items-center gap-2 text-sm font-bold underline"
            >
              Open Analysis Tool{' '}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-5">
            <div className="rounded-2xl bg-slate-100 p-5 lg:col-span-2 dark:bg-slate-800">
              <p className="text-xs font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Latest tick
              </p>
              <p className="mt-3 text-3xl font-semibold">—</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Choose an authorized account and a market feed to view live
                data.
              </p>
            </div>
            <div
              className="grid grid-cols-5 gap-2 lg:col-span-3"
              aria-label="Empty digit board"
            >
              {Array.from({ length: 10 }, (_, digit) => (
                <div
                  key={digit}
                  className="flex aspect-square items-center justify-center rounded-xl border border-slate-200 text-sm font-bold text-slate-500 dark:border-slate-700 dark:text-slate-400"
                >
                  {digit}
                </div>
              ))}
            </div>
          </div>
          <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">
            Frequency is a historical observation, not a probability of the next
            independent tick.
          </p>
        </article>
        <article className="rounded-3xl border border-amber-200 bg-amber-50 p-6 xl:col-span-2 dark:border-amber-900 dark:bg-amber-950">
          <p className="flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-200">
            <CircleAlert className="size-4" aria-hidden="true" /> Risk
            disclaimer
          </p>
          <h2 className="mt-3 text-xl font-semibold tracking-tight">
            Keep loss limits more visible than optimistic assumptions.
          </h2>
          <p className="mt-3 text-sm leading-6 text-amber-950 dark:text-amber-100">
            Automation can lose money. Past results and historical market
            observations do not predict future outcomes. Martingale and bulk
            entries can increase losses; no profit is guaranteed.
          </p>
          <Link
            to="/risk"
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-amber-300 px-4 py-2.5 text-sm font-bold text-amber-950 dark:border-amber-800 dark:text-amber-100"
          >
            Open Risk Calculator{' '}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </article>
      </section>
    </main>
  )
}

function LoadingAccount() {
  return (
    <div className="mt-6 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
      <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />{' '}
      Checking account connection…
    </div>
  )
}
function EmptyAccount() {
  return (
    <div className="mt-6">
      <p className="text-lg font-semibold">No account connected</p>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
        Connect a Deriv account to see your balance, connection state, and
        account-bound controls.
      </p>
      <Link
        to="/accounts"
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white dark:bg-white dark:text-slate-950"
      >
        <WalletCards className="size-4" aria-hidden="true" /> Open accounts
      </Link>
    </div>
  )
}
function ErrorAccount({ message }: Readonly<{ message: string }>) {
  return (
    <div className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm leading-6 text-rose-800 dark:bg-rose-950 dark:text-rose-200">
      {message}
    </div>
  )
}
function ConnectedAccount({
  account,
  onRefresh
}: Readonly<{ account: AuthorizedAccount; onRefresh: () => void }>) {
  return (
    <div className="mt-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold">{account.displayName}</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {balance(account)}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${account.kind === 'real' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'}`}
        >
          {account.kind === 'real' ? 'Real' : 'Demo'}
        </span>
      </div>
      <p className="mt-5 text-sm font-medium text-slate-600 dark:text-slate-300">
        {account.connectionState.replaceAll('_', ' ')}
      </p>
      <button
        type="button"
        onClick={onRefresh}
        className="mt-5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold dark:border-slate-700"
      >
        Refresh account
      </button>
    </div>
  )
}
function StatusCard({
  label,
  value,
  detail,
  icon: Icon,
  tone
}: Readonly<{
  label: string
  value: string
  detail: string
  icon: typeof Bot
  tone: 'slate' | 'emerald' | 'amber'
}>) {
  const tones = {
    slate: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100',
    emerald:
      'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-100',
    amber: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-100'
  }
  return (
    <article className={`rounded-2xl p-5 ${tones[tone]}`}>
      <Icon className="size-5" aria-hidden="true" />
      <p className="mt-5 text-xs font-bold tracking-wide uppercase">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
      <p className="mt-1 text-sm opacity-75">{detail}</p>
    </article>
  )
}
