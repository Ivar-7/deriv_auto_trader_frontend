import {
  ArrowLeft,
  CircleAlert,
  Download,
  FileClock,
  LoaderCircle,
  Moon,
  Search,
  Sun,
  WalletCards
} from 'lucide-react'
import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { StatusPill } from '../../../shared/components/StatusPill'
import { useAppearance } from '../../../shared/hooks/useAppearance'
import { useTradeRecords } from '../hooks/useTradeRecords'
import type { TradeRecord, TradeStatus } from '../types/records.types'

const inputClassName =
  'mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-white'
const statuses: readonly TradeStatus[] = [
  'pending',
  'open',
  'won',
  'lost',
  'sold_early',
  'expired',
  'cancelled',
  'error'
]

function label(value: string): string {
  return value.replaceAll('_', ' ')
}

function statusTone(status: TradeStatus) {
  return status === 'won' || status === 'open' || status === 'pending'
    ? 'ready'
    : status === 'lost' || status === 'error'
      ? 'attention'
      : 'planned'
}

export function TradeRecordsPage() {
  const { isDark, setIsDark } = useAppearance()
  const {
    state,
    filters,
    updateFilters,
    isDownloading,
    actionMessage,
    download
  } = useTradeRecords()
  const selectedAccount =
    state.status === 'success'
      ? (state.data.accountSession.accounts.find(
          (account) => account.accountId === state.data.selectedAccountId
        ) ?? null)
      : null

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <header className="hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
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
                  Trade records
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
      <main className="w-full px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8 dark:bg-white dark:text-slate-950">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-300 dark:text-emerald-700">
                <FileClock className="size-4" aria-hidden="true" />
                Phase Six open trades and history
              </p>
              <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Live contract state and a transparent account-level audit trail.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 dark:text-slate-600">
                Track the original Deriv status alongside the platform status,
                current value, entries, settlements, and bot, bulk, or copy
                references.
              </p>
            </div>
            <Link
              to="/copy"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-white dark:border-slate-300 dark:text-slate-950"
            >
              Open Copy Trading
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
            title="Loading trade records"
            message="Checking the selected account and its open contracts and settled history."
          />
        ) : null}
        {state.status === 'empty' ? (
          <StateCard
            icon={<WalletCards className="size-7" aria-hidden="true" />}
            title="Select an account to view records"
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
          <StateCard
            icon={
              <CircleAlert
                className="size-7 text-rose-700 dark:text-rose-300"
                aria-hidden="true"
              />
            }
            title="Trade records are unavailable"
            message={state.message}
            danger
          />
        ) : null}
        {state.status === 'success' ? (
          <>
            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    Search and filters
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                    Filter this selected account
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => void download()}
                  disabled={isDownloading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
                >
                  <Download className="size-4" aria-hidden="true" />
                  {isDownloading ? 'Preparing CSV' : 'Export filtered CSV'}
                </button>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Search contract, market, or prediction">
                  <span className="relative block">
                    <Search
                      className="pointer-events-none absolute top-5 left-3 size-4 text-slate-400"
                      aria-hidden="true"
                    />
                    <input
                      value={filters.search}
                      onChange={(event) =>
                        updateFilters({ search: event.target.value })
                      }
                      className={`${inputClassName} pl-9`}
                      placeholder="R_100 or contract ID"
                    />
                  </span>
                </Field>
                <Field label="Market">
                  <input
                    value={filters.market}
                    onChange={(event) =>
                      updateFilters({ market: event.target.value })
                    }
                    className={inputClassName}
                    placeholder="All markets"
                  />
                </Field>
                <Field label="Source">
                  <select
                    value={filters.source}
                    onChange={(event) =>
                      updateFilters({
                        source: event.target.value as typeof filters.source
                      })
                    }
                    className={inputClassName}
                  >
                    <option value="">All sources</option>
                    <option value="bot">Bot</option>
                    <option value="bulk">Bulk</option>
                    <option value="copy">Copy</option>
                  </select>
                </Field>
                <Field label="Platform status">
                  <select
                    value={filters.status}
                    onChange={(event) =>
                      updateFilters({
                        status: event.target.value as typeof filters.status
                      })
                    }
                    className={inputClassName}
                  >
                    <option value="">All statuses</option>
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {label(status)}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              {actionMessage === null ? null : (
                <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
                  {actionMessage}
                </p>
              )}
            </section>
            <RecordSection
              title="Open Trades"
              description="Pending and open contracts. Values remain sourced from Deriv updates; no action is implied unless Deriv explicitly allows one."
              records={state.data.openTrades}
              empty="No open trades match the current filters."
            />
            <RecordSection
              title="Trade History"
              description="Settled records include payout, exit information, timestamps, and the source that created the entry."
              records={state.data.history}
              empty="No settled trade history matches the current filters."
            />
          </>
        ) : null}
      </main>
    </div>
  )
}

