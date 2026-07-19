import {
  ExternalLink,
  Moon,
  Palette,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  Volume2,
  VolumeX,
  WalletCards
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppearance } from '../../../shared/hooks/useAppearance'
import { useSoundPreference } from '../../../shared/hooks/useSoundPreference'

export function SettingsPage() {
  const { isDark, setIsDark } = useAppearance()
  const { isSoundEnabled, setIsSoundEnabled } = useSoundPreference()

  return (
    <main className="w-full px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8 dark:bg-white dark:text-slate-950">
        <p className="flex items-center gap-2 text-sm font-bold text-emerald-300 dark:text-emerald-700">
          <SlidersHorizontal className="size-4" aria-hidden="true" /> Workspace
          preferences
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
          Keep account access, defaults, and notifications deliberate.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 dark:text-slate-600">
          Preferences are local to this browser. Account access and disconnect
          controls remain protected by your Deriv authorization.
        </p>
      </section>
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <Palette
            className="size-5 text-emerald-700 dark:text-emerald-300"
            aria-hidden="true"
          />
          <h2 className="mt-4 text-xl font-semibold">Appearance</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Choose a comfortable workspace appearance. The selection applies
            across the authenticated product.
          </p>
          <button
            type="button"
            onClick={() => setIsDark((value) => !value)}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold dark:border-slate-700"
          >
            {isDark ? (
              <Sun className="size-4" aria-hidden="true" />
            ) : (
              <Moon className="size-4" aria-hidden="true" />
            )}
            {isDark ? 'Use light appearance' : 'Use dark appearance'}
          </button>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <Volume2
            className="size-5 text-emerald-700 dark:text-emerald-300"
            aria-hidden="true"
          />
          <h2 className="mt-4 text-xl font-semibold">Sound preference</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Set whether future interface notifications may use sound. Trading
            decisions never depend on this preference.
          </p>
          <button
            type="button"
            onClick={() => setIsSoundEnabled((value) => !value)}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold dark:border-slate-700"
          >
            {isSoundEnabled ? (
              <VolumeX className="size-4" aria-hidden="true" />
            ) : (
              <Volume2 className="size-4" aria-hidden="true" />
            )}
            {isSoundEnabled ? 'Mute interface sound' : 'Enable interface sound'}
          </button>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <WalletCards
            className="size-5 text-emerald-700 dark:text-emerald-300"
            aria-hidden="true"
          />
          <h2 className="mt-4 text-xl font-semibold">Accounts and defaults</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Select, refresh, disconnect, or log out of authorized Deriv
            accounts. Configure account-level risk before any bot defaults.
          </p>
          <Link
            to="/accounts"
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold dark:border-slate-700"
          >
            Manage accounts{' '}
            <ExternalLink className="size-4" aria-hidden="true" />
          </Link>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <ShieldCheck
            className="size-5 text-emerald-700 dark:text-emerald-300"
            aria-hidden="true"
          />
          <h2 className="mt-4 text-xl font-semibold">Safety and privacy</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Risk limits are account-scoped. Tokens remain server-side and the
            platform never requests a Deriv password.
          </p>
          <Link
            to="/risk"
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold dark:border-slate-700"
          >
            Review risk controls{' '}
            <ExternalLink className="size-4" aria-hidden="true" />
          </Link>
        </article>
      </section>
    </main>
  )
}
