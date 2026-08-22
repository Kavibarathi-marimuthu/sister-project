import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, ChevronRight, Cloud, Bug, ShoppingCart, Sprout, MapPin } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { cn } from '../../lib/utils'

const cardVariants = {
  hidden:   { opacity: 0, y: 16 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.3 } }),
}

const STAGE_MAP = {
  planning:   { label: 'திட்டமிடல்',      pct: 10,  color: 'bg-soil-400'   },
  sowing:     { label: 'விதைப்பு',         pct: 25,  color: 'bg-wheat-400'  },
  vegetative: { label: 'வளர்ச்சி நிலை',    pct: 50,  color: 'bg-leaf-400'   },
  flowering:  { label: 'பூக்கும் நிலை',    pct: 70,  color: 'bg-forest-500' },
  ripening:   { label: 'பழுக்கும் நிலை',   pct: 85,  color: 'bg-wheat-500'  },
  harvest:    { label: 'அறுவடை',           pct: 100, color: 'bg-forest-600' },
}

export default function HomeScreen() {
  const { farmerProfile, getStreak } = useAuth()
  const { t, unreadCount } = useApp()
  const [activeFarmIdx, setActiveFarmIdx] = useState(0)

  const farms       = farmerProfile?.farms || []
  const activeFarm  = farms[activeFarmIdx] || null
  const stage       = STAGE_MAP[activeFarm?.stage] || STAGE_MAP.planning
  const streak      = farmerProfile?.streak ?? getStreak()
  const totalArea   = farms.reduce((s, f) => s + (parseFloat(f.area) || 0), 0)

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 lg:px-6">

      {/* ── Greeting ──────────────────────────────────────── */}
      <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible" className="mb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-soil-500 text-sm tamil-text">வணக்கம் 🙏</p>
            <h1 className="font-display text-2xl font-bold text-forest-800 dark:text-forest-200 tamil-text mt-0.5">
              {farmerProfile?.name || 'விவசாயி'}
            </h1>
            {(farmerProfile?.village || farmerProfile?.district) && (
              <p className="text-soil-500 text-sm mt-0.5 tamil-text flex items-center gap-1">
                <MapPin size={12} />
                {[farmerProfile.village, farmerProfile.district, farmerProfile.state].filter(Boolean).join(', ')}
              </p>
            )}
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {totalArea > 0 && (
                <span className="text-xs text-forest-600 bg-forest-50 dark:bg-forest-900 px-2 py-0.5 rounded-lg font-medium">
                  📐 {totalArea.toFixed(1)} ஏக்கர்
                </span>
              )}
              {farmerProfile?.experience > 0 && (
                <span className="text-xs text-soil-500 bg-soil-50 dark:bg-forest-900 px-2 py-0.5 rounded-lg">
                  🌾 {farmerProfile.experience} ஆண்டு அனுபவம்
                </span>
              )}
              {streak > 0 && (
                <span className="text-xs text-wheat-700 bg-wheat-50 dark:bg-wheat-950/30 px-2 py-0.5 rounded-lg font-medium">
                  🔥 {streak} நாள் streak
                </span>
              )}
            </div>
          </div>
          <Link to="/notifications" className="relative p-3 bg-white dark:bg-forest-900 rounded-2xl shadow-card flex-shrink-0">
            <Bell size={20} className="text-soil-600 dark:text-soil-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{unreadCount}</span>
            )}
          </Link>
        </div>
      </motion.div>

      {/* ── Farm switcher ────────────────────────────────── */}
      {farms.length > 1 && (
        <motion.div custom={0.5} variants={cardVariants} initial="hidden" animate="visible" className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {farms.map((f, i) => (
            <button key={f.id} onClick={() => setActiveFarmIdx(i)}
              className={cn('flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all tamil-text',
                i === activeFarmIdx
                  ? 'bg-forest-600 text-white'
                  : 'bg-white dark:bg-forest-900 text-soil-600 dark:text-soil-400 border border-soil-100 dark:border-forest-800'
              )}>
              {f.name} · {f.area} ஏ
            </button>
          ))}
        </motion.div>
      )}

      {/* ── No farms yet ──────────────────────────────────── */}
      {farms.length === 0 && (
        <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible" className="mb-4">
          <Link to="/profile" className="block card border-dashed border-2 border-forest-200 dark:border-forest-700 text-center py-8">
            <div className="text-5xl mb-2">🌱</div>
            <p className="font-semibold text-forest-700 dark:text-forest-300 tamil-text">வயல் சேர்க்கவில்லை</p>
            <p className="text-sm text-soil-500 mt-1 tamil-text">சுயவிவரத்தில் வயல் சேர்க்கவும்</p>
          </Link>
        </motion.div>
      )}

      {/* ── Active farm overview ──────────────────────────── */}
      {activeFarm && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Crop & stage */}
          <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
            <Link to="/cultivation" className="card-hover block h-full">
              <div className="flex items-center gap-2 mb-2">
                <Sprout size={16} className="text-forest-500" />
                <span className="text-xs font-semibold text-soil-500 uppercase tracking-wide tamil-text">{activeFarm.name}</span>
              </div>
              <div className="font-display text-xl font-bold text-forest-800 dark:text-forest-200 tamil-text mb-1">
                {activeFarm.crop}
              </div>
              <div className="text-xs text-soil-500 tamil-text mb-2">{stage.label}</div>
              <div className="w-full h-2 bg-soil-100 rounded-full">
                <div className={cn('h-full rounded-full transition-all duration-1000', stage.color)} style={{ width: `${stage.pct}%` }} />
              </div>
              <div className="text-xs text-soil-400 mt-1">{stage.pct}% {t('முடிந்தது', 'complete')}</div>
            </Link>
          </motion.div>

          {/* Farm details */}
          <motion.div custom={1.5} variants={cardVariants} initial="hidden" animate="visible">
            <Link to="/soil" className="card-hover block h-full">
              <div className="flex items-center gap-2 mb-2">
                <Cloud size={16} className="text-sky-500" />
                <span className="text-xs font-semibold text-soil-500 uppercase tracking-wide tamil-text">வயல் விவரம்</span>
              </div>
              <div className="font-display text-2xl font-bold text-forest-800 dark:text-forest-200">{activeFarm.area}</div>
              <div className="text-xs text-soil-500 mt-0.5 tamil-text">ஏக்கர்</div>
              {activeFarm.soilType && <div className="text-xs text-soil-400 mt-1.5 tamil-text">{activeFarm.soilType}</div>}
              {activeFarm.irrigation && <div className="text-xs text-soil-400 tamil-text">{activeFarm.irrigation}</div>}
            </Link>
          </motion.div>

          {/* Disease scan */}
          <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
            <Link to="/disease" className="card-hover block">
              <div className="flex items-center gap-2 mb-2">
                <Bug size={16} className="text-red-400" />
                <span className="text-xs font-semibold text-soil-500 uppercase tracking-wide tamil-text">நோய் கண்டறிதல்</span>
              </div>
              <div className="text-3xl mb-1">📸</div>
              <div className="font-semibold text-sm text-forest-800 dark:text-forest-200 tamil-text">புகைப்படம் எடு</div>
              <div className="text-xs text-soil-500 mt-0.5 tamil-text">Gemini AI கண்டறியும்</div>
            </Link>
          </motion.div>

          {/* Market */}
          <motion.div custom={2.5} variants={cardVariants} initial="hidden" animate="visible">
            <Link to="/market" className="card-hover block">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart size={16} className="text-wheat-500" />
                <span className="text-xs font-semibold text-soil-500 uppercase tracking-wide tamil-text">சந்தை</span>
              </div>
              <div className="text-3xl mb-1">📊</div>
              <div className="font-semibold text-sm text-forest-800 dark:text-forest-200 tamil-text">மண்டி விலை</div>
              <div className="text-xs text-soil-500 mt-0.5 tamil-text">நேரடி விலை</div>
            </Link>
          </motion.div>
        </div>
      )}

      {/* ── Quick actions ─────────────────────────────────── */}
      <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
        <h3 className="font-display font-bold text-forest-800 dark:text-forest-200 mb-3 tamil-text">விரைவு செயல்கள்</h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { to: '/soil',      icon: '🧪', label: 'மண் சோதனை'   },
            { to: '/weather',   icon: '🌧️', label: 'வானிலை'       },
            { to: '/schemes',   icon: '🏛️', label: 'அரசு திட்டம்' },
            { to: '/community', icon: '👥', label: 'சமூகம்'        },
          ].map(a => (
            <Link key={a.to} to={a.to}
              className="flex flex-col items-center gap-1.5 p-3 bg-white dark:bg-forest-900 rounded-2xl shadow-card hover:shadow-card-hover transition-all active:scale-95">
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs font-medium text-soil-600 dark:text-soil-400 text-center tamil-text leading-tight">{a.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* ── AI tip banner ─────────────────────────────────── */}
      <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible" className="mt-4">
        <div className="card bg-gradient-to-r from-forest-50 to-leaf-50 dark:from-forest-900/60 dark:to-leaf-900/30 border-forest-200 dark:border-forest-700">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🤖</span>
            <div>
              <p className="font-semibold text-forest-700 dark:text-forest-300 text-sm tamil-text">AI ஆலோசகர் தயார்!</p>
              <p className="text-xs text-soil-500 tamil-text mt-0.5">திரையின் மூலையில் உள்ள 🎙️ பொத்தானை அழுத்தி கேளுங்கள்</p>
            </div>
            <ChevronRight size={18} className="text-forest-500 ml-auto flex-shrink-0" />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
