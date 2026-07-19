import {
  AlertTriangle,
  CircleAlert,
  LoaderCircle,
  ShieldAlert,
  ShieldCheck,
  WalletCards
} from 'lucide-react'
import { type FormEvent, type ReactNode, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSafetyConsole } from '../../automation/hooks/useSafetyConsole'

export function RiskCalculatorPage() {
  const {
    state,
    isWorking,
    actionMessage,
    saveAccountRisk,
    emergencyStop,
    resetEmergencyStop
  } = useSafetyConsole()
  const [maximumActiveContracts, setMaximumActiveContracts] = useState('3')
  const [maximumSingleTradeStake, setMaximumSingleTradeStake] = useState('5.00')
  const [maximumCombinedRunningLoss, setMaximumCombinedRunningLoss] =
    useState('20.00')
  const [isConfirmingStop, setIsConfirmingStop] = useState(false)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void saveAccountRisk({
      maximumActiveContracts: Number(maximumActiveContracts),
      maximumSingleTradeStake,
      maximumCombinedRunningLoss
    })
  }

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8 dark:bg-white dark:text-slate-950">
        <p className="flex items-center gap-2 text-sm font-bold text-emerald-300 dark:text-emerald-700">
          <ShieldCheck className="size-4" aria-hidden="true" /> Account-wide
          risk controls
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Calculate boundaries before you start automation.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 dark:text-slate-600">
          Bot limits can be stricter than the account limits shown here, but
          cannot override them. Emergency Stop blocks new entries and does not
          sell open contracts.
        </p>
      </section>
      {state.status === 'loading' ? (
        <StateCard
          icon={
            <LoaderCircle className="size-7 animate-spin" aria-hidden="true" />
          }
          title="Loading risk controls"
          message="Checking the selected account, active session cycle, and saved account limits."
        />
      ) : null}
      {state.status === 'empty' ? (
        <StateCard
          icon={<WalletCards className="size-7" aria-hidden="true" />}
          title="Select an account first"
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
          title="Risk controls are unavailable"
          message={state.message}
          danger
        />
      ) : null}
      {state.status === 'success' ? (
        <>
          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Metric
              label="Combined running P/L"
              value={state.data.snapshot.cycle.runningProfitLoss}
              detail="Current automation cycle"
            />
            <Metric
              label="Maximum active contracts"
              value={String(
                state.data.snapshot.risk.account.limits.maximumActiveContracts
              )}
              detail="Saved account limit"
            />
            <Metric
              label="Maximum single stake"
              value={
                state.data.snapshot.risk.account.limits.maximumSingleTradeStake
              }
              detail="Saved account limit"
            />
            <Metric
              label="Maximum running loss"
              value={
                state.data.snapshot.risk.account.limits
                  .maximumCombinedRunningLoss
              }
              detail="Saved account limit"
            />
          </section>
          <section className="mt-6 grid gap-6 lg:grid-cols-5">
            <form
              onSubmit={submit}
              className="rounded-3xl border border-slate-200 bg-white p-6 lg:col-span-3 dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                Calculator and account limits
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                Set a ceiling before a session does it for you.
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <Field label="Maximum active contracts">
                  <input
                    type="number"
                    min="1"
                    value={maximumActiveContracts}
                    onChange={(event) =>
                      setMaximumActiveContracts(event.target.value)
                    }
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
                  />
                </Field>
                <Field label="Maximum single stake">
                  <input
                    inputMode="decimal"
                    value={maximumSingleTradeStake}
                    onChange={(event) =>
                      setMaximumSingleTradeStake(event.target.value)
                    }
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
                  />
                </Field>
                <Field label="Maximum combined loss">
                  <input
                    inputMode="decimal"
                    value={maximumCombinedRunningLoss}
                    onChange={(event) =>
                      setMaximumCombinedRunningLoss(event.target.value)
                    }
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
                  />
                </Field>
              </div>
              <button
                disabled={isWorking}
                className="mt-6 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
              >
                Save account limits
              </button>
              {actionMessage === null ? null : (
                <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
                  {actionMessage}
                </p>
              )}
            </form>
            <aside className="rounded-3xl border border-rose-200 bg-rose-50 p-6 lg:col-span-2 dark:border-rose-900 dark:bg-rose-950">
              <p className="flex items-center gap-2 text-sm font-bold text-rose-800 dark:text-rose-200">
                <ShieldAlert className="size-4" aria-hidden="true" /> Emergency
                Stop
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                Stop new automation entries.
              </h2>
              <p className="mt-3 text-sm leading-6 text-rose-900 dark:text-rose-100">
                Affects{' '}
                {
                  state.data.snapshot.sessions.filter((session) =>
                    ['running', 'paused', 'starting', 'reconnecting'].includes(
                      session.state
                    )
                  ).length
                }{' '}
                tracked automation process
                {state.data.snapshot.sessions.filter((session) =>
                  ['running', 'paused', 'starting', 'reconnecting'].includes(
                    session.state
                  )
                ).length === 1
                  ? ''
                  : 'es'}{' '}
                for the selected account. Open contracts are never sold.
              </p>
              {state.data.snapshot.risk.account.emergencyStopActive ? (
                <button
                  type="button"
                  disabled={isWorking}
                  onClick={() => void resetEmergencyStop()}
                  className="mt-6 rounded-lg border border-rose-300 px-4 py-2.5 text-sm font-bold text-rose-900 disabled:opacity-50 dark:border-rose-800 dark:text-rose-100"
                >
                  Clear Emergency Stop
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingStop(true)}
                  className="mt-6 rounded-lg bg-rose-700 px-4 py-2.5 text-sm font-bold text-white"
                >
                  Emergency Stop
                </button>
              )}
            </aside>
          </section>
        </>
      ) : null}
      {isConfirmingStop && state.status === 'success' ? (
        <div
          className="fixed inset-0 z-50 flex items-end bg-slate-950/60 p-4 sm:items-center sm:justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="emergency-title"
        >
          <section className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <AlertTriangle
              className="size-7 text-rose-700 dark:text-rose-300"
              aria-hidden="true"
            />
            <h2 id="emergency-title" className="mt-4 text-2xl font-semibold">
              Confirm Emergency Stop
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Stop new entries for the selected account and its{' '}
              {
                state.data.snapshot.sessions.filter((session) =>
                  ['running', 'paused', 'starting', 'reconnecting'].includes(
                    session.state
                  )
                ).length
              }{' '}
              tracked processes. This cannot sell open contracts.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsConfirmingStop(false)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isWorking}
                onClick={() => {
                  void emergencyStop()
                  setIsConfirmingStop(false)
                }}
                className="rounded-lg bg-rose-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                Confirm stop
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  )
}

function Field({
  label,
  children
}: Readonly<{ label: string; children: ReactNode }>) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      {children}
    </label>
  )
}
function Metric({
  label,
  value,
  detail
}: Readonly<{ label: string; value: string; detail: string }>) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-bold tracking-wide text-slate-500 uppercase dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        {detail}
      </p>
    </article>
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