function RecordSection({
  title,
  description,
  records,
  empty
}: Readonly<{
  title: string
  description: string
  records: readonly TradeRecord[]
  empty: string
}>) {
  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {records.length} record{records.length === 1 ? '' : 's'}
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">
            {title}
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          {description}
        </p>
      </div>
      {records.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {empty}
        </p>
      ) : (
        <RecordTable records={records} />
      )}
    </section>
  )
}

function RecordTable({
  records
}: Readonly<{ records: readonly TradeRecord[] }>) {
  return (
    <div className="mt-5 overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase dark:border-slate-700 dark:text-slate-400">
          <tr>
            <th className="px-3 py-3 font-semibold">Contract</th>
            <th className="px-3 py-3 font-semibold">Source</th>
            <th className="px-3 py-3 font-semibold">Stake / P&L</th>
            <th className="px-3 py-3 font-semibold">Deriv / Platform</th>
            <th className="px-3 py-3 font-semibold">Opened</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr
              key={record.id}
              className="border-b border-slate-100 align-top last:border-0 dark:border-slate-800"
            >
              <td className="px-3 py-4">
                <details>
                  <summary className="cursor-pointer font-semibold">
                    {record.derivContractId}
                  </summary>
                  <dl className="mt-3 grid gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <Detail label="Account" value={record.accountId} />
                    <Detail label="Market" value={record.market} />
                    <Detail label="Contract" value={record.contractType} />
                    <Detail
                      label="Prediction"
                      value={record.prediction ?? '—'}
                    />
                    <Detail
                      label="Potential payout"
                      value={record.potentialPayout ?? '—'}
                    />
                    <Detail
                      label="Entry / current"
                      value={`${record.entryValue ?? '—'} / ${record.currentValue ?? '—'}`}
                    />
                    <Detail
                      label="Remaining duration"
                      value={
                        record.remainingDuration ??
                        'Reported with the next Deriv update'
                      }
                    />
                    <Detail label="Payout" value={record.payout ?? '—'} />
                    <Detail
                      label="Martingale step"
                      value={
                        record.martingaleStep === null
                          ? '—'
                          : String(record.martingaleStep)
                      }
                    />
                    <Detail
                      label="Master reference"
                      value={record.masterDerivContractId ?? '—'}
                    />
                    <Detail
                      label="Bulk / copy reference"
                      value={`${record.bulkRunId ?? '—'} / ${record.copySessionId ?? '—'}`}
                    />
                  </dl>
                </details>
              </td>
              <td className="px-3 py-4">
                <p className="font-medium">{label(record.source)}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {record.masterAccountId === null
                    ? 'Own account'
                    : `Master ${record.masterAccountId}`}
                </p>
              </td>
              <td className="px-3 py-4">
                <p className="font-medium">{record.stake}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  P/L {record.profitLoss ?? '—'}
                </p>
              </td>
              <td className="px-3 py-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {record.derivStatus}
                </p>
                <div className="mt-1">
                  <StatusPill tone={statusTone(record.status)}>
                    {label(record.status)}
                  </StatusPill>
                </div>
              </td>
              <td className="px-3 py-4 text-xs text-slate-600 dark:text-slate-300">
                {record.openedAt === null
                  ? '—'
                  : new Date(record.openedAt).toLocaleString()}
                <span className="mt-1 block text-slate-500 dark:text-slate-400">
                  {record.closedAt === null
                    ? 'Open'
                    : `Closed ${new Date(record.closedAt).toLocaleString()}`}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
function Detail({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div>
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="font-medium">{value}</dd>
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
