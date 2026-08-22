import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { auth, onAuthStateChanged, logout as fbLogout } from '../lib/firebase'

const AuthContext = createContext(null)

const STORAGE_KEY = 'uzhavan_profile'
const CHAT_POS_KEY = 'uzhavan_chat_pos'
const STREAK_KEY = 'uzhavan_streak'

function loadProfile() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null } catch { return null }
}

function saveProfile(p) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
}

function loadChatPos() {
  try { return JSON.parse(localStorage.getItem(CHAT_POS_KEY)) || null } catch { return null }
}

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [farmerProfile, setFarmerProfile] = useState(loadProfile)
  const [chatPos, setChatPosState] = useState(loadChatPos)

  // ── Firebase auth listener ──────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
      if (u) updateStreak()
    })
    return unsub
  }, [])

  // ── Streak logic: increment once per calendar day ────────────────────────────
  const updateStreak = () => {
    const today = new Date().toDateString()
    const raw = localStorage.getItem(STREAK_KEY)
    if (!raw) {
      localStorage.setItem(STREAK_KEY, JSON.stringify({ last: today, streak: 1 }))
      return
    }
    const data = JSON.parse(raw)
    if (data.last === today) return
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    const newStreak = data.last === yesterday ? data.streak + 1 : 1
    localStorage.setItem(STREAK_KEY, JSON.stringify({ last: today, streak: newStreak }))
    setFarmerProfile(prev => {
      if (!prev) return prev
      const updated = { ...prev, streak: newStreak }
      saveProfile(updated)
      return updated
    })
  }

  const getStreak = () => {
    try { return JSON.parse(localStorage.getItem(STREAK_KEY))?.streak || 0 } catch { return 0 }
  }

  // ── Profile helpers ─────────────────────────────────────────────────────────
  const updateFarmerProfile = useCallback((patch) => {
    setFarmerProfile(prev => {
      const updated = { ...prev, ...patch }
      saveProfile(updated)
      return updated
    })
  }, [])

  // ── Farm CRUD ───────────────────────────────────────────────────────────────
  const addFarm = useCallback((farm) => {
    setFarmerProfile(prev => {
      const farms = [...(prev?.farms || []), { ...farm, id: `farm-${Date.now()}` }]
      const updated = { ...prev, farms, landSize: farms.reduce((s, f) => s + (parseFloat(f.area) || 0), 0) }
      saveProfile(updated)
      return updated
    })
  }, [])

  const updateFarm = useCallback((farmId, patch) => {
    setFarmerProfile(prev => {
      const farms = (prev?.farms || []).map(f => f.id === farmId ? { ...f, ...patch } : f)
      const updated = { ...prev, farms, landSize: farms.reduce((s, f) => s + (parseFloat(f.area) || 0), 0) }
      saveProfile(updated)
      return updated
    })
  }, [])

  const deleteFarm = useCallback((farmId) => {
    setFarmerProfile(prev => {
      const farms = (prev?.farms || []).filter(f => f.id !== farmId)
      const updated = { ...prev, farms, landSize: farms.reduce((s, f) => s + (parseFloat(f.area) || 0), 0) }
      saveProfile(updated)
      return updated
    })
  }, [])

  // ── Chat position persistence ────────────────────────────────────────────────
  const saveChatPos = useCallback((pos) => {
    setChatPosState(pos)
    localStorage.setItem(CHAT_POS_KEY, JSON.stringify(pos))
  }, [])

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = async () => {
    await fbLogout()
    setFarmerProfile(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{
      user, loading,
      farmerProfile, updateFarmerProfile,
      addFarm, updateFarm, deleteFarm,
      chatPos, saveChatPos,
      getStreak,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
