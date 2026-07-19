export function RouteHydrateFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4 text-sm font-semibold text-slate-300">
        <span className="size-2 animate-pulse rounded-full bg-sky-400" />
        Preparing workspace
      </div>
    </main>
  )
}
