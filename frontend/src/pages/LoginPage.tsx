import { useState } from 'react'
import { Truck, Sun, Moon } from 'lucide-react'
import type { AuthState, Theme } from '../types'
import { saveAuthToStorage } from '../lib/auth'

export interface LoginPageProps {
  theme: Theme
  setTheme: (t: Theme) => void
  onLogin: (auth: AuthState) => void
}

export function LoginPage({ theme, setTheme, onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isDark = theme === 'dark'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/v1/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || 'Sign in failed')
      }
      const data = await res.json()
      const auth: AuthState = { token: data.token, username: data.username, email: data.email }
      saveAuthToStorage(auth)
      onLogin(auth)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={
        isDark
          ? 'flex min-h-screen items-center justify-center bg-slate-950 text-slate-100'
          : 'flex min-h-screen items-center justify-center bg-slate-50 text-slate-900'
      }
    >
      <div
        className={
          'w-full max-w-sm rounded-2xl border px-8 py-8 shadow-xl ' +
          (isDark ? 'border-slate-700 bg-slate-900 shadow-slate-950' : 'border-slate-200 bg-white shadow-slate-200')
        }
      >
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 ring-1 ring-emerald-300">
            <Truck className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">ACMELogistics</div>
            <div className="text-sm font-semibold text-slate-900">AI Freight Brokerage</div>
          </div>
        </div>
        <h1 className={'mb-2 text-center text-lg font-semibold ' + (isDark ? 'text-slate-100' : 'text-slate-800')}>
          Sign in
        </h1>
        <p className={'mb-6 text-center text-sm ' + (isDark ? 'text-slate-400' : 'text-slate-500')}>
          Access the brokerage dashboard
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-username" className={'mb-1 block text-xs font-medium ' + (isDark ? 'text-slate-300' : 'text-slate-600')}>
              Username
            </label>
            <input
              id="login-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={
                'w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ' +
                (isDark
                  ? 'border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/30'
                  : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/30')
              }
              placeholder="Username"
            />
          </div>
          <div>
            <label htmlFor="login-password" className={'mb-1 block text-xs font-medium ' + (isDark ? 'text-slate-300' : 'text-slate-600')}>
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={
                'w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 ' +
                (isDark
                  ? 'border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/30'
                  : 'border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400/30')
              }
              placeholder="Password"
            />
          </div>
          {error && (
            <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className={
              'w-full rounded-xl px-4 py-2.5 text-sm font-medium transition ' +
              (isDark ? 'bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50' : 'bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50')
            }
          >
            {loading ? 'Signing in…' : 'Log in'}
          </button>
        </form>
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={
              'flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ' +
              (isDark ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-slate-200 bg-white text-slate-700')
            }
          >
            <Sun className={'h-3.5 w-3.5 ' + (isDark ? 'text-slate-500' : 'text-amber-400')} />
            <span className="relative inline-flex h-4 w-7 items-center rounded-full bg-slate-200">
              <span className={'absolute h-3 w-3 rounded-full bg-white shadow transition-transform ' + (isDark ? 'translate-x-4' : 'translate-x-0.5')} />
            </span>
            <Moon className={'h-3.5 w-3.5 ' + (isDark ? 'text-sky-300' : 'text-slate-400')} />
            <span className="text-slate-500">{isDark ? 'Dark mode' : 'Light mode'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
