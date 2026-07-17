import { Check, CircleAlert, Clock3 } from 'lucide-react'
import type { ReactNode } from 'react'

type StatusTone = 'ready' | 'attention' | 'planned'

type StatusPillProps = Readonly<{
  tone: StatusTone
  children: ReactNode
}>

const toneStyles: Record<StatusTone, string> = {
  ready:
    'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-400/20',
  attention:
    'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-400/20',
  planned:
    'bg-slate-100 text-slate-700 ring-slate-600/10 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-400/20'
}

const toneIcons = {
  ready: Check,
  attention: CircleAlert,
  planned: Clock3
} satisfies Record<StatusTone, typeof Check>

export function StatusPill({ tone, children }: StatusPillProps) {
  const Icon = toneIcons[tone]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${toneStyles[tone]}`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {children}
    </span>
  )
}
