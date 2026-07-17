import {
  ArrowLeft,
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
  demo_connected: 'Demo — Connected',
  real_connected: 'Real — Connected',
  reconnecting: 'Reconnecting',
  disconnected: 'Disconnected',
  authorization_expired: 'Authorization expired',
  restricted: 'Restricted'
}

function connectionTone(state: ConnectionState): string {
  if (state === 'demo_connected' || state === 'real_connected') {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-400/20'
  }

  if (state === 'reconnecting') {
    return 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-400/20'
  }

  return 'bg-slate-100 text-slate-700 ring-slate-600/10 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-400/20'
}

function formatBalance(account: AuthorizedAccount): string {
  if (account.balance === null) {
    return 'Waiting for Deriv'
  }

  const balance = Number(account.balance)

  if (!Number.isFinite(balance)) {
    return `${account.balance} ${account.currency}`
  }

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
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Deriv Auto Trader
          </Link>
          {selectedAccount === null ? (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Account connection
            </span>
          ) : (
            <div className="flex items-center gap-3 text-right">
              <div className="hidden sm:block">
                <p className="text-sm font-semibold">
                  {selectedAccount.displayName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatBalance(selectedAccount)}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${connectionTone(selectedAccount.connectionState)}`}
              >
                {connectionLabels[selectedAccount.connectionState]}
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8 dark:bg-white dark:text-slate-950">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-300 dark:text-emerald-700">
                <ShieldCheck className="size-4" aria-hidden="true" />
                Deriv-authorized access only
              </p>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Connect the account you intend to use.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 dark:text-slate-600">
                You sign in directly with Deriv. This app never asks for,
                receives, or stores a Deriv password.
              </p>
            </div>
            {state.status === 'success' ? (
              <button
                type="button"
                onClick={() => void refresh()}
                disabled={isWorking || state.session.selectedAccountId === null}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-50 dark:bg-slate-950 dark:text-white"
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                Refresh selected
              </button>
            ) : null}
          </div>
        </section>

        {state.status === 'loading' ? (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <RefreshCw
              className="mx-auto size-6 text-slate-500 dark:text-slate-400"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-lg font-semibold">
              Checking your secure session
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              No account details are displayed until Deriv authorization is
              confirmed.
            </p>
          </section>
        ) : null}

        {state.status === 'empty' ? (
          <section className="mt-8 grid gap-6 lg:grid-cols-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-3 dark:border-slate-800 dark:bg-slate-900">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <LogIn className="size-6" aria-hidden="true" />
              </span>
              <h2 className="mt-6 text-2xl font-semibold tracking-tight">
                Sign in with Deriv
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Deriv will ask you to authenticate and approve this application.
                After you return, choose from the demo and real accounts that
                Deriv authorizes.
              </p>
              {loginMessage === null ? null : (
                <p
                  className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                  role="alert"
                >
                  {loginMessage}
                </p>
              )}
              <button
                type="button"
                onClick={() => void startLogin()}
                disabled={isStartingLogin}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
              >
                <LogIn className="size-4" aria-hidden="true" />
                {isStartingLogin ? 'Opening Deriv…' : 'Login with Deriv'}
              </button>
            </div>
            <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="font-semibold">What happens next</h2>
              <ol className="mt-5 space-y-4">
                <li className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950">
                    1
                  </span>
                  <p className="text-sm leading-5 text-slate-600 dark:text-slate-300">
                    Deriv verifies your account and asks for consent.
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold dark:bg-slate-800">
                    2
                  </span>
                  <p className="text-sm leading-5 text-slate-600 dark:text-slate-300">
                    Choose the demo or real account you want to display and
                    connect.
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold dark:bg-slate-800">
                    3
                  </span>
                  <p className="text-sm leading-5 text-slate-600 dark:text-slate-300">
                    Balances and open-contract reconciliation come directly from
                    Deriv.
                  </p>
                </li>
              </ol>
            </aside>
          </section>
        ) : null}

        {state.status === 'error' ? (
          <section className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-900 dark:bg-rose-950">
            <CircleAlert
              className="mx-auto size-7 text-rose-700 dark:text-rose-300"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-lg font-semibold text-rose-950 dark:text-rose-100">
              Account information is unavailable
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

        {state.status === 'success' ? (
          <section className="mt-8">
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
                  Deriv did not return a demo or real Options trading account
                  for this authorization.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Authorized accounts
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                      Select an account connection
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
                        className={`rounded-3xl border bg-white p-6 shadow-sm dark:bg-slate-900 ${isSelected ? 'border-slate-950 ring-1 ring-slate-950 dark:border-white dark:ring-white' : 'border-slate-200 dark:border-slate-800'}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex size-11 items-center justify-center rounded-2xl ${account.kind === 'demo' ? 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}`}
                            >
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
                              className="size-5 text-emerald-600 dark:text-emerald-400"
                              aria-label="Selected account"
                            />
                          ) : null}
                        </div>
                        <div className="mt-7 flex items-end justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                              Deriv balance
                            </p>
                            <p className="mt-1 text-xl font-semibold tracking-tight">
                              {formatBalance(account)}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${connectionTone(account.connectionState)}`}
                          >
                            {isConnected ? (
                              <Wifi className="size-3.5" aria-hidden="true" />
                            ) : (
                              <WifiOff
                                className="size-3.5"
                                aria-hidden="true"
                              />
                            )}
                            {connectionLabels[account.connectionState]}
                          </span>
                        </div>
                        <div className="mt-6 flex gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              void chooseAccount(account.accountId)
                            }
                            disabled={isWorking}
                            className="flex-1 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
                          >
                            {isSelected
                              ? 'Reconnect account'
                              : 'Select account'}
                          </button>
                          {isSelected &&
                          account.connectionState !== 'disconnected' ? (
                            <button
                              type="button"
                              onClick={() => void disconnect(account.accountId)}
                              disabled={isWorking}
                              className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
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

            <div className="mt-8 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                Disconnect stops live updates for the selected account. Logout
                removes this app’s active Deriv session without affecting your
                Deriv account.
              </p>
              <button
                type="button"
                onClick={() => void signOut()}
                disabled={isWorking}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Logout
              </button>
            </div>
            {selectedAccount === null ? null : (
              <Link
                to="/automation"
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
              >
                <ShieldCheck className="size-4" aria-hidden="true" />
                Open safety console
              </Link>
            )}
          </section>
        ) : null}
      </main>
    </div>
  )
}
