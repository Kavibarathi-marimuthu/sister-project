import React, { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Sprout, ShoppingCart, User,
  Bell, Menu, X, Sun, Moon, Globe,
  Leaf, Cloud, Bug, TrendingUp, MapPin, Award, Users, MessageCircle
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import FloatingAssistant from '../features/VoiceAssistant'
import { cn } from '../../lib/utils'

const bottomNav = [
  { to: '/',        icon: Home,           label: 'முகப்பு',    labelEn: 'Home'    },
  { to: '/farm',    icon: MapPin,         label: 'வயல்',       labelEn: 'Farm'    },
  { to: '/chat',    icon: MessageCircle,  label: 'AI சாட்',   labelEn: 'AI Chat' },
  { to: '/disease', icon: Bug,            label: 'நோய்',       labelEn: 'Disease' },
  { to: '/market',  icon: ShoppingCart,   label: 'சந்தை',     labelEn: 'Market'  },
]

const sideNav = [
  { section: 'முக்கியம்', items: [
    { to: '/', icon: Home, label: 'முகப்பு', labelEn: 'Home' },
    { to: '/farm', icon: MapPin, label: 'வயல் வரைபடம்', labelEn: 'Farm Map' },
    { to: '/soil', icon: Leaf, label: 'மண் பகுப்பாய்வு', labelEn: 'Soil Analysis' },
    { to: '/crops', icon: Sprout, label: 'பயிர் பரிந்துரை', labelEn: 'Crop Recommendation' },
    { to: '/cultivation', icon: Sprout, label: 'சாகுபடி வழிகாட்டி', labelEn: 'Cultivation Guide' },
  ]},
  { section: 'கண்காணிப்பு', items: [
    { to: '/weather', icon: Cloud, label: 'வானிலை', labelEn: 'Weather' },
    { to: '/disease', icon: Bug, label: 'நோய் கண்டறிதல்', labelEn: 'Disease Detection' },
    { to: '/monitor', icon: TrendingUp, label: 'பயிர் கண்காணிப்பு', labelEn: 'Crop Monitoring' },
    { to: '/yield', icon: TrendingUp, label: 'மகசூல் மதிப்பீடு', labelEn: 'Yield Estimate' },
  ]},
  { section: 'சந்தை & சேவை', items: [
    { to: '/market', icon: ShoppingCart, label: 'சந்தை விலை', labelEn: 'Market Prices' },
    { to: '/schemes', icon: Award, label: 'அரசு திட்டங்கள்', labelEn: 'Govt Schemes' },
    { to: '/community', icon: Users, label: 'சமூகம்', labelEn: 'Community' },
    { to: '/chat', icon: MessageCircle, label: 'AI சாட்பாட்', labelEn: 'AI Chatbot' },
  ]},
  { section: 'கணக்கு', items: [
    { to: '/notifications', icon: Bell, label: 'அறிவிப்புகள்', labelEn: 'Notifications' },
    { to: '/profile', icon: User, label: 'சுயவிவரம்', labelEn: 'Profile' },
  ]},
]

export default function AppLayout() {
  const { farmerProfile } = useAuth()
  const { t, toggleLanguage, toggleDark, darkMode, unreadCount, language } = useApp()
  const [sideOpen, setSideOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="flex min-h-dvh bg-[var(--bg)]">
      {/* ── Desktop Sidebar ─────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white dark:bg-forest-950 border-r border-soil-100 dark:border-forest-800 fixed top-0 left-0 bottom-0 z-30">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-soil-100 dark:border-forest-800">
          <div className="w-10 h-10 bg-forest-600 rounded-2xl flex items-center justify-center text-white text-xl">🌾</div>
          <div>
            <div className="font-display font-bold text-forest-800 dark:text-forest-200 leading-tight">Uzhavan AI</div>
            <div className="text-xs text-soil-400 tamil-text">உழவன் AI</div>
          </div>
        </div>

        {/* Farmer card */}
        {farmerProfile && (
          <div className="mx-3 my-3 p-3 bg-forest-50 dark:bg-forest-900 rounded-2xl">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-forest-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                {farmerProfile.name?.[0] || 'உ'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-forest-800 dark:text-forest-200 truncate tamil-text">{farmerProfile.name}</div>
                <div className="text-xs text-soil-500 truncate">{farmerProfile.village}</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-2 px-3">
          {sideNav.map(section => (
            <div key={section.section} className="mb-4">
              <div className="text-xs font-semibold text-soil-400 uppercase tracking-wider px-2 mb-1">{section.section}</div>
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-all',
                    isActive
                      ? 'bg-forest-100 dark:bg-forest-800 text-forest-700 dark:text-forest-300'
                      : 'text-soil-600 dark:text-soil-400 hover:bg-soil-50 dark:hover:bg-forest-900'
                  )}
                >
                  <item.icon size={17} />
                  <span className="tamil-text">{t(item.label, item.labelEn)}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom controls */}
        <div className="border-t border-soil-100 dark:border-forest-800 p-3 flex items-center gap-2">
          <button onClick={toggleLanguage} className="btn-ghost text-xs px-3 py-2 flex items-center gap-1">
            <Globe size={14} />{language === 'ta' ? 'EN' : 'தமிழ்'}
          </button>
          <button onClick={toggleDark} className="btn-ghost p-2">
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </aside>

      {/* ── Mobile Sidebar Drawer ────────────────────────────── */}
      <AnimatePresence>
        {sideOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setSideOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-forest-950 z-50 overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 py-5 border-b border-soil-100 dark:border-forest-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-forest-600 rounded-xl flex items-center justify-center text-white text-lg">🌾</div>
                  <span className="font-display font-bold text-forest-800 dark:text-forest-200">Uzhavan AI</span>
                </div>
                <button onClick={() => setSideOpen(false)} className="p-2 rounded-xl hover:bg-soil-50">
                  <X size={20} className="text-soil-600" />
                </button>
              </div>
              <nav className="p-3">
                {sideNav.map(section => (
                  <div key={section.section} className="mb-4">
                    <div className="text-xs font-semibold text-soil-400 uppercase tracking-wider px-2 mb-1">{section.section}</div>
                    {section.items.map(item => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        onClick={() => setSideOpen(false)}
                        className={({ isActive }) => cn(
                          'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium mb-0.5 transition-all',
                          isActive
                            ? 'bg-forest-100 dark:bg-forest-800 text-forest-700 dark:text-forest-300'
                            : 'text-soil-600 dark:text-soil-400'
                        )}
                      >
                        <item.icon size={18} />
                        <span className="tamil-text">{t(item.label, item.labelEn)}</span>
                      </NavLink>
                    ))}
                  </div>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-dvh">
        {/* Mobile Top Bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/90 dark:bg-forest-950/90 backdrop-blur border-b border-soil-100 dark:border-forest-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSideOpen(true)} className="p-2 -ml-2 rounded-xl hover:bg-soil-50">
              <Menu size={20} className="text-soil-600 dark:text-soil-400" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl">🌾</span>
              <span className="font-display font-bold text-forest-800 dark:text-forest-200 text-base">Uzhavan AI</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggleLanguage} className="text-xs font-semibold text-soil-500 px-2 py-1 rounded-lg hover:bg-soil-50">
              {language === 'ta' ? 'EN' : 'தமிழ்'}
            </button>
            <NavLink to="/notifications" className="relative p-2 rounded-xl hover:bg-soil-50">
              <Bell size={20} className="text-soil-600 dark:text-soil-400" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{unreadCount}</span>
              )}
            </NavLink>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 pb-nav lg:pb-6 overflow-x-hidden">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* ── Bottom Nav (mobile) ──────────────────────────────── */}
      <nav className="bottom-nav lg:hidden">
        <div className="flex items-end justify-around px-2 pt-2 pb-safe">
          {bottomNav.map((item, i) => (
            <NavLink
              key={i}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl min-w-0 flex-1',
                isActive ? 'tab-active' : 'tab-inactive'
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className="text-xs font-medium tamil-text">{t(item.label, item.labelEn)}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* ── Floating AI Assistant — always visible on all screens ── */}
      <FloatingAssistant />
    </div>
  )
}
