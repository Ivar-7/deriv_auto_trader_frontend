import { CircleAlert } from 'lucide-react'

export function RouteErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <CircleAlert
          className="mx-auto size-8 text-amber-600 dark:text-amber-400"
          aria-hidden="true"
        />
        <h1 className="mt-4 text-xl font-semibold tracking-tight">
          Unable to open this view
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Return to the foundation dashboard and try again. No account or
          trading state was changed.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950"
        >
          Return to overview
        </a>
      </section>
    </main>
  )
}
