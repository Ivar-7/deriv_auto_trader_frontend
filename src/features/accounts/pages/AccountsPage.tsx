import {
  CheckCircle2,
  CircleAlert,
  LogIn,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Unplug,
  WalletCards,
  Wifi,
  WifiOff
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../../../shared/api/httpClient'
import { beginDerivLogin } from '../api/accounts.api'
import { useAccounts } from '../hooks/useAccounts'
import type {
  AuthorizedAccount,
  ConnectionState
} from '../types/accounts.types'

const connectionLabels: Record<ConnectionState, string> = {
  demo_connected: 'Connected',
  real_connected: 'Connected',
  reconnecting: 'Reconnecting',
  disconnected: 'Disconnected',
  authorization_expired: 'Authorization expired',
  restricted: 'Restricted'
}

function connectionTone(state: ConnectionState): string {
  if (state === 'demo_connected' || state === 'real_connected') {
    return 'border-sky-400/30 bg-sky-400/10 text-sky-700 dark:text-sky-300'
  }
  if (state === 'reconnecting') {
    return 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
  }
  return 'border-slate-300 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
}

function formatBalance(account: AuthorizedAccount): string {
  if (account.balance === null) return 'Waiting for Deriv'
  const balance = Number(account.balance)
  if (!Number.isFinite(balance)) return `${account.balance} ${account.currency}`
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: account.currency,
    maximumFractionDigits: 2
  }).format(balance)
}

