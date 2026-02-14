import { LayoutDashboard, Search, Sun, Moon, Calendar } from 'lucide-react'
import type { Theme } from '../types'

export interface DashboardHeaderProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  dateFrom: string
  dateTo: string
  onDateFromChange: (value: string) => void
  onDateToChange: (value: string) => void
  theme: Theme
  onThemeChange: (theme: Theme) => void
  globalSatisfaction: number
  globalSatisfactionColor: string
  isDark: boolean
}

export function DashboardHeader({
  searchTerm,
  onSearchChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  theme,
  onThemeChange,
  globalSatisfaction,
  globalSatisfactionColor,
  isDark,
}: DashboardHeaderProps) {
  return (
    <header
      className={
        isDark
          ? 'border-b border-slate-800 bg-slate-950/80 px-4 py-3 backdrop-blur'
          : 'border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur'
      }
    >
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-2 md:hidden">
          <button
            className={
              isDark
                ? 'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-200'
                : 'inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700'
            }
          >
            <LayoutDashboard className="h-4 w-4" />
          </button>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              ACMELogistics
            </div>
            <div className="text-sm font-semibold text-slate-900">AI Freight Brokerage</div>
          </div>
        </div>

        <div className="relative flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search by MC, city, sentiment, outcome…"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={
              isDark
                ? 'h-9 w-full rounded-xl border border-slate-700 bg-slate-900 pl-9 pr-3 text-xs text-slate-100 placeholder:text-slate-500 outline-none ring-emerald-500/40 focus:border-emerald-500 focus:ring-1'
                : 'h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none ring-emerald-300 focus:border-emerald-400 focus:ring-1'
            }
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Calendar className={'h-4 w-4 shrink-0 ' + (isDark ? 'text-slate-400' : 'text-slate-500')} aria-hidden />
            <input
              type="date"
              aria-label="Fecha inicial"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className={
                isDark
                  ? 'h-9 rounded-xl border border-slate-700 bg-slate-900 px-2.5 text-xs text-slate-100 outline-none ring-emerald-500/40 focus:border-emerald-500 focus:ring-1 [color-scheme:dark]'
                  : 'h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-900 outline-none ring-emerald-300 focus:border-emerald-400 focus:ring-1'
              }
            />
          </div>
          <span className={'text-xs ' + (isDark ? 'text-slate-500' : 'text-slate-400')}>–</span>
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              aria-label="Fecha final"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              min={dateFrom || undefined}
              className={
                isDark
                  ? 'h-9 rounded-xl border border-slate-700 bg-slate-900 px-2.5 text-xs text-slate-100 outline-none ring-emerald-500/40 focus:border-emerald-500 focus:ring-1 [color-scheme:dark]'
                  : 'h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-900 outline-none ring-emerald-300 focus:border-emerald-400 focus:ring-1'
              }
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => {
                onDateFromChange('')
                onDateToChange('')
              }}
              className={
                isDark
                  ? 'rounded-lg px-2 py-1 text-[11px] text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  : 'rounded-lg px-2 py-1 text-[11px] text-slate-500 hover:bg-slate-200 hover:text-slate-800'
              }
            >
              Clear dates
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
            className={
              isDark
                ? 'flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-100'
                : 'flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700'
            }
          >
            <span className="relative inline-flex h-5 w-9 items-center rounded-full bg-slate-200">
              <span
                className={
                  'absolute h-4 w-4 rounded-full bg-white shadow transition-transform ' + (isDark ? 'translate-x-4' : 'translate-x-1')
                }
              />
            </span>
            <span className="flex items-center gap-1">
              <Sun className={'h-3 w-3 ' + (isDark ? 'text-slate-500' : 'text-amber-400')} />
              <Moon className={'h-3 w-3 ' + (isDark ? 'text-sky-300' : 'text-slate-400')} />
            </span>
          </button>

          <div className="hidden sm:flex flex-col items-end">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Global Satisfaction
              <span className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200">
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-rose-400 via-sky-400 to-emerald-500"
                  style={{ width: `${(globalSatisfaction / 10) * 100}%` }}
                />
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={['text-2xl font-semibold tabular-nums', globalSatisfactionColor].join(' ')}>
                {globalSatisfaction.toFixed(1)}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-slate-400">/ 10</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
