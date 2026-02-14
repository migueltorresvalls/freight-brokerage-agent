import type { AuthState } from '../types'

export const AUTH_TOKEN_KEY = 'auth_token'
export const AUTH_USERNAME_KEY = 'auth_username'
export const AUTH_EMAIL_KEY = 'auth_email'

export function loadAuthFromStorage(): AuthState | null {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  if (!token) return null
  const username = localStorage.getItem(AUTH_USERNAME_KEY)
  const email = localStorage.getItem(AUTH_EMAIL_KEY)
  if (!username || !email) return null
  return { token, username, email }
}

export function saveAuthToStorage(auth: AuthState): void {
  localStorage.setItem(AUTH_TOKEN_KEY, auth.token)
  localStorage.setItem(AUTH_USERNAME_KEY, auth.username)
  localStorage.setItem(AUTH_EMAIL_KEY, auth.email)
}

export function clearAuthFromStorage(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USERNAME_KEY)
  localStorage.removeItem(AUTH_EMAIL_KEY)
}
