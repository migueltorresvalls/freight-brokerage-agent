import { Truck, LayoutDashboard, LogOut } from 'lucide-react'
import type { AppView } from '../types'

export interface SidebarProps {
  view: AppView
  onNavigate: (view: AppView) => void
  onLogout: () => void
  isDark: boolean
}

export function Sidebar({ view, onNavigate, onLogout, isDark }: SidebarProps) {
  return (
    <aside
      className={
        isDark
          ? 'hidden w-64 flex-shrink-0 flex-col border-r border-slate-800 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-4 py-5 md:flex'
          : 'hidden w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-gradient-to-b from-white via-slate-50 to-slate-100 px-4 py-5 md:flex'
      }
    >
      <div className="flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 ring-1 ring-emerald-300">
          <Truck className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <div className={'text-xs font-semibold uppercase tracking-[0.18em] ' + (isDark ? 'text-slate-400' : 'text-slate-600')}>
            ACMELogistics
          </div>
          <div className={'text-sm font-semibold ' + (isDark ? 'text-slate-100' : 'text-slate-900')}>
            AI Freight Brokerage
          </div>
        </div>
      </div>

      <nav className="mt-6 space-y-1 text-sm">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className={
            view === 'dashboard'
              ? isDark
                ? 'flex w-full items-center gap-2 rounded-lg bg-emerald-900/40 px-3 py-2 text-emerald-200 ring-1 ring-emerald-500/50'
                : 'flex w-full items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-700 ring-1 ring-emerald-200'
              : isDark
                ? 'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                : 'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Brokerage Overview</span>
        </button>
        <button
          type="button"
          onClick={onLogout}
          className={
            isDark
              ? 'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-rose-400'
              : 'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 hover:text-rose-600'
          }
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </button>
      </nav>

      <div className={'mt-auto space-y-3 px-2 text-xs ' + (isDark ? 'text-slate-400' : 'text-slate-500')}>
        <div
          className={
            isDark
              ? 'rounded-xl border border-emerald-500/40 bg-emerald-900/40 px-3 py-3'
              : 'rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3'
          }
        >
          <div className={isDark ? 'text-[10px] font-medium uppercase tracking-wide text-emerald-300' : 'text-[10px] font-medium uppercase tracking-wide text-emerald-700'}>
            AI Broker Network
          </div>
          <div className={isDark ? 'mt-1 text-xs text-slate-200' : 'mt-1 text-xs text-slate-700'}>
            Optimizing lanes, rates, and service levels in real-time.
          </div>
        </div>
        <div className="text-[10px] text-slate-500">v1.0 • Internal Preview</div>
      </div>
    </aside>
  )
}
