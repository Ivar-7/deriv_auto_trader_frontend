import {
  Bot,
  ChartNoAxesCombined,
  ClipboardList,
  Copy,
  Gauge,
  History,
  Landmark,
  LifeBuoy,
  LogOut,
  Moon,
  RefreshCw,
  Settings,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Volume2,
  VolumeX,
  WalletCards,
  Wind,
  Zap
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  acceptRealAccountDisclosure,
  getRealAccountDisclosure
} from '../../features/accounts/api/accounts.api'
import { useAccounts } from '../../features/accounts/hooks/useAccounts'
import type {
  AuthorizedAccount,
  ConnectionState,
  RealAccountDisclosure
} from '../../features/accounts/types/accounts.types'
import { ApiError } from '../../shared/api/httpClient'
import { useAppearance } from '../../shared/hooks/useAppearance'
import { useSoundPreference } from '../../shared/hooks/useSoundPreference'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Gauge },
  { to: '/bots', label: 'Bot Builder', icon: Bot },
  { to: '/scanner', label: 'Differs Bot', icon: Zap },
  { to: '/analysis', label: 'Analysis Tool', icon: SlidersHorizontal },
  { to: '/charts', label: 'Charts', icon: ChartNoAxesCombined },
  { to: '/bulk', label: 'Bulk Trader', icon: Landmark },
  { to: '/risk', label: 'Risk', icon: ShieldAlert },
  { to: '/copy', label: 'Copy Trading', icon: Copy },
  { to: '/history', label: 'History', icon: History },
  { to: '/activity', label: 'Activity', icon: ClipboardList },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/aviator', label: 'Aviator', icon: Wind }
] as const

const connectionLabel: Record<ConnectionState, string> = {
  demo_connected: 'Demo — Connected',
  real_connected: 'Real — Connected',
  reconnecting: 'Reconnecting',
  disconnected: 'Disconnected',
  authorization_expired: 'Authorization expired',
  restricted: 'Restricted'
}

function formatBalance(account: AuthorizedAccount): string {
  if (account.balance === null) return 'Balance pending'
  const balance = Number(account.balance)
  if (!Number.isFinite(balance)) return `${account.balance} ${account.currency}`
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: account.currency,
    maximumFractionDigits: 2
  }).format(balance)
}

function pageTitle(pathname: string): string {
  return (
    navItems.find((item) => pathname.startsWith(item.to))?.label ?? 'Workspace'
  )
}

