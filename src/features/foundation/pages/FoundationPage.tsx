import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  CircleAlert,
  Database,
  Gauge,
  Lock,
  Moon,
  Server,
  ShieldCheck,
  Sun,
  Wallet,
  Wifi
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusPill } from '../../../shared/components/StatusPill'
import { readPublicEnvironment } from '../../../shared/config/env'
import { useAppearance } from '../../../shared/hooks/useAppearance'

const navigationItems = [
  'Overview',
  'Accounts',
  'Automation',
  'Bots',
  'Markets',
  'Scanner',
  'Bulk',
  'Copy',
  'History',
  'Risk',
  'Activity'
] as const

type NavigationItem = (typeof navigationItems)[number]

const foundationItems = [
  {
    title: 'Typed API boundary',
    description:
      'Versioned health checks and structured API messages are ready for every future endpoint.',
    icon: Server,
    tone: 'ready' as const,
    status: 'Established'
  },
  {
    title: 'Persistent audit trail',
    description:
      'Migrations model non-secret configurations, sessions, trades, activity, and disclosure acceptance.',
    icon: Database,
    tone: 'ready' as const,
    status: 'Established'
  },
  {
    title: 'Deriv credentials',
    description:
      'Only an assigned App ID and authorized OAuth redirect are accepted. Passwords are never collected.',
    icon: Lock,
    tone: 'attention' as const,
    status: 'Action required'
  }
]

