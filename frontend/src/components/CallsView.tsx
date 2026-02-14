import {
  PhoneCall,
  Truck,
  Table,
  Grid3X3,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { Call, ViewMode } from '../types'
import {
  formatCurrency,
  formatPercent,
  sentimentColor,
  negotiationDeltaPercent,
} from '../lib/calls'

export interface CallsViewProps {
  calls: Call[]
  viewMode: ViewMode
  page: number
  rowsPerPage: number
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rows: number) => void
  onSelectCall: (call: Call) => void
  onViewModeChange: (mode: ViewMode) => void
  isDark: boolean
}

export function CallsView({
  calls,
  viewMode,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onSelectCall,
  onViewModeChange,
  isDark,
}: CallsViewProps) {
  const totalPages = Math.max(1, Math.ceil(calls.length / rowsPerPage))
  const clampedPage = Math.min(page, totalPages - 1)
  const start = clampedPage * rowsPerPage
  const pageData = calls.slice(start, start + rowsPerPage)

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 0 || nextPage >= totalPages) return
    onPageChange(nextPage)
  }

  return (
    <div
      className={
        'mt-6 rounded-2xl border ' +
        (isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white')
      }
    >
      <div
        className={
          'flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 ' +
          (isDark ? 'border-slate-800' : 'border-slate-200')
        }
      >
        <div
          className={
            'flex items-center gap-2 text-xs font-medium uppercase tracking-wide ' +
            (isDark ? 'text-slate-200' : 'text-slate-600')
          }
        >
          <PhoneCall className={'h-4 w-4 ' + (isDark ? 'text-emerald-400' : 'text-emerald-500')} />
          AI Broker Calls
          <span
            className={
              'rounded-full px-2 py-0.5 text-[10px] ' +
              (isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600')
            }
          >
            {calls.length} total
          </span>
        </div>
        <div className={'flex items-center gap-2 text-xs ' + (isDark ? 'text-slate-400' : 'text-slate-500')}>
          <span className="hidden sm:inline">View</span>
          <button
            onClick={() => {
              onViewModeChange('grid')
              onPageChange(0)
            }}
            className={[
              'inline-flex items-center gap-1 rounded-full border px-2 py-1',
              viewMode === 'grid'
                ? isDark
                  ? 'border-emerald-400 bg-emerald-900/40 text-emerald-100'
                  : 'border-emerald-400 bg-emerald-50 text-emerald-700'
                : isDark
                  ? 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300',
            ].join(' ')}
          >
            <Grid3X3 className="h-3 w-3" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            onClick={() => {
              onViewModeChange('list')
              onPageChange(0)
            }}
            className={[
              'inline-flex items-center gap-1 rounded-full border px-2 py-1',
              viewMode === 'list'
                ? isDark
                  ? 'border-emerald-400 bg-emerald-900/40 text-emerald-100'
                  : 'border-emerald-400 bg-emerald-50 text-emerald-700'
                : isDark
                  ? 'border-slate-700 bg-slate-900 text-slate-200 hover:border-slate-500'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300',
            ].join(' ')}
          >
            <Table className="h-3 w-3" />
            <span className="hidden sm:inline">Table</span>
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid gap-4 px-4 py-4 md:grid-cols-2 xl:grid-cols-3">
          {pageData.map((call) => {
            const delta = negotiationDeltaPercent(call)
            return (
              <button
                key={call.call_id}
                onClick={() => onSelectCall(call)}
                className={
                  'group flex flex-col items-stretch rounded-xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 ' +
                  (isDark
                    ? 'border-slate-700 bg-slate-900 hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-900/40'
                    : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-100')
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className={'flex items-center gap-2 text-xs ' + (isDark ? 'text-slate-400' : 'text-slate-500')}>
                      <span className={'font-mono text-[11px] ' + (isDark ? 'text-slate-500' : 'text-slate-400')}>
                        #{call.call_id.toString().padStart(3, '0')}
                      </span>
                      {call.mc_number && (
                        <span
                          className={
                            'rounded-full px-2 py-0.5 text-[10px] ' +
                            (isDark ? 'bg-slate-800 text-slate-100' : 'bg-slate-100 text-slate-700')
                          }
                        >
                          MC {call.mc_number}
                        </span>
                      )}
                    </div>
                    <div className={'flex items-center gap-1 text-sm font-semibold ' + (isDark ? 'text-slate-50' : 'text-slate-900')}>
                      <span>{call.origin ?? 'Unknown origin'}</span>
                      <ArrowRightLeft className={'h-3 w-3 ' + (isDark ? 'text-slate-500' : 'text-slate-400')} />
                      <span>{call.destination ?? 'Unknown destination'}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium ${
                          call.outcome === 'successful'
                            ? isDark
                              ? 'bg-emerald-900/40 text-emerald-100 border border-emerald-500/60'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isDark
                              ? 'bg-rose-900/40 text-rose-100 border border-rose-500/60'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {call.outcome === 'successful' ? 'Successful' : 'Unsuccessful'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div
                      className={[
                        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize',
                        sentimentColor(call.sentiment),
                      ].join(' ')}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {call.sentiment}
                    </div>
                  </div>
                </div>
                <div className={'mt-3 grid grid-cols-3 gap-2 text-xs ' + (isDark ? 'text-slate-200' : 'text-slate-600')}>
                  <div className={'rounded-lg px-3 py-2 ' + (isDark ? 'bg-slate-800' : 'bg-slate-50')}>
                    <div className={'text-[10px] uppercase tracking-wide ' + (isDark ? 'text-slate-400' : 'text-slate-400')}>Agreed</div>
                    <div className={'font-semibold ' + (isDark ? 'text-slate-50' : 'text-slate-900')}>
                      {formatCurrency(call.agreed_rate)}
                    </div>
                  </div>
                  <div className={'rounded-lg px-3 py-2 ' + (isDark ? 'bg-slate-800' : 'bg-slate-50')}>
                    <div className={'text-[10px] uppercase tracking-wide ' + (isDark ? 'text-slate-400' : 'text-slate-400')}>Loadboard</div>
                    <div className={'font-semibold ' + (isDark ? 'text-slate-50' : 'text-slate-900')}>
                      {formatCurrency(call.loadboard_rate ?? null)}
                    </div>
                  </div>
                  <div className={'rounded-lg px-3 py-2 ' + (isDark ? 'bg-slate-800' : 'bg-slate-50')}>
                    <div className={'text-[10px] uppercase tracking-wide ' + (isDark ? 'text-slate-400' : 'text-slate-400')}>Uplift</div>
                    <div className={'font-semibold ' + (isDark ? 'text-emerald-400' : 'text-emerald-600')}>
                      {formatPercent(delta, 1)}
                    </div>
                  </div>
                </div>
                <div className={'mt-3 flex items-center justify-between text-[11px] ' + (isDark ? 'text-slate-400' : 'text-slate-500')}>
                  <span>{call.call_datetime}</span>
                  <span className="flex items-center gap-1">
                    <Truck className={'h-3 w-3 ' + (isDark ? 'text-emerald-400' : 'text-emerald-500')} />
                    {call.miles ? `${call.miles.toLocaleString()} mi` : '–'}
                  </span>
                </div>
              </button>
            )
          })}
          {pageData.length === 0 && (
            <div className="col-span-full flex h-40 items-center justify-center text-sm text-slate-400">
              No calls for the current filters.
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className={'min-w-full divide-y text-sm ' + (isDark ? 'divide-slate-800' : 'divide-slate-200')}>
            <thead className={isDark ? 'bg-slate-900' : 'bg-slate-50'}>
              <tr>
                <th className={'px-4 py-2 text-left text-xs font-medium uppercase tracking-wide ' + (isDark ? 'text-slate-300' : 'text-slate-500')}>Call</th>
                <th className={'px-4 py-2 text-left text-xs font-medium uppercase tracking-wide ' + (isDark ? 'text-slate-300' : 'text-slate-500')}>Customer</th>
                <th className={'px-4 py-2 text-left text-xs font-medium uppercase tracking-wide ' + (isDark ? 'text-slate-300' : 'text-slate-500')}>Route</th>
                <th className={'px-4 py-2 text-right text-xs font-medium uppercase tracking-wide ' + (isDark ? 'text-slate-300' : 'text-slate-500')}>Agreed</th>
                <th className={'px-4 py-2 text-right text-xs font-medium uppercase tracking-wide ' + (isDark ? 'text-slate-300' : 'text-slate-500')}>Loadboard</th>
                <th className={'px-4 py-2 text-right text-xs font-medium uppercase tracking-wide ' + (isDark ? 'text-slate-300' : 'text-slate-500')}>Uplift</th>
                <th className={'px-4 py-2 text-right text-xs font-medium uppercase tracking-wide ' + (isDark ? 'text-slate-300' : 'text-slate-500')}>Miles</th>
              </tr>
            </thead>
            <tbody className={'divide-y ' + (isDark ? 'divide-slate-800 bg-slate-900' : 'divide-slate-100 bg-white')}>
              {pageData.map((call) => {
                const delta = negotiationDeltaPercent(call)
                return (
                  <tr
                    key={call.call_id}
                    onClick={() => onSelectCall(call)}
                    className={'cursor-pointer ' + (isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50')}
                  >
                    <td className={'whitespace-nowrap px-4 py-2 text-xs ' + (isDark ? 'text-slate-200' : 'text-slate-700')}>
                      <div className={'font-mono text-[11px] ' + (isDark ? 'text-slate-400' : 'text-slate-500')}>
                        #{call.call_id.toString().padStart(3, '0')}
                      </div>
                      <div className={'text-[11px] ' + (isDark ? 'text-slate-500' : 'text-slate-400')}>{call.call_datetime}</div>
                    </td>
                    <td className={'whitespace-nowrap px-4 py-2 text-xs ' + (isDark ? 'text-slate-200' : 'text-slate-700')}>
                      {call.mc_number ?? '—'}
                      <div className={['mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize', sentimentColor(call.sentiment)].join(' ')}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {call.sentiment}
                      </div>
                    </td>
                    <td className={'whitespace-nowrap px-4 py-2 text-xs ' + (isDark ? 'text-slate-200' : 'text-slate-700')}>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <span>{call.origin ?? '—'}</span>
                          <ArrowRightLeft className="h-3 w-3 text-slate-500" />
                          <span>{call.destination ?? '—'}</span>
                        </div>
                        <span
                          className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            call.outcome === 'successful' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {call.outcome === 'successful' ? 'Successful' : 'Unsuccessful'}
                        </span>
                      </div>
                    </td>
                    <td className={'whitespace-nowrap px-4 py-2 text-right text-xs ' + (isDark ? 'text-slate-200' : 'text-slate-700')}>
                      {formatCurrency(call.agreed_rate)}
                    </td>
                    <td className={'whitespace-nowrap px-4 py-2 text-right text-xs ' + (isDark ? 'text-slate-200' : 'text-slate-700')}>
                      {formatCurrency(call.loadboard_rate ?? null)}
                    </td>
                    <td className={'whitespace-nowrap px-4 py-2 text-right text-xs font-semibold ' + (isDark ? 'text-emerald-400' : 'text-emerald-600')}>
                      {formatPercent(delta, 1)}
                    </td>
                    <td className={'whitespace-nowrap px-4 py-2 text-right text-xs ' + (isDark ? 'text-slate-200' : 'text-slate-700')}>
                      {call.miles ? `${call.miles.toLocaleString()} mi` : '—'}
                    </td>
                  </tr>
                )
              })}
              {pageData.length === 0 && (
                <tr>
                  <td colSpan={7} className={'px-4 py-6 text-center text-sm ' + (isDark ? 'text-slate-400' : 'text-slate-500')}>
                    No calls for the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div
        className={
          'flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-xs ' +
          (isDark ? 'border-slate-800 bg-slate-900 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600')
        }
      >
        <div className="flex items-center gap-2">
          <span>
            Showing <span className={'font-medium ' + (isDark ? 'text-slate-50' : 'text-slate-900')}>{pageData.length === 0 ? 0 : start + 1}-{start + pageData.length}</span> of{' '}
            <span className={'font-medium ' + (isDark ? 'text-slate-50' : 'text-slate-900')}>{calls.length}</span> calls
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span>Rows per page</span>
            <select
              className={'rounded-md border px-2 py-1 text-xs ' + (isDark ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-slate-300 bg-white text-slate-800')}
              value={rowsPerPage}
              onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            >
              {[6, 9, 15, 21].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(clampedPage - 1)}
              disabled={clampedPage === 0}
              className={
                'inline-flex h-7 w-7 items-center justify-center rounded-md border text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 ' +
                (isDark ? 'border-slate-700 bg-slate-900 text-slate-200' : 'border-slate-300 bg-white text-slate-600')
              }
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <span className={'mx-1 text-xs ' + (isDark ? 'text-slate-300' : 'text-slate-600')}>
              Page <span className={'font-semibold ' + (isDark ? 'text-slate-50' : 'text-slate-900')}>{clampedPage + 1}</span> of{' '}
              <span className={'font-semibold ' + (isDark ? 'text-slate-50' : 'text-slate-900')}>{totalPages}</span>
            </span>
            <button
              onClick={() => handlePageChange(clampedPage + 1)}
              disabled={clampedPage >= totalPages - 1}
              className={
                'inline-flex h-7 w-7 items-center justify-center rounded-md border disabled:cursor-not-allowed disabled:opacity-40 ' +
                (isDark ? 'border-slate-700 bg-slate-900 text-slate-200' : 'border-slate-300 bg-white text-slate-600')
              }
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
