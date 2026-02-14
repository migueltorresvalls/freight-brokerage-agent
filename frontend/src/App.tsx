import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AuthState, AppView, Call, Theme, ViewMode, NegotiationBucketKey } from './types'
import type { CallsApiResponse } from './types'
import {
  loadAuthFromStorage,
  saveAuthToStorage,
  clearAuthFromStorage,
  AUTH_TOKEN_KEY,
} from './lib/auth'
import {
  getNegotiationBucketKey,
  negotiationDeltaPercent,
  sentimentScore,
  computeNegotiationBuckets,
  computeTopCustomers,
  parseCallDateTime,
} from './lib/calls'
import { Sidebar, DashboardHeader } from './layout'
import { LoginPage, DashboardPage } from './pages'
import { CallDetailModal } from './components'

function App() {
  const [auth, setAuth] = useState<AuthState | null>(loadAuthFromStorage)
  const [view, setView] = useState<AppView>('dashboard')
  const [calls, setCalls] = useState<Call[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [theme, setTheme] = useState<Theme>('light')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(6)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [selectedCall, setSelectedCall] = useState<Call | null>(null)
  const [negotiationBucketFilter, setNegotiationBucketFilter] = useState<NegotiationBucketKey | 'all'>('all')
  const [customerFilter, setCustomerFilter] = useState<string | 'all'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const handleLogin = useCallback((a: AuthState) => {
    saveAuthToStorage(a)
    setAuth(a)
  }, [])

  const handleLogout = useCallback(() => {
    clearAuthFromStorage()
    setAuth(null)
    setView('dashboard')
  }, [])

  const token =
    auth?.token ||
    (typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null) ||
    (typeof window !== 'undefined' ? window.__BEARER_TOKEN__ : undefined) ||
    ''

  useEffect(() => {
    if (!token) return
    async function loadCalls() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/v1/calls', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`)
        const data: CallsApiResponse = await res.json()
        setCalls(data.calls ?? [])
      } catch (err) {
        console.error('Error loading calls from API', err)
        setError('Could not load calls from API.')
        setCalls([])
      } finally {
        setIsLoading(false)
      }
    }
    loadCalls()
  }, [token])

  const filteredCalls = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return calls.filter((call) => {
      if (selectedLocation) {
        const matchLocation = call.origin === selectedLocation || call.destination === selectedLocation
        if (!matchLocation) return false
      }
      if (negotiationBucketFilter !== 'all') {
        const key = getNegotiationBucketKey(negotiationDeltaPercent(call))
        if (key !== negotiationBucketFilter) return false
      }
      if (customerFilter !== 'all') {
        if (!call.mc_number || call.mc_number !== customerFilter) return false
      }
      if (dateFrom || dateTo) {
        const callDate = parseCallDateTime(call.call_datetime)
        if (!callDate) return false
        const t = callDate.getTime()
        if (dateFrom) {
          const from = new Date(dateFrom + 'T00:00:00').getTime()
          if (t < from) return false
        }
        if (dateTo) {
          const to = new Date(dateTo + 'T23:59:59.999').getTime()
          if (t > to) return false
        }
      }
      if (!term) return true
      if (term === 'successful') return call.outcome.toLowerCase() === 'successful'
      if (term === 'unsuccessful') return call.outcome.toLowerCase() === 'unsuccessful'
      const haystack = [
        call.mc_number,
        call.origin,
        call.destination,
        call.outcome,
        call.sentiment,
        call.call_datetime,
        `${call.call_id}`,
        `${call.load_id}`,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(term)
    })
  }, [calls, searchTerm, selectedLocation, negotiationBucketFilter, customerFilter, dateFrom, dateTo])

  const globalSatisfaction = useMemo(() => {
    if (calls.length === 0) return 0
    const sum = calls.reduce((acc, c) => acc + sentimentScore(c.sentiment), 0)
    return sum / calls.length
  }, [calls])

  const globalSatisfactionColor =
    globalSatisfaction >= 8 ? 'text-emerald-600' : globalSatisfaction >= 5 ? 'text-sky-600' : 'text-rose-600'

  const negotiationBuckets = useMemo(() => computeNegotiationBuckets(filteredCalls), [filteredCalls])
  const totalNegotiationCount = negotiationBuckets.reduce((sum, b) => sum + b.count, 0)
  const topCustomers = useMemo(() => computeTopCustomers(calls).slice(0, 3), [calls])
  const isDark = theme === 'dark'

  if (!auth) {
    return (
      <LoginPage
        key="login"
        theme={theme}
        setTheme={setTheme}
        onLogin={handleLogin}
      />
    )
  }

  return (
    <div
      key="authenticated"
      className={isDark ? 'flex min-h-screen bg-slate-950 text-slate-100' : 'flex min-h-screen bg-slate-50 text-slate-900'}
    >
      <Sidebar view={view} onNavigate={setView} onLogout={handleLogout} isDark={isDark} />

      <div className="flex min-h-screen flex-1 flex-col">
        <>
          <DashboardHeader
              searchTerm={searchTerm}
              onSearchChange={(v) => {
                setSearchTerm(v)
                setPage(0)
              }}
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={(v: string) => {
                setDateFrom(v)
                setPage(0)
              }}
              onDateToChange={(v: string) => {
                setDateTo(v)
                setPage(0)
              }}
              theme={theme}
              onThemeChange={setTheme}
              globalSatisfaction={globalSatisfaction}
              globalSatisfactionColor={globalSatisfactionColor}
              isDark={isDark}
            />
            <DashboardPage
              filteredCalls={filteredCalls}
              selectedLocation={selectedLocation}
              onSelectLocation={setSelectedLocation}
              negotiationBuckets={negotiationBuckets}
              totalNegotiationCount={totalNegotiationCount}
              negotiationBucketFilter={negotiationBucketFilter}
              onNegotiationBucketFilterChange={setNegotiationBucketFilter}
              topCustomers={topCustomers}
              customerFilter={customerFilter}
              onCustomerFilterChange={setCustomerFilter}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              page={page}
              onPageChange={setPage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={setRowsPerPage}
              onSelectCall={(call: Call) => setSelectedCall(call)}
              isDark={isDark}
            />
        </>

        {isLoading && (
          <div className="pointer-events-none fixed inset-x-0 top-16 z-30 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/80 px-4 py-1.5 text-xs text-slate-300 shadow-lg shadow-emerald-500/10">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Syncing latest calls from AI brokers…
            </div>
          </div>
        )}

        {error && (
          <div className="fixed bottom-4 right-4 z-30 max-w-sm rounded-xl border border-amber-500/60 bg-amber-500/10 px-4 py-3 text-xs text-amber-100 shadow-lg">
            {error}
          </div>
        )}
      </div>

      <CallDetailModal
        call={selectedCall}
        open={!!selectedCall}
        onClose={() => setSelectedCall(null)}
        isDark={isDark}
      />
    </div>
  )
}

export default App
