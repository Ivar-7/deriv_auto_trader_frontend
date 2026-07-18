import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  CircleAlert,
  Copy,
  Gauge,
  HelpCircle,
  Landmark,
  Menu,
  Moon,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  WalletCards,
  Zap
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { beginDerivLogin } from '../../accounts/api/accounts.api'
import { ApiError } from '../../../shared/api/httpClient'
import { useAppearance } from '../../../shared/hooks/useAppearance'

const capabilities = [
  {
    title: 'Trading bots',
    description:
      'Configure only supported Rise/Fall and digit-contract workflows with a visible validated preview.',
    icon: Bot
  },
  {
    title: 'Differs Scanner',
    description:
      'Compare observed digit deviation, confirmation, and market data state before opening a compatible bot.',
    icon: Zap
  },
  {
    title: 'Bulk Trader',
    description:
      'Run fixed-stake, sequential entries with active-contract and account-level limits.',
    icon: Landmark
  },
  {
    title: 'Copy Trading',
    description:
      'Copy only Deriv-accepted trades between your authorized accounts, with per-account caps.',
    icon: Copy
  },
  {
    title: 'Charts and analysis',
    description:
      'Read live Deriv market data, tick observations, streaks, and digit boards without pretending to predict.',
    icon: BarChart3
  },
  {
    title: 'Risk Calculator',
    description:
      'Keep combined loss, stake, active-contract limits, and Emergency Stop close to every workflow.',
    icon: ShieldCheck
  }
] as const

const faqs = [
  {
    question: 'Does this platform collect my Deriv password?',
    answer:
      'No. Authorization is through Deriv OAuth only. The platform never asks for or stores a Deriv password.'
  },
  {
    question: 'Do tick or digit statistics predict the next trade?',
    answer:
      'No. The workspace reports historical observations and normalized deviations. It does not promise or infer an independent future outcome.'
  },
  {
    question: 'What does Stop do?',
    answer:
      'Stop prevents new entries and cancels only unsubmitted bulk entries. It never sells an open contract unless Deriv explicitly supports that action.'
  },
  {
    question: 'Can I use a real account?',
    answer:
      'Yes, after selecting an authorized real account and explicitly accepting the risk disclosure before the first automation session.'
  }
] as const

