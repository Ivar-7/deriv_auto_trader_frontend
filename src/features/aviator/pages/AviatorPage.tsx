import { ArrowRight, Plane, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'

export function AviatorPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <section className="w-full rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center sm:p-12 dark:border-amber-900 dark:bg-amber-950">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
          <Plane className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-200">
          <ShieldAlert className="size-4" aria-hidden="true" /> Automation
          unavailable
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Aviator automation is not available.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-amber-950 dark:text-amber-100">
          This product does not offer Aviator automation. No unavailable
          strategy is simulated, suggested, or silently substituted.
        </p>
        <Link
          to="/dashboard"
          className="mt-7 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white dark:bg-white dark:text-slate-950"
        >
          Return to Dashboard{' '}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>
    </main>
  )
}
