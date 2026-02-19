import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi, islandsApi } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('act_user')) } catch { return null }
  })
  const [island, setIsland]   = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('act_token')
    if (!token) { setLoading(false); return }

    authApi.me()
      .then(async (res) => {
        setUser(res.data.user)
        const islandsRes = await islandsApi.list()
        if (islandsRes.data.length > 0) setIsland(islandsRes.data[0])
      })
      .catch(() => logout())
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await authApi.login(email, password)
    const { token, user: u } = res.data
    localStorage.setItem('act_token', token)
    localStorage.setItem('act_user', JSON.stringify(u))
    setUser(u)

    // Load island if any
    const islandsRes = await islandsApi.list()
    if (islandsRes.data.length > 0) setIsland(islandsRes.data[0])
    return { user: u, hasIsland: islandsRes.data.length > 0 }
  }, [])

  const signup = useCallback(async (email, password) => {
    const res = await authApi.signup(email, password)
    const { token, user: u } = res.data
    localStorage.setItem('act_token', token)
    localStorage.setItem('act_user', JSON.stringify(u))
    setUser(u)
    return u
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('act_token')
    localStorage.removeItem('act_user')
    setUser(null)
    setIsland(null)
  }, [])

  const createIsland = useCallback(async (name, hemisphere) => {
    const res = await islandsApi.create(name, hemisphere)
    setIsland(res.data)
    return res.data
  }, [])

  return (
    <AuthContext.Provider value={{ user, island, loading, login, signup, logout, createIsland, setIsland }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
