import React, { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('lang') || 'ta')
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')
  const [largeText, setLargeText] = useState(() => localStorage.getItem('largeText') === 'true')
  const [highContrast, setHighContrast] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'weather', title: 'மழை எச்சரிக்கை', message: '2 நாட்களில் மழை எதிர்பார்க்கப்படுகிறது. உரம் தெளிப்பை தள்ளிப்போடுங்கள்.', time: '10 நிமிடம்', read: false, urgency: 'high' },
    { id: 2, type: 'disease', title: 'நோய் எச்சரிக்கை', message: 'அருகில் உள்ள வயல்களில் இலைப்பேன் தாக்குதல் கண்டறியப்பட்டது.', time: '2 மணி', read: false, urgency: 'medium' },
    { id: 3, type: 'market', title: 'விலை உயர்வு', message: 'நெல் விலை ₹2,200/குவிண்டால் ஆனது. விற்க நல்ல நேரம்!', time: '4 மணி', read: true, urgency: 'low' },
    { id: 4, type: 'scheme', title: 'திட்ட விண்ணப்பம்', message: 'PM-Kisan திட்டம் — இன்று கடைசி நாள்!', time: '1 நாள்', read: true, urgency: 'high' },
  ])
  const [toasts, setToasts] = useState([])

  const toggleLanguage = useCallback(() => {
    const next = language === 'ta' ? 'en' : 'ta'
    setLanguage(next)
    localStorage.setItem('lang', next)
  }, [language])

  const toggleDark = useCallback(() => {
    const next = !darkMode
    setDarkMode(next)
    localStorage.setItem('darkMode', String(next))
    document.documentElement.classList.toggle('dark', next)
  }, [darkMode])

  const toggleLargeText = useCallback(() => {
    const next = !largeText
    setLargeText(next)
    localStorage.setItem('largeText', String(next))
    document.body.classList.toggle('large-text', next)
  }, [largeText])

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const markNotificationRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const t = useCallback((ta, en) => language === 'ta' ? ta : en, [language])

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    document.body.classList.toggle('large-text', largeText)
  }, [darkMode, largeText])

  return (
    <AppContext.Provider value={{
      language, toggleLanguage, t,
      darkMode, toggleDark,
      largeText, toggleLargeText,
      highContrast, setHighContrast,
      notifications, markNotificationRead, unreadCount,
      toasts, addToast,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