export function FoundationPage() {
  const [activeSection, setActiveSection] = useState<NavigationItem>('Overview')
  const { isDark, setIsDark } = useAppearance()
  const environment = readPublicEnvironment()
  const environmentTone = environment.isValid ? 'ready' : 'attention'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <a
            href="/"
            className="flex min-w-0 items-center gap-3"
            aria-label="Deriv Auto Trader overview"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              <Activity className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold tracking-tight">
                Deriv Auto Trader
              </span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">
                Foundation workspace
              </span>
            </span>
          </a>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Product sections"
          >
            {navigationItems.map((item) =>
              item === 'Accounts' ? (
                <Link
                  key={item}
                  to="/accounts"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  {item}
                </Link>
              ) : item === 'Automation' ? (
                <Link
                  key={item}
                  to="/automation"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  {item}
                </Link>
              ) : item === 'Markets' ? (
                <Link
                  key={item}
                  to="/analysis"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  {item}
                </Link>
              ) : item === 'Bots' ? (
                <Link
                  key={item}
                  to="/bots"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  {item}
                </Link>
              ) : item === 'Scanner' ? (
                <Link
                  key={item}
                  to="/scanner"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  {item}
                </Link>
              ) : item === 'Bulk' ? (
                <Link
                  key={item}
                  to="/bulk"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  {item}
                </Link>
              ) : item === 'Copy' ? (
                <Link
                  key={item}
                  to="/copy"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  {item}
                </Link>
              ) : item === 'History' ? (
                <Link
                  key={item}
                  to="/history"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                >
                  {item}
                </Link>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActiveSection(item)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    activeSection === item
                      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                  aria-current={activeSection === item ? 'page' : undefined}
                >
                  {item}
                </button>
              )
            )}
          </nav>

          <div className="flex items-center gap-2">
            <StatusPill tone={environmentTone}>
              {environment.isValid ? 'Environment valid' : 'Setup needed'}
            </StatusPill>
            <button
              type="button"
              onClick={() =>
                setIsDark((currentAppearance) => !currentAppearance)
              }
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
        <section
          className="grid gap-6 lg:grid-cols-5 lg:items-stretch"
          aria-labelledby="foundation-title"
        >
          <div className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8 lg:col-span-3 dark:bg-white dark:text-slate-950">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300 dark:text-slate-600">
              <span className="flex size-6 items-center justify-center rounded-full bg-emerald-400 text-slate-950">
                <CheckCircle2 className="size-4" aria-hidden="true" />
              </span>
              Phase Zero foundation
            </div>
            <h1
              id="foundation-title"
              className="mt-7 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              A safer place to build automation.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300 dark:text-slate-600">
              The platform’s contracts, storage, configuration checks, and API
              boundary are in place before any account, market, or trade can be
              touched.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/accounts"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 dark:bg-slate-950 dark:text-white"
              >
                Login with Deriv
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                to="/automation"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-white dark:border-slate-300 dark:text-slate-950"
              >
                Safety console
              </Link>
              <Link
                to="/analysis"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-white dark:border-slate-300 dark:text-slate-950"
              >
                Analyze markets
              </Link>
              <Link
                to="/bots"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-white dark:border-slate-300 dark:text-slate-950"
              >
                Bot console
              </Link>
            </div>
          </div>

          <aside
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900"
            aria-label="Launch readiness"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Launch readiness</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Foundation controls at a glance
                </p>
              </div>
              <Gauge
                className="size-5 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
            </div>
            <div className="mt-7 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-950">
                <p className="text-2xl font-semibold text-emerald-700 dark:text-emerald-300">
                  3
                </p>
                <p className="mt-1 text-xs font-medium text-emerald-800 dark:text-emerald-200">
                  Core layers
                </p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3 dark:bg-slate-800">
                <p className="text-2xl font-semibold">6</p>
                <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                  Contracts
                </p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-3 dark:bg-amber-950">
                <p className="text-2xl font-semibold text-amber-700 dark:text-amber-300">
                  1
                </p>
                <p className="mt-1 text-xs font-medium text-amber-800 dark:text-amber-200">
                  Setup item
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
              <ShieldCheck
                className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
              <p className="text-sm leading-5 text-slate-600 dark:text-slate-300">
                Secrets remain outside the repository and are validated on
                startup.
              </p>
            </div>
          </aside>
        </section>

        <section
          className="mt-8 grid gap-4 md:grid-cols-3"
          aria-label="Foundation capabilities"
        >
          {foundationItems.map((item) => {
            const Icon = item.icon

            return (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <StatusPill tone={item.tone}>{item.status}</StatusPill>
                </div>
                <h2 className="mt-5 font-semibold tracking-tight">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {item.description}
                </p>
              </article>
            )
          })}
        </section>

        <section
          id="environment"
          className="mt-8 grid gap-6 lg:grid-cols-5"
          aria-labelledby="environment-title"
        >
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  Configuration gate
                </p>
                <h2
                  id="environment-title"
                  className="mt-2 text-2xl font-semibold tracking-tight"
                >
                  {environment.isValid
                    ? 'Your public environment is ready.'
                    : 'One secure setup step remains.'}
                </h2>
              </div>
              {environment.isValid ? (
                <CheckCircle2
                  className="size-6 shrink-0 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
              ) : (
                <CircleAlert
                  className="size-6 shrink-0 text-amber-600 dark:text-amber-400"
                  aria-hidden="true"
                />
              )}
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {environment.isValid
                ? 'The API URL and Deriv App ID pass client-side validation. Server startup performs its own independent validation before any future connection workflow can run.'
                : 'Add your assigned Deriv App ID to VITE_DERIV_APP_ID in the frontend environment file. The application presents this state safely instead of attempting an incomplete login flow.'}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Wifi
                    className="size-4 text-emerald-600 dark:text-emerald-400"
                    aria-hidden="true"
                  />
                  API endpoint
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Validated as a URL before the UI can use it.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Wallet
                    className="size-4 text-amber-600 dark:text-amber-400"
                    aria-hidden="true"
                  />
                  Deriv App ID
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Required for Phase One OAuth; never substituted with a
                  password.
                </p>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-semibold">What comes next</p>
            <ol className="mt-5 space-y-4">
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950">
                  1
                </span>
                <div>
                  <p className="text-sm font-semibold">
                    Authorize a Deriv account
                  </p>
                  <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">
                    OAuth redirect and account discovery begin in Phase One.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold dark:bg-slate-800">
                  2
                </span>
                <div>
                  <p className="text-sm font-semibold">Connect market data</p>
                  <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">
                    Ticks, reconnection, and account-bound state are added
                    before automation.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold dark:bg-slate-800">
                  3
                </span>
                <div>
                  <p className="text-sm font-semibold">
                    Apply the safety layer
                  </p>
                  <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">
                    Valid trade previews, sessions, and limits are completed
                    before any Start action.
                  </p>
                </div>
              </li>
            </ol>
          </aside>
        </section>

        <section
          className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900"
          aria-labelledby="workspace-title"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Application shell preview
              </p>
              <h2
                id="workspace-title"
                className="mt-2 text-2xl font-semibold tracking-tight"
              >
                {activeSection} workspace
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
              This responsive shell establishes the visual language for the
              authenticated product without presenting simulated prices, account
              balances, or trading controls as live data.
            </p>
          </div>
          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl bg-slate-100 p-5 dark:bg-slate-800">
              <Bot
                className="size-5 text-slate-950 dark:text-white"
                aria-hidden="true"
              />
              <p className="mt-8 text-sm font-semibold">No active sessions</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Sessions become available only after authorization, contract
                validation, and risk safeguards are implemented.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-5 dark:bg-slate-800">
              <Activity
                className="size-5 text-slate-950 dark:text-white"
                aria-hidden="true"
              />
              <p className="mt-8 text-sm font-semibold">Activity is quiet</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                The activity log schema is ready; no account event or market
                data has been recorded.
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-5 dark:bg-amber-950">
              <ShieldCheck
                className="size-5 text-amber-700 dark:text-amber-300"
                aria-hidden="true"
              />
              <p className="mt-8 text-sm font-semibold text-amber-950 dark:text-amber-100">
                Risk first
              </p>
              <p className="mt-2 text-sm leading-6 text-amber-900 dark:text-amber-200">
                Automated trading can lose money. The product will require
                explicit real-account disclosure before any future automation
                session.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
