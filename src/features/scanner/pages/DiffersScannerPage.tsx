import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  Moon,
  Play,
  RefreshCw,
  ScanSearch,
  Sun,
  WalletCards
} from 'lucide-react'
import { type FormEvent, type ReactNode, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusPill } from '../../../shared/components/StatusPill'
import { useAppearance } from '../../../shared/hooks/useAppearance'
import { useDiffersScanner } from '../hooks/useDiffersScanner'
import type {
  DiffersScannerResult,
  ScannerBulkConfiguration
} from '../types/scanner.types'

const inputClassName =
  'mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-white'

function percentage(value: number | null): string {
  return value === null ? 'Awaiting ticks' : `${(value * 100).toFixed(1)}%`
}

function strength(value: number | null): string {
  return value === null ? 'Awaiting sample' : value.toFixed(2)
}

export function DiffersScannerPage() {
  const { isDark, setIsDark } = useAppearance()
  const {
    state,
    isWorking,
    actionMessage,
    selectedMarkets,
    connect,
    refresh,
    startBulk
  } = useDiffersScanner()
  const [search, setSearch] = useState('')
  const [markets, setMarkets] = useState<string[]>([])
  const [minimum, setMinimum] = useState(1)
  const [stake, setStake] = useState('1.00')
  const [count, setCount] = useState(3)
  const [delay, setDelay] = useState(5)

  const selectedAccount =
    state.status === 'success'
      ? (state.data.accountSession.accounts.find(
          (account) => account.accountId === state.data.selectedAccountId
        ) ?? null)
      : null
  const discoveredMarkets = useMemo(
    () =>
      state.status === 'success'
        ? state.data.markets.filter((market) =>
            `${market.symbol} ${market.displayName} ${market.submarket}`
              .toLowerCase()
              .includes(search.toLowerCase())
          )
        : [],
    [search, state]
  )
  const activeMarkets = selectedMarkets.length === 0 ? markets : selectedMarkets
  const configuration: ScannerBulkConfiguration = {
    stake,
    duration: 1,
    durationUnit: 't',
    count,
    entryDelaySeconds: delay,
    maximumActiveContracts: 1,
    stopLoss: null,
    takeProfit: null
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (markets.length > 0) void connect(markets, minimum)
  }

  const toggleMarket = (symbol: string) => {
    setMarkets((current) =>
      current.includes(symbol)
        ? current.filter((market) => market !== symbol)
        : current.length >= 12
          ? current
          : [...current, symbol]
    )
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
                  Differs Scanner
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
                <ScanSearch className="size-4" aria-hidden="true" />
                Phase Five Differs Scanner
              </p>
              <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Confirm an observational deviation before Auto Bulk.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 dark:text-slate-600">
                The scanner proposes the least-frequent digit, breaks ties by
                longest absence, then requires the same completed observation
                three times. Signal strength is an observational deviation,
                never a predicted win rate.
              </p>
            </div>
            <Link
              to="/bulk"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-white dark:border-slate-300 dark:text-slate-950"
            >
              <Play className="size-4" aria-hidden="true" />
              Open Bulk Trader
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
            title="Discovering available markets"
            message="Loading the selected account and Deriv-supported volatility symbols."
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
              Differs Scanner is unavailable
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
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900"
                onSubmit={submit}
              >
                <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">
                  Market discovery
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  Select volatility markets
                </h2>
                <label className="mt-5 block text-sm font-medium">
                  Filter symbols
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search a volatility market"
                    className={inputClassName}
                  />
                </label>
                <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
                  {discoveredMarkets.length === 0 ? (
                    <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      No supported volatility markets matched the filter.
                    </p>
                  ) : (
                    discoveredMarkets.map((market) => (
                      <label
                        key={market.symbol}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800"
                      >
                        <input
                          type="checkbox"
                          checked={markets.includes(market.symbol)}
                          onChange={() => toggleMarket(market.symbol)}
                          className="mt-0.5 size-4 rounded border-slate-300"
                        />
                        <span>
                          <span className="block font-semibold">
                            {market.displayName}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">
                            {market.symbol} · {market.submarket}
                          </span>
                        </span>
                      </label>
                    ))
                  )}
                </div>
                <label className="mt-5 block text-sm font-medium">
                  Minimum Differs Signal Strength
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.1"
                    value={minimum}
                    onChange={(event) => setMinimum(Number(event.target.value))}
                    className={inputClassName}
                  />
                </label>
                <button
                  type="submit"
                  disabled={isWorking || markets.length === 0}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-950"
                >
                  <ScanSearch className="size-4" aria-hidden="true" />
                  Monitor selected markets
                </button>
              </form>
              <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Auto Bulk settings
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight">
                  Fixed stake only
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Auto Bulk becomes available only after a 3/3 confirmed scanner
                  result meets the configured minimum. It submits sequentially,
                  has no martingale, and never sells an open contract on Stop.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <Field label="Stake">
                    <input
                      type="number"
                      min="0.35"
                      step="0.01"
                      value={stake}
                      onChange={(event) => setStake(event.target.value)}
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Count">
                    <input
                      type="number"
                      min="1"
                      value={count}
                      onChange={(event) => setCount(Number(event.target.value))}
                      className={inputClassName}
                    />
                  </Field>
                  <Field label="Delay (seconds)">
                    <input
                      type="number"
                      min="1"
                      value={delay}
                      onChange={(event) => setDelay(Number(event.target.value))}
                      className={inputClassName}
                    />
                  </Field>
                </div>
                <div className="mt-6 rounded-2xl bg-slate-100 p-5 dark:bg-slate-800">
                  <p className="text-sm font-semibold">Confirmation guard</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Completed evaluations: same proposed digit 1/3 → 2/3 → 3/3
                    Confirmed. A changed digit resets the count to 1/3.
                  </p>
                </div>
              </aside>
            </section>
            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Scanner ranking
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    Observed Differs deviations
                  </h2>
                </div>
                <button
                  type="button"
                  disabled={isWorking || activeMarkets.length === 0}
                  onClick={() => void refresh()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
                >
                  <RefreshCw className="size-4" aria-hidden="true" />
                  Refresh evaluation
                </button>
              </div>
              {state.data.results.length === 0 ? (
                <p className="mt-6 rounded-2xl bg-slate-100 p-5 text-sm leading-6 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  Choose one or more discovered volatility markets and begin
                  monitoring. No trade can be initiated from unconfirmed scanner
                  data.
                </p>
              ) : (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-max text-left text-sm">
                    <thead className="text-xs tracking-wide text-slate-500 uppercase dark:text-slate-400">
                      <tr>
                        <th className="pb-3 font-semibold">Market</th>
                        <th className="pb-3 font-semibold">Proposed digit</th>
                        <th className="pb-3 font-semibold">Differs observed</th>
                        <th className="pb-3 font-semibold">Strength</th>
                        <th className="pb-3 font-semibold">Confirmation</th>
                        <th className="pb-3 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.data.results.map((result) => (
                        <ScannerRow
                          key={result.market}
                          result={result}
                          isWorking={isWorking}
                          onStart={() =>
                            void startBulk(result.market, configuration)
                          }
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        ) : null}
      </main>
    </div>
  )
}

function ScannerRow({
  result,
  isWorking,
  onStart
}: Readonly<{
  result: DiffersScannerResult
  isWorking: boolean
  onStart: () => void
}>) {
  const tone = result.qualifiesForExecution
    ? 'ready'
    : result.confirmationState === 'confirmed'
      ? 'attention'
      : 'planned'
  return (
    <tr className="border-t border-slate-100 dark:border-slate-800">
      <td className="py-4 font-semibold">
        {result.market}
        <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">
          {result.dataState}
        </span>
      </td>
      <td className="py-4">
        {result.proposedDigit === null
          ? 'Awaiting ticks'
          : `${result.proposedDigit} · ${result.proposedDigitCount} seen`}
      </td>
      <td className="py-4">{percentage(result.observedDiffersPercentage)}</td>
      <td className="py-4">{strength(result.normalizedDeviation)}</td>
      <td className="py-4">
        <StatusPill tone={tone}>
          {result.confirmationCount}/3 {result.confirmationState}
        </StatusPill>
      </td>
      <td className="py-4">
        {result.qualifiesForExecution ? (
          <button
            type="button"
            disabled={isWorking}
            onClick={onStart}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
          >
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Auto Bulk
          </button>
        ) : (
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Need 3/3 + minimum
          </span>
        )}
      </td>
    </tr>
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
