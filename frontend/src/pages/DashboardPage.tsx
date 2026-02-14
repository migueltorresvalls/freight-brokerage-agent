import { ArrowRightLeft } from 'lucide-react'
import type { Call, NegotiationBucket, NegotiationBucketKey, TopCustomer, ViewMode } from '../types'
import { formatCurrency } from '../lib/calls'
import { CallsMap, CallsView } from '../components'

const DONUT_COLORS = ['#22c55e', '#10b981', '#0ea5e9', '#6366f1', '#8b5cf6'] as const

export interface DashboardPageProps {
  filteredCalls: Call[]
  selectedLocation: string | null
  onSelectLocation: (location: string | null) => void
  negotiationBuckets: NegotiationBucket[]
  totalNegotiationCount: number
  negotiationBucketFilter: NegotiationBucketKey | 'all'
  onNegotiationBucketFilterChange: (filter: NegotiationBucketKey | 'all') => void
  topCustomers: TopCustomer[]
  customerFilter: string
  onCustomerFilterChange: (mc: string) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  page: number
  onPageChange: (page: number) => void
  rowsPerPage: number
  onRowsPerPageChange: (rows: number) => void
  onSelectCall: (call: Call) => void
  isDark: boolean
}

export function DashboardPage({
  filteredCalls,
  selectedLocation,
  onSelectLocation,
  negotiationBuckets,
  totalNegotiationCount,
  negotiationBucketFilter,
  onNegotiationBucketFilterChange,
  topCustomers,
  customerFilter,
  onCustomerFilterChange,
  viewMode,
  onViewModeChange,
  page,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
  onSelectCall,
  isDark,
}: DashboardPageProps) {
  return (
    <main
      className={
        isDark
          ? 'flex-1 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-4 pb-6 pt-4'
          : 'flex-1 bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 px-4 pb-6 pt-4'
      }
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <section className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-8">
            <CallsMap
              calls={filteredCalls}
              selectedLocation={selectedLocation}
              onSelectLocation={(loc) => {
                onSelectLocation(loc)
                onPageChange(0)
              }}
              isDark={isDark}
            />
          </div>

          <div className="md:col-span-4">
            <div
              className={
                isDark
                  ? 'rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-sm'
                  : 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'
              }
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className={'flex items-center gap-2 text-xs font-medium uppercase tracking-wide ' + (isDark ? 'text-slate-200' : 'text-slate-500')}>
                    <ArrowRightLeft className={'h-4 w-4 ' + (isDark ? 'text-indigo-400' : 'text-indigo-500')} />
                    Negotiation Distribution
                  </div>
                  <div className={'text-xs ' + (isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Uplift vs loadboard benchmark by call.
                  </div>
                </div>
                {negotiationBucketFilter !== 'all' && (
                  <button
                    onClick={() => onNegotiationBucketFilterChange('all')}
                    className={
                      'rounded-full px-2.5 py-0.5 text-[11px] ' +
                      (isDark
                        ? 'border border-slate-700 bg-slate-900 text-slate-100 hover:border-emerald-400 hover:text-emerald-300'
                        : 'border border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-400 hover:text-emerald-600')
                    }
                  >
                    Clear uplift filter
                  </button>
                )}
              </div>

              <div className="mt-4 flex items-center gap-4">
                <svg
                  key={`donut-${totalNegotiationCount}-${negotiationBuckets.map((b) => `${b.key}:${b.count}`).join(',')}`}
                  width={160}
                  height={160}
                  viewBox="0 0 160 160"
                  className="shrink-0"
                >
                  {totalNegotiationCount === 0 ? (
                    <circle
                      cx={80}
                      cy={80}
                      r={70}
                      fill={isDark ? '#020617' : '#f3f4f6'}
                      stroke={isDark ? '#1f2937' : '#e5e7eb'}
                      strokeWidth={1}
                    />
                  ) : (
                    (() => {
                      const radiusOuter = 70
                      const radiusInner = 38
                      const center = 80
                      const fullCircle = Math.PI * 2
                      const epsilon = 1e-6
                      let currentAngle = -Math.PI / 2
                      return negotiationBuckets.map((bucket, index) => {
                        if (bucket.count === 0) return null
                        const sliceAngle = (bucket.count / totalNegotiationCount) * fullCircle
                        const startAngle = currentAngle
                        const endAngle = currentAngle + sliceAngle
                        currentAngle = endAngle
                        const color = DONUT_COLORS[index % DONUT_COLORS.length]
                        const largeArcFlag = sliceAngle > Math.PI ? 1 : 0
                        const x1Outer = center + radiusOuter * Math.cos(startAngle)
                        const y1Outer = center + radiusOuter * Math.sin(startAngle)
                        const x2Outer = center + radiusOuter * Math.cos(endAngle)
                        const y2Outer = center + radiusOuter * Math.sin(endAngle)
                        const x1Inner = center + radiusInner * Math.cos(endAngle)
                        const y1Inner = center + radiusInner * Math.sin(endAngle)
                        const x2Inner = center + radiusInner * Math.cos(startAngle)
                        const y2Inner = center + radiusInner * Math.sin(startAngle)
                        let d: string
                        if (sliceAngle >= fullCircle - epsilon) {
                          const midAngle = startAngle + Math.PI
                          const xMidOuter = center + radiusOuter * Math.cos(midAngle)
                          const yMidOuter = center + radiusOuter * Math.sin(midAngle)
                          const xMidInner = center + radiusInner * Math.cos(midAngle)
                          const yMidInner = center + radiusInner * Math.sin(midAngle)
                          d = [
                            `M ${x1Outer} ${y1Outer}`,
                            `A ${radiusOuter} ${radiusOuter} 0 1 1 ${xMidOuter} ${yMidOuter}`,
                            `A ${radiusOuter} ${radiusOuter} 0 1 1 ${x1Outer} ${y1Outer}`,
                            `L ${x2Inner} ${y2Inner}`,
                            `A ${radiusInner} ${radiusInner} 0 1 0 ${xMidInner} ${yMidInner}`,
                            `A ${radiusInner} ${radiusInner} 0 1 0 ${x2Inner} ${y2Inner}`,
                            'Z',
                          ].join(' ')
                        } else {
                          d = [
                            `M ${x1Outer} ${y1Outer}`,
                            `A ${radiusOuter} ${radiusOuter} 0 ${largeArcFlag} 1 ${x2Outer} ${y2Outer}`,
                            `L ${x1Inner} ${y1Inner}`,
                            `A ${radiusInner} ${radiusInner} 0 ${largeArcFlag} 0 ${x2Inner} ${y2Inner}`,
                            'Z',
                          ].join(' ')
                        }
                        const isActive = negotiationBucketFilter === bucket.key
                        return (
                          <path
                            key={bucket.key}
                            d={d}
                            fill={color}
                            fillOpacity={isActive ? 0.95 : 0.75}
                            stroke={isActive ? (isDark ? '#0b1120' : '#111827') : isDark ? '#020617' : '#ffffff'}
                            strokeWidth={isActive ? 2 : 1}
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                              onNegotiationBucketFilterChange(negotiationBucketFilter === bucket.key ? 'all' : bucket.key)
                            }
                          />
                        )
                      })
                    })()
                  )}
                </svg>

                <div className="flex-1 space-y-2 text-xs">
                  {negotiationBuckets.map((bucket, index) => {
                    const color = DONUT_COLORS[index % DONUT_COLORS.length]
                    const isActive = negotiationBucketFilter === bucket.key
                    return (
                      <button
                        key={bucket.key}
                        onClick={() =>
                          onNegotiationBucketFilterChange(negotiationBucketFilter === bucket.key ? 'all' : bucket.key)
                        }
                        className={[
                          'flex w-full items-center justify-between rounded-lg border px-2.5 py-1.5 text-left transition',
                          isActive
                            ? isDark
                              ? 'border-emerald-400 bg-emerald-900/40 text-emerald-100'
                              : 'border-emerald-400 bg-emerald-50/80 text-emerald-900'
                            : isDark
                              ? 'border-slate-700 bg-slate-900 text-slate-100 hover:border-emerald-400 hover:bg-emerald-900/40'
                              : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/70',
                        ].join(' ')}
                      >
                        <span className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                          <span className="text-[11px] font-medium">{bucket.label}</span>
                        </span>
                        <span className="text-[11px] text-slate-500">{bucket.count} calls</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className={'mt-4 border-t pt-3 ' + (isDark ? 'border-slate-700' : 'border-slate-100')}>
                <div className="flex items-center justify-between gap-2">
                  <div className={'text-[11px] font-medium uppercase tracking-wide ' + (isDark ? 'text-slate-200' : 'text-slate-500')}>
                    Top Customers
                  </div>
                  {customerFilter !== 'all' && (
                    <button
                      onClick={() => onCustomerFilterChange('all')}
                      className={'text-[11px] hover:underline ' + (isDark ? 'text-emerald-300' : 'text-emerald-700')}
                    >
                      Clear customer filter
                    </button>
                  )}
                </div>
                <div className="mt-2 space-y-1">
                  {topCustomers.map((c) => {
                    const isActive = customerFilter === c.mc_number
                    return (
                      <button
                        key={c.mc_number}
                        onClick={() => onCustomerFilterChange(isActive ? 'all' : c.mc_number)}
                        className={[
                          'flex w-full items-center justify-between rounded-lg border px-2.5 py-1.5 text-left text-[11px]',
                          isActive
                            ? isDark
                              ? 'border-indigo-400 bg-indigo-900/40 text-indigo-100'
                              : 'border-indigo-400 bg-indigo-50 text-indigo-900'
                            : isDark
                              ? 'border-slate-700 bg-slate-900 text-slate-100 hover:border-indigo-400 hover:bg-indigo-900/40'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/70',
                        ].join(' ')}
                      >
                        <span className="flex items-center gap-2">
                          <span className="font-mono text-xs">{c.mc_number}</span>
                          <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] text-slate-500">
                            {c.callCount} calls
                          </span>
                        </span>
                        <span className={'text-[10px] ' + (isDark ? 'text-slate-300' : 'text-slate-500')}>
                          {formatCurrency(c.totalAgreedRate)}
                        </span>
                      </button>
                    )
                  })}
                  {topCustomers.length === 0 && (
                    <div className={'text-[11px] ' + (isDark ? 'text-slate-500' : 'text-slate-400')}>No customers yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <CallsView
            calls={filteredCalls}
            viewMode={viewMode}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange}
            onRowsPerPageChange={(rows) => {
              onRowsPerPageChange(rows)
              onPageChange(0)
            }}
            onSelectCall={onSelectCall}
            onViewModeChange={(mode) => {
              onViewModeChange(mode)
              onPageChange(0)
            }}
            isDark={isDark}
          />
        </section>
      </div>
    </main>
  )
}
