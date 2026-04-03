import { createContext, useContext, useState, useCallback } from 'react'
import { adminLogin as apiAdminLogin, googleLogin as apiGoogleLogin } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('crm_token') || '')

  const _persist = useCallback((t) => {
    localStorage.setItem('crm_token', t)
    setToken(t)
  }, [])

  /** Email + password admin login (ADMIN_EMAIL / ADMIN_PASSWORD) */
  const login = useCallback(async (email, password) => {
    const data = await apiAdminLogin(email, password)
    _persist(data.token)
  }, [_persist])

  /**
   * Google SSO login.
   * Calls /api/auth/google/login, then verifies the returned user has isAdmin=true.
   * Throws if the account is not an admin.
   */
  const googleLogin = useCallback(async (credential) => {
    const data = await apiGoogleLogin(credential)
    if (!data.user?.isAdmin) {
      throw new Error('Your Google account is not authorised to access the CRM. Ask an admin to grant you access first.')
    }
    _persist(data.token)
  }, [_persist])

  const logout = useCallback(() => {
    localStorage.removeItem('crm_token')
    setToken('')
  }, [])

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: Boolean(token), login, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