export function AuthenticatedLayout() {
  const location = useLocation()
  const { isDark, setIsDark } = useAppearance()
  const { isSoundEnabled, setIsSoundEnabled } = useSoundPreference()
  const {
    state: accountsState,
    isWorking,
    chooseAccount,
    refresh,
    disconnect,
    signOut
  } = useAccounts()
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [isDisclosureOpen, setIsDisclosureOpen] = useState(false)
  const [hasConfirmedDisclosure, setHasConfirmedDisclosure] = useState(false)
  const [disclosure, setDisclosure] = useState<RealAccountDisclosure | null>(
    null
  )
  const [disclosureMessage, setDisclosureMessage] = useState<string | null>(
    null
  )
  const [isAcceptingDisclosure, setIsAcceptingDisclosure] = useState(false)
  const [resetMessage, setResetMessage] = useState<string | null>(null)

  const selectedAccount = useMemo(() => {
    if (accountsState.status !== 'success') return null
    return (
      accountsState.session.accounts.find(
        (account) =>
          account.accountId === accountsState.session.selectedAccountId
      ) ?? null
    )
  }, [accountsState])
  const currentDisclosure =
    disclosure?.accountId === selectedAccount?.accountId ? disclosure : null

  const resetDisabled = ['/automation', '/bots', '/bulk', '/copy'].some(
    (path) => location.pathname.startsWith(path)
  )

  useEffect(() => {
    if (selectedAccount?.kind !== 'real') {
      return
    }

    let isCurrent = true
    void getRealAccountDisclosure()
      .then((nextDisclosure) => {
        if (isCurrent) setDisclosure(nextDisclosure)
      })
      .catch(() => undefined)

    return () => {
      isCurrent = false
    }
  }, [selectedAccount?.accountId, selectedAccount?.kind])

  const acceptDisclosure = async () => {
    if (!hasConfirmedDisclosure) return
    setIsAcceptingDisclosure(true)
    setDisclosureMessage(null)
    try {
      const accepted = await acceptRealAccountDisclosure()
      setDisclosure(accepted)
      setIsDisclosureOpen(false)
      setHasConfirmedDisclosure(false)
    } catch (error: unknown) {
      setDisclosureMessage(
        error instanceof ApiError
          ? error.message
          : 'Unable to record your disclosure acceptance.'
      )
    } finally {
      setIsAcceptingDisclosure(false)
    }
  }

  const resetWorkspace = () => {
    if (resetDisabled) return
    window.dispatchEvent(new CustomEvent('deriv-auto-trader-reset'))
    setResetMessage('Inactive form values and temporary results were reset.')
    window.setTimeout(() => setResetMessage(null), 3_000)
  }

  const title = pageTitle(location.pathname)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-16 items-center justify-between gap-3">
            <NavLink
              to="/dashboard"
              className="flex shrink-0 items-center gap-2"
              aria-label="Deriv Auto Trader dashboard"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                <Zap className="size-4" aria-hidden="true" />
              </span>
              <span className="hidden text-sm font-bold tracking-tight sm:block">
                Deriv Auto Trader
              </span>
            </NavLink>

            <div className="hidden min-w-0 flex-1 lg:block">
              <p className="truncate text-sm font-semibold">{title}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                Authorized Deriv controls · no passwords collected
              </p>
            </div>

            <div className="flex min-w-0 items-center justify-end gap-2">
              {selectedAccount === null ? (
                <NavLink
                  to="/accounts"
                  className="hidden rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold sm:inline-flex dark:border-slate-700"
                >
                  <WalletCards className="mr-1.5 size-3.5" aria-hidden="true" />
                  Connect account
                </NavLink>
              ) : (
                <div className="hidden min-w-0 items-center gap-2 sm:flex">
                  <select
                    value={selectedAccount.accountId}
                    onChange={(event) => chooseAccount(event.target.value)}
                    disabled={isWorking}
                    aria-label="Selected Deriv account"
                    className="max-w-36 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900"
                  >
                    {accountsState.status === 'success'
                      ? accountsState.session.accounts.map((account) => (
                          <option
                            key={account.accountId}
                            value={account.accountId}
                          >
                            {account.displayName}
                          </option>
                        ))
                      : null}
                  </select>
                  <div className="hidden text-right xl:block">
                    <p className="text-xs font-semibold">
                      {formatBalance(selectedAccount)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {connectionLabel[selectedAccount.connectionState]}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => refresh()}
                    disabled={isWorking}
                    aria-label="Refresh Deriv balance"
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300"
                  >
                    <RefreshCw className="size-3.5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => disconnect()}
                    disabled={isWorking}
                    className="hidden rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold disabled:opacity-50 lg:inline-flex dark:border-slate-700"
                  >
                    Disconnect
                  </button>
                  <button
                    type="button"
                    onClick={() => void signOut()}
                    disabled={isWorking}
                    aria-label="Log out of Deriv Auto Trader"
                    className="hidden rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-50 lg:inline-flex dark:border-slate-700 dark:text-slate-300"
                  >
                    <LogOut className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsSoundEnabled((value) => !value)}
                aria-label={
                  isSoundEnabled
                    ? 'Mute interface sounds'
                    : 'Enable interface sounds'
                }
                className="rounded-lg border border-slate-200 p-2 text-slate-600 dark:border-slate-700 dark:text-slate-300"
              >
                {isSoundEnabled ? (
                  <Volume2 className="size-3.5" aria-hidden="true" />
                ) : (
                  <VolumeX className="size-3.5" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsDark((value) => !value)}
                aria-label={
                  isDark ? 'Use light appearance' : 'Use dark appearance'
                }
                className="rounded-lg border border-slate-200 p-2 text-slate-600 dark:border-slate-700 dark:text-slate-300"
              >
                {isDark ? (
                  <Sun className="size-3.5" aria-hidden="true" />
                ) : (
                  <Moon className="size-3.5" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={resetWorkspace}
                disabled={resetDisabled}
                title={
                  resetDisabled
                    ? 'Reset is unavailable while this automation tool can be active.'
                    : 'Reset only inactive form values and temporary results.'
                }
                className="hidden rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 sm:inline-flex dark:border-slate-700"
              >
                Reset
              </button>
              {selectedAccount?.kind === 'real' &&
              currentDisclosure?.accepted === false ? (
                <button
                  type="button"
                  onClick={() => setIsDisclosureOpen(true)}
                  className="hidden rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-slate-950 md:inline-flex"
                >
                  Risk disclosure
                </button>
              ) : null}
            </div>
          </div>
          <nav
            className="flex gap-1 overflow-x-auto pb-3"
            aria-label="Authenticated product navigation"
          >
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${isActive ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'}`
                  }
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </div>
      </header>

      {selectedAccount?.kind === 'real' &&
      currentDisclosure?.accepted === false ? (
        <div className="border-b border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <div className="mx-auto flex max-w-screen-2xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p className="text-sm text-amber-950 dark:text-amber-100">
              Real-account automation is locked until you review the risk
              disclosure for {selectedAccount.displayName}.
            </p>
            <button
              type="button"
              onClick={() => setIsDisclosureOpen(true)}
              className="rounded-lg border border-amber-300 px-3 py-2 text-xs font-bold text-amber-950 dark:border-amber-800 dark:text-amber-100"
            >
              Review disclosure
            </button>
          </div>
        </div>
      ) : null}

      {resetMessage === null ? null : (
        <div
          className="fixed right-4 bottom-20 z-40 rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white shadow-lg dark:bg-white dark:text-slate-950"
          role="status"
        >
          {resetMessage}
        </div>
      )}

      <Outlet />

      <button
        type="button"
        onClick={() => setIsHelpOpen(true)}
        className="fixed right-4 bottom-4 z-30 inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-lg dark:bg-white dark:text-slate-950"
        aria-label="Open contextual help"
      >
        <Sparkles className="size-4" aria-hidden="true" /> Help
      </button>

      {isHelpOpen ? (
        <aside
          className="fixed right-0 bottom-0 z-40 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          aria-label="Contextual help panel"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                <Sparkles className="size-4" aria-hidden="true" /> Contextual
                help
              </p>
              <h2 className="mt-2 text-xl font-semibold">Help for {title}</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsHelpOpen(false)}
              className="rounded-lg border border-slate-200 p-2 dark:border-slate-700"
              aria-label="Close help"
            >
              <LifeBuoy className="size-4" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 space-y-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <p>
              This panel explains controls, account states, and safe next steps.
              It cannot place trades, alter settings, or predict outcomes.
            </p>
            <section className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
              <h3 className="font-semibold text-slate-950 dark:text-white">
                Useful next steps
              </h3>
              <ul className="mt-3 space-y-2">
                <li>
                  Connect or switch an authorized Deriv account in the header.
                </li>
                <li>Review the risk limits before starting any automation.</li>
                <li>
                  Use observed market statistics as history, not a prediction.
                </li>
              </ul>
            </section>
            <NavLink
              to="/settings"
              onClick={() => setIsHelpOpen(false)}
              className="inline-flex items-center gap-2 font-semibold text-slate-950 underline dark:text-white"
            >
              <Settings className="size-4" aria-hidden="true" /> Open settings
            </NavLink>
          </div>
        </aside>
      ) : null}

      {isDisclosureOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end bg-slate-950/60 p-4 sm:items-center sm:justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="disclosure-title"
        >
          <section className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8 dark:bg-slate-900">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <ShieldAlert className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
                  Real account acknowledgement
                </p>
                <h2
                  id="disclosure-title"
                  className="mt-1 text-2xl font-semibold tracking-tight"
                >
                  Automation can lose money.
                </h2>
              </div>
            </div>
            <ul className="mt-6 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              <li>
                Trading and automation can result in losses, including losses
                that grow with martingale or bulk trading.
              </li>
              <li>
                Past results and historical tick or digit observations do not
                predict independent future outcomes.
              </li>
              <li>
                You are responsible for your chosen settings, account limits,
                and the automation you start.
              </li>
              <li>No outcome or profit is guaranteed.</li>
            </ul>
            <label className="mt-6 flex gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-medium dark:border-slate-700">
              <input
                type="checkbox"
                checked={hasConfirmedDisclosure}
                onChange={(event) =>
                  setHasConfirmedDisclosure(event.target.checked)
                }
                className="mt-1 size-4"
              />
              <span>
                I understand these risks and want to enable automation for this
                real account.
              </span>
            </label>
            {disclosureMessage === null ? null : (
              <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950 dark:text-rose-200">
                {disclosureMessage}
              </p>
            )}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsDisclosureOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold dark:border-slate-700"
              >
                Not now
              </button>
              <button
                type="button"
                onClick={() => void acceptDisclosure()}
                disabled={!hasConfirmedDisclosure || isAcceptingDisclosure}
                className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
              >
                {isAcceptingDisclosure
                  ? 'Recording acceptance…'
                  : 'Accept disclosure'}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {selectedAccount === null ? null : (
        <div className="sr-only" aria-live="polite">
          {connectionLabel[selectedAccount.connectionState]}
        </div>
      )}
      {accountsState.status === 'error' ? (
        <div className="sr-only">Account controls are unavailable.</div>
      ) : null}
    </div>
  )
}