export function AccountsPage() {
  const {
    state,
    isWorking,
    load,
    chooseAccount,
    refresh,
    disconnect,
    signOut
  } = useAccounts()
  const [isStartingLogin, setIsStartingLogin] = useState(false)
  const [loginMessage, setLoginMessage] = useState<string | null>(null)

  const startLogin = async () => {
    setIsStartingLogin(true)
    setLoginMessage(null)
    try {
      await beginDerivLogin()
    } catch (error: unknown) {
      setLoginMessage(
        error instanceof ApiError
          ? error.message
          : 'Unable to start Deriv login.'
      )
      setIsStartingLogin(false)
    }
  }

  const selectedAccount =
    state.status === 'success'
      ? (state.session.accounts.find(
          (account) => account.accountId === state.session.selectedAccountId
        ) ?? null)
      : null

  return (
    <main className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-slate-950/20 sm:p-8">
        <div
          className="absolute -top-20 -right-12 size-56 rounded-full bg-sky-400/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold tracking-wider text-sky-300 uppercase">
              <ShieldCheck className="size-4" aria-hidden="true" />{' '}
              Deriv-authorized access
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Manage your connected accounts.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              You sign in directly with Deriv. This workspace never requests,
              receives, or stores your Deriv password.
            </p>
          </div>
          {state.status === 'success' ? (
            <button
              type="button"
              onClick={() => void refresh()}
              disabled={isWorking || state.session.selectedAccountId === null}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:border-sky-400 hover:text-sky-300 disabled:opacity-50"
            >
              <RefreshCw className="size-4" aria-hidden="true" /> Refresh
              selected
            </button>
          ) : null}
        </div>
      </section>

      {state.status === 'loading' ? (
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <RefreshCw
            className="mx-auto size-6 animate-spin text-sky-600 dark:text-sky-300"
            aria-hidden="true"
          />
          <h2 className="mt-4 text-lg font-semibold">
            Checking your secure session
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            No account details are shown until Deriv authorization is confirmed.
          </p>
        </section>
      ) : null}

      {state.status === 'empty' ? (
        <section className="mt-6 grid gap-5 lg:grid-cols-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-3 dark:border-slate-800 dark:bg-slate-900">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-700 dark:text-sky-300">
              <LogIn className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-6 text-2xl font-semibold tracking-tight">
              Sign in with Deriv
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Deriv will authenticate you and ask you to approve this
              application. When you return, choose the demo or real account you
              want to use.
            </p>
            {loginMessage === null ? null : (
              <p
                className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-200"
                role="alert"
              >
                {loginMessage}
              </p>
            )}
            <button
              type="button"
              onClick={() => void startLogin()}
              disabled={isStartingLogin}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-sky-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-sky-300 disabled:opacity-50"
            >
              <LogIn className="size-4" aria-hidden="true" />{' '}
              {isStartingLogin ? 'Opening Deriv…' : 'Login with Deriv'}
            </button>
          </div>
          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Connection flow
            </p>
            <ol className="mt-5 space-y-5">
              {[
                'Deriv verifies your account and asks for consent.',
                'Select the demo or real account you want to display.',
                'Balances and contract details are reconciled from Deriv.'
              ].map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-sky-400 dark:text-slate-950">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </aside>
        </section>
      ) : null}

      {state.status === 'error' ? (
        <section className="mt-6 rounded-3xl border border-rose-500/30 bg-rose-500/10 p-8 text-center">
          <CircleAlert
            className="mx-auto size-7 text-rose-700 dark:text-rose-300"
            aria-hidden="true"
          />
          <h2 className="mt-4 text-lg font-semibold text-rose-900 dark:text-rose-100">
            Account information is unavailable
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-rose-800 dark:text-rose-200">
            {state.message}
          </p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-500"
          >
            <RefreshCw className="size-4" aria-hidden="true" /> Try again
          </button>
        </section>
      ) : null}

      {state.status === 'success' ? (
        <section className="mt-6">
          {state.session.accounts.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <WalletCards
                className="mx-auto size-7 text-slate-500 dark:text-slate-400"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-lg font-semibold">
                No eligible trading accounts found
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Deriv did not return a demo or real Options trading account for
                this authorization.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-bold tracking-wider text-sky-600 uppercase dark:text-sky-300">
                    Authorized accounts
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    Choose an account workspace
                  </h2>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Each account has an independent Deriv connection.
                </p>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {state.session.accounts.map((account) => {
                  const isSelected =
                    account.accountId === state.session.selectedAccountId
                  const isConnected =
                    account.connectionState === 'demo_connected' ||
                    account.connectionState === 'real_connected'
                  return (
                    <article
                      key={account.accountId}
                      className={`rounded-3xl border bg-white p-6 shadow-sm transition dark:bg-slate-900 ${isSelected ? 'border-sky-400 ring-1 ring-sky-400/40' : 'border-slate-200 hover:border-slate-400 dark:border-slate-800 dark:hover:border-slate-600'}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="flex size-11 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-700 dark:text-sky-300">
                            <WalletCards
                              className="size-5"
                              aria-hidden="true"
                            />
                          </span>
                          <div>
                            <p className="font-semibold">
                              {account.displayName}
                            </p>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                              {account.kind === 'demo'
                                ? 'Demo account'
                                : 'Real account'}{' '}
                              · {account.currency}
                            </p>
                          </div>
                        </div>
                        {isSelected ? (
                          <CheckCircle2
                            className="size-5 text-sky-600 dark:text-sky-300"
                            aria-label="Selected account"
                          />
                        ) : null}
                      </div>
                      <div className="mt-7 flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                            Deriv balance
                          </p>
                          <p className="mt-1 text-xl font-semibold tracking-tight">
                            {formatBalance(account)}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${connectionTone(account.connectionState)}`}
                        >
                          {isConnected ? (
                            <Wifi className="size-3.5" aria-hidden="true" />
                          ) : (
                            <WifiOff className="size-3.5" aria-hidden="true" />
                          )}
                          {connectionLabels[account.connectionState]}
                        </span>
                      </div>
                      <div className="mt-6 flex gap-3">
                        <button
                          type="button"
                          onClick={() => void chooseAccount(account.accountId)}
                          disabled={isWorking}
                          className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-sky-400 hover:text-slate-950 disabled:opacity-50 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300"
                        >
                          {isSelected ? 'Reconnect account' : 'Select account'}
                        </button>
                        {isSelected &&
                        account.connectionState !== 'disconnected' ? (
                          <button
                            type="button"
                            onClick={() => void disconnect(account.accountId)}
                            disabled={isWorking}
                            className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 text-slate-700 transition hover:border-rose-400 hover:text-rose-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:text-rose-300"
                            aria-label={`Disconnect ${account.displayName}`}
                          >
                            <Unplug className="size-4" aria-hidden="true" />
                          </button>
                        ) : null}
                      </div>
                    </article>
                  )
                })}
              </div>
            </>
          )}

          <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              Disconnect stops live updates for the selected account. Logout
              removes this app’s session without affecting your Deriv account.
            </p>
            <button
              type="button"
              onClick={() => void signOut()}
              disabled={isWorking}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-rose-400 hover:text-rose-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:text-rose-300"
            >
              <LogOut className="size-4" aria-hidden="true" /> Logout
            </button>
          </div>
          {selectedAccount === null ? null : (
            <Link
              to="/bots"
              className="mt-5 inline-flex items-center justify-center gap-2 text-sm font-bold text-sky-700 transition hover:text-sky-500 dark:text-sky-300"
            >
              <ShieldCheck className="size-4" aria-hidden="true" /> Open Bot
              Builder
            </Link>
          )}
        </section>
      ) : null}
    </main>
  )
}