export function LandingPage() {
  const { isDark, setIsDark } = useAppearance()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const login = async () => {
    setIsLoggingIn(true)
    setMessage(null)
    try {
      await beginDerivLogin()
    } catch (error: unknown) {
      setMessage(
        error instanceof ApiError
          ? error.message
          : 'Unable to start Deriv authorization.'
      )
      setIsLoggingIn(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-3"
            aria-label="Deriv Auto Trader home"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              <Zap className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-bold tracking-tight">
                Deriv Auto Trader
              </span>
              <span className="block text-xs text-slate-500 dark:text-slate-400">
                Control before automation
              </span>
            </span>
          </Link>
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Landing page navigation"
          >
            <a
              href="#products"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Products
            </a>
            <a
              href="#risk"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Risk
            </a>
            <a
              href="#faq"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsDark((value) => !value)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 dark:border-slate-700 dark:text-slate-300"
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
            <button
              type="button"
              onClick={() => void login()}
              disabled={isLoggingIn}
              className="hidden rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 sm:inline-flex dark:bg-white dark:text-slate-950"
            >
              {isLoggingIn ? 'Opening Deriv…' : 'Login with Deriv'}
            </button>
            <span className="sm:hidden">
              <Menu
                className="size-5 text-slate-600 dark:text-slate-300"
                aria-hidden="true"
              />
            </span>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-5 lg:items-center lg:px-8 lg:py-20">
          <div className="lg:col-span-3">
            <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
              <ShieldCheck className="size-4" aria-hidden="true" />{' '}
              Deriv-authorized access only
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Build automation with more visible control.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              A responsive Deriv workspace for observing markets, configuring
              supported bots, and enforcing practical limits. It never collects
              your Deriv password and never promises a result.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => void login()}
                disabled={isLoggingIn}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
              >
                <WalletCards className="size-4" aria-hidden="true" />{' '}
                {isLoggingIn ? 'Opening Deriv…' : 'Login with Deriv'}{' '}
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
              <a
                href="https://deriv.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 py-3 text-sm font-bold dark:border-slate-700"
              >
                Create Deriv Account{' '}
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </div>
            {message === null ? null : (
              <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
                {message}
              </p>
            )}
            <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Trading involves risk. Historical tick and digit observations are
              not predictions; no profit is guaranteed.
            </p>
          </div>
          <aside className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl lg:col-span-2 dark:bg-white dark:text-slate-950">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-emerald-300 dark:text-emerald-700">
                  Workspace status
                </p>
                <p className="mt-1 text-xl font-semibold">Ready when you are</p>
              </div>
              <Gauge className="size-6" aria-hidden="true" />
            </div>
            <dl className="mt-8 grid grid-cols-2 gap-3">
              <Metric label="Account access" value="OAuth only" />
              <Metric label="Controls" value="Risk first" />
              <Metric label="Markets" value="Live data" />
              <Metric label="Mobile" value="Responsive" />
            </dl>
            <div className="mt-6 rounded-2xl bg-white/10 p-4 dark:bg-slate-100">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Sparkles className="size-4" aria-hidden="true" /> Help, not
                signals
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300 dark:text-slate-600">
                The contextual assistant explains controls and states; it cannot
                trade, change settings, or predict an outcome.
              </p>
            </div>
          </aside>
        </section>

        <section
          id="products"
          className="border-y border-slate-200 bg-white py-14 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                One connected workspace
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Tools that keep context and limits close.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Every authenticated section shares your authorized accounts,
                connection state, balance, preferences, and visible safety
                controls.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((capability) => {
                const Icon = capability.icon
                return (
                  <article
                    key={capability.title}
                    className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700"
                  >
                    <span className="flex size-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 font-semibold">{capability.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {capability.description}
                    </p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <Smartphone
              className="size-6 text-emerald-700 dark:text-emerald-300"
              aria-hidden="true"
            />
            <h2 className="mt-5 text-2xl font-semibold tracking-tight">
              Made for a smaller screen too.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Navigation scrolls or collapses while account state, balance,
              connection, emergency controls, digit boards, tables, and risk
              notices remain accessible.
            </p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <CircleAlert
              className="size-6 text-amber-700 dark:text-amber-300"
              aria-hidden="true"
            />
            <h2 className="mt-5 text-2xl font-semibold tracking-tight">
              Real money needs an explicit pause.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              Before the first real-account automation session, you must accept
              a clear disclosure about losses, settings responsibility,
              martingale and bulk risk, and the absence of guarantees.
            </p>
          </article>
        </section>

        <section id="risk" className="bg-amber-50 py-14 dark:bg-amber-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-200">
                <CircleAlert className="size-4" aria-hidden="true" /> Risk
                disclosure
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                Automation can increase losses. It cannot remove them.
              </h2>
              <ul className="mt-6 space-y-3 text-sm leading-6 text-amber-950 dark:text-amber-100">
                <li className="flex gap-2">
                  <CheckCircle2
                    className="mt-1 size-4 shrink-0"
                    aria-hidden="true"
                  />{' '}
                  Trading may lose money; financial outcomes are not guaranteed.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2
                    className="mt-1 size-4 shrink-0"
                    aria-hidden="true"
                  />{' '}
                  Market observations, historical data, and previous results do
                  not predict independent future outcomes.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2
                    className="mt-1 size-4 shrink-0"
                    aria-hidden="true"
                  />{' '}
                  Martingale and bulk workflows can make losses larger.
                  Configure limits before starting.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section
          id="faq"
          className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8"
        >
          <p className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
            <HelpCircle className="size-4" aria-hidden="true" /> FAQ
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Clear answers before you connect.
          </h2>
          <div className="mt-8 space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <summary className="cursor-pointer font-semibold">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm sm:px-6 md:grid-cols-2 lg:px-8">
          <div>
            <p className="font-bold">Deriv Auto Trader</p>
            <p className="mt-2 max-w-md leading-6 text-slate-600 dark:text-slate-300">
              A Deriv-connected automation workspace with visible controls and
              account-level safety boundaries.
            </p>
          </div>
          <div className="md:text-right">
            <p className="font-semibold">Legal and contact</p>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Terms, Privacy, and Risk Disclosure are presented on this page.
              Contact: support@derivautotrader.example
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              This independent product is not a promise of results and does not
              use TradingView controls or branding.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Metric({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="rounded-2xl bg-white/10 p-3 dark:bg-slate-100">
      <dt className="text-xs text-slate-300 dark:text-slate-600">{label}</dt>
      <dd className="mt-1 text-sm font-bold">{value}</dd>
    </div>
  )
}
