import {
  CircleAlert,
  ClipboardList,
  LoaderCircle,
  RefreshCw,
  WalletCards
} from 'lucide-react'
import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useSafetyConsole } from '../../automation/hooks/useSafetyConsole'

function label(value: string): string {
  return value.replaceAll('_', ' ')
}

export function ActivityLogPage() {
  const { state, load, isWorking } = useSafetyConsole()
  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8 dark:bg-white dark:text-slate-950">
        <p className="flex items-center gap-2 text-sm font-bold text-emerald-300 dark:text-emerald-700">
          <ClipboardList className="size-4" aria-hidden="true" /> Meaningful
          activity only
        </p>
        <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              A concise account-level audit trail.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 dark:text-slate-600">
              Connection, session, signal, trade, martingale, risk, bulk, copy,
              reconciliation, and error changes are recorded. Individual ticks
              are intentionally excluded.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={isWorking}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 dark:border-slate-300 dark:text-slate-950"
          >
            <RefreshCw className="size-4" aria-hidden="true" /> Refresh log
          </button>
        </div>
      </section>
      {state.status === 'loading' ? (
        <StateCard
          icon={
            <LoaderCircle className="size-7 animate-spin" aria-hidden="true" />
          }
          title="Loading activity"
          message="Reading meaningful events for the selected account."
        />
      ) : null}
      {state.status === 'empty' ? (
        <StateCard
          icon={<WalletCards className="size-7" aria-hidden="true" />}
          title="Select an account to view activity"
          message={state.message}
          action={
            <Link
              to="/accounts"
              className="mt-5 inline-flex rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white dark:bg-white dark:text-slate-950"
            >
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
          title="Activity is unavailable"
          message={state.message}
          danger
        />
      ) : null}
      {state.status === 'success' ? (
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                Selected account
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                {state.data.selectedAccountId}
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {state.data.snapshot.activity.length} recent meaningful event
              {state.data.snapshot.activity.length === 1 ? '' : 's'}
            </p>
          </div>
          {state.data.snapshot.activity.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              No meaningful state changes are recorded for this account yet.
              Market ticks are deliberately not added to the Activity Log.
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs tracking-wide text-slate-500 uppercase dark:border-slate-700 dark:text-slate-400">
                  <tr>
                    <th className="px-3 py-3 font-bold">Time</th>
                    <th className="px-3 py-3 font-bold">Event</th>
                    <th className="px-3 py-3 font-bold">Context</th>
                    <th className="px-3 py-3 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {state.data.snapshot.activity.map((event) => (
                    <tr
                      key={event.id}
                      className="border-b border-slate-100 align-top last:border-0 dark:border-slate-800"
                    >
                      <td className="px-3 py-4 text-xs text-slate-600 dark:text-slate-300">
                        {new Date(event.occurredAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-4">
                        <p className="font-semibold">{label(event.event)}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {event.category}
                        </p>
                      </td>
                      <td className="px-3 py-4 text-xs text-slate-600 dark:text-slate-300">
                        {event.market ?? 'Account level'}
                        <span className="mt-1 block">
                          {event.sessionId ?? 'No session'}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold dark:bg-slate-800">
                          {label(event.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </main>
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
      className={`mt-6 rounded-3xl border p-8 text-center ${danger ? 'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}
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
