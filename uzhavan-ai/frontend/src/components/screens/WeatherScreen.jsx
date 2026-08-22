import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Droplets, Wind, RefreshCw, MapPin, Thermometer, Eye, AlertTriangle } from 'lucide-react'
import { SectionHeader } from '../ui/UIComponents'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'

// ── Gemini endpoint (same key / model as the rest of the app) ──────────────────
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent'

// ── Open-Meteo (free, no key required) — returns current + 5-day forecast ─────
async function fetchOpenMeteo(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&timezone=Asia%2FKolkata&forecast_days=5`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Open-Meteo fetch failed')
  return res.json()
}

// ── WMO weather-code → emoji + Tamil label ─────────────────────────────────────
function wmoLabel(code) {
  if (code === 0)                return { icon: '☀️', label: 'தெளிவான வானம்' }
  if (code <= 3)                 return { icon: '⛅', label: 'சில மேகங்கள்' }
  if (code <= 49)                return { icon: '🌫️', label: 'மூடுபனி' }
  if (code <= 67)                return { icon: '🌧️', label: 'மழை' }
  if (code <= 77)                return { icon: '❄️', label: 'உறைபனி' }
  if (code <= 82)                return { icon: '🌦️', label: 'மழை தூறல்' }
  if (code <= 99)                return { icon: '⛈️', label: 'இடிமுழக்கம்' }
  return                                { icon: '🌤️', label: 'காலநிலை' }
}

const DAY_NAMES = ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ', 'ச']

// ── Ask Gemini for farm-specific weather advisory ──────────────────────────────
async function fetchGeminiAdvisory(locationLabel, cropInfo, currentWeather) {
  if (!GEMINI_API_KEY) return null
  const prompt =
    `நீங்கள் ஒரு அனுபவமிக்க தமிழ் விவசாய ஆலோசகர். ` +
    `இடம்: ${locationLabel}. ` +
    (cropInfo ? `தற்போதைய பயிர்: ${cropInfo}. ` : '') +
    `இன்றைய வானிலை: ${currentWeather}. ` +
    `இந்த வானிலையின் அடிப்படையில் விவசாயிக்கு 3–4 குறிப்பிட்ட, நடைமுறையான செயல் ஆலோசனைகளை ` +
    `கொடுங்கள் (பாசனம், உரமிடல், அறுவடை, நோய் தடுப்பு போன்றவை). ` +
    `ஒவ்வொரு ஆலோசனையையும் JSON array-ல் கொடுங்கள், இந்த format-ல்: ` +
    `[{"icon":"🌧️","urgency":"high","title":"...","message":"...","action":"..."},...] ` +
    `urgency values: "high" | "medium" | "low". JSON மட்டுமே return செய்யுங்கள், வேறு எதுவும் வேண்டாம்.`

  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.6, maxOutputTokens: 600 },
  }

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) return null
  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''
  // Strip markdown fences if present
  const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  try { return JSON.parse(clean) } catch { return null }
}

// ── Urgency style map ──────────────────────────────────────────────────────────
function urgencyStyle(urgency) {
  if (urgency === 'high')   return { bg: 'bg-red-50 dark:bg-red-950/30',    border: 'border-red-200 dark:border-red-900',    text: 'text-red-800 dark:text-red-200',    badge: 'bg-red-200 text-red-800',    label: '🚨 அத்தியாவசியம்' }
  if (urgency === 'medium') return { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-900', text: 'text-amber-800 dark:text-amber-200', badge: 'bg-amber-200 text-amber-800', label: '⚠️ கவனம்' }
  return                           { bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-900', text: 'text-green-800 dark:text-green-200', badge: 'bg-green-200 text-green-800', label: '✅ தகவல்' }
}

// ── Skeleton loader ────────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={cn('animate-pulse bg-soil-200 dark:bg-forest-800 rounded-2xl', className)} />
}

export default function WeatherScreen() {
  const { t } = useApp()
  const { farmerProfile } = useAuth()

  const [meteo, setMeteo]       = useState(null)
  const [alerts, setAlerts]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError]       = useState(null)

  // ── Derive location from profile ─────────────────────────────────────────────
  const location = farmerProfile?.location          // { lat, lon } if GPS was captured
  const village  = farmerProfile?.village  || ''
  const district = farmerProfile?.district || ''
  const state    = farmerProfile?.state    || 'தமிழ்நாடு'
  const locationLabel = [village, district, state].filter(Boolean).join(', ')

  // Active crop from first farm
  const farms      = farmerProfile?.farms || []
  const activeCrop = farms[0]?.currentCrop || farms[0]?.crop || null

  // ── Geocode village → lat/lon via Open-Meteo Geocoding (free) ─────────────────
  const geocode = useCallback(async () => {
    if (location?.lat && location?.lon) return location
    const query = [village, district, state].filter(Boolean).join(' ')
    if (!query) return { lat: 11.127123, lon: 78.656891 } // Tamil Nadu centre fallback
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
    )
    const data = await res.json()
    const r = data?.results?.[0]
    if (r) return { lat: r.latitude, lon: r.longitude }
    return { lat: 11.127123, lon: 78.656891 }
  }, [location, village, district, state])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const coords = await geocode()
      const data   = await fetchOpenMeteo(coords.lat, coords.lon)
      setMeteo(data)

      // Fire Gemini advisory in parallel (non-blocking)
      const curr = data.current
      const wmo  = wmoLabel(curr.weather_code)
      const currentDesc = `${curr.temperature_2m}°C, ${wmo.label}, ஈரப்பதம் ${curr.relative_humidity_2m}%, காற்று ${curr.wind_speed_10m} km/h`
      setAiLoading(true)
      fetchGeminiAdvisory(locationLabel || 'தமிழ்நாடு', activeCrop, currentDesc)
        .then(a => { setAlerts(a); setAiLoading(false) })
        .catch(() => { setAlerts(null); setAiLoading(false) })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [geocode, locationLabel, activeCrop])

  useEffect(() => { load() }, [load])

  // ── Derived current values ────────────────────────────────────────────────────
  const curr    = meteo?.current
  const daily   = meteo?.daily
  const wmo     = curr ? wmoLabel(curr.weather_code) : null

  const today = new Date()

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 lg:px-6">
      <div className="flex items-start justify-between mb-1">
        <SectionHeader
          title={t('வானிலை நுண்ணறிவு', 'Weather Intelligence')}
          subtitle={
            <span className="flex items-center gap-1">
              <MapPin size={12} className="inline" />
              {locationLabel || t('இடம் அமைக்கவில்லை', 'Location not set')}
            </span>
          }
        />
        <button
          onClick={load}
          disabled={loading}
          className="mt-1 p-2 rounded-xl hover:bg-soil-100 dark:hover:bg-forest-800 transition-colors text-soil-500"
          title="புதுப்பி"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 flex items-center gap-2 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm"
          >
            <AlertTriangle size={14} />
            <span>{t('வானிலை தரவு கிடைக்கவில்லை.', 'Could not fetch weather.')} {error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Current condition hero ────────────────────────────────────────────── */}
      {loading ? (
        <Skeleton className="h-40 mb-5" />
      ) : curr && wmo ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-to-br from-sky-600 to-forest-600 text-white mb-5 overflow-hidden relative"
        >
          <div className="absolute right-4 top-4 text-8xl opacity-20">{wmo.icon}</div>
          <div className="relative z-10">
            <p className="text-white/70 text-sm tamil-text flex items-center gap-1">
              <MapPin size={11} /> {locationLabel || 'தமிழ்நாடு'}
            </p>
            <div className="flex items-end gap-3 mt-2">
              <span className="font-display text-7xl font-bold leading-none">
                {Math.round(curr.temperature_2m)}°
              </span>
              <div>
                <p className="text-2xl">{wmo.icon}</p>
                <p className="text-white/90 font-semibold tamil-text">{wmo.label}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-white/80">
              <span className="flex items-center gap-1"><Droplets size={14} /> {curr.relative_humidity_2m}%</span>
              <span className="flex items-center gap-1"><Wind size={14} /> {curr.wind_speed_10m} km/h</span>
              <span className="flex items-center gap-1"><Thermometer size={14} /> உணரும் உஷ்ணம்</span>
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* ── 5-day forecast ─────────────────────────────────────────────────────── */}
      {loading ? (
        <Skeleton className="h-28 mb-5" />
      ) : daily ? (
        <div className="card mb-5">
          <h3 className="font-display font-bold text-forest-800 dark:text-forest-200 mb-3 tamil-text">
            5 நாள் முன்னறிவிப்பு
          </h3>
          <div className="grid grid-cols-5 gap-1">
            {daily.time.slice(0, 5).map((dateStr, i) => {
              const d    = new Date(dateStr)
              const dayName = i === 0 ? 'இன்று' : DAY_NAMES[d.getDay()]
              const wday = wmoLabel(daily.weather_code[i])
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl bg-soil-50 dark:bg-forest-900"
                >
                  <span className="text-xs font-semibold text-soil-500 tamil-text">{dayName}</span>
                  <span className="text-2xl">{wday.icon}</span>
                  <span className="text-sm font-bold text-forest-800 dark:text-forest-200">
                    {Math.round(daily.temperature_2m_max[i])}°
                  </span>
                  <span className="text-xs text-soil-400">
                    {Math.round(daily.temperature_2m_min[i])}°
                  </span>
                  <div className="flex items-center gap-0.5 text-sky-500">
                    <Droplets size={10} />
                    <span className="text-xs">{daily.precipitation_probability_max[i]}%</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      ) : null}

      {/* ── AI farm-action alerts ──────────────────────────────────────────────── */}
      <h3 className="font-display font-bold text-forest-800 dark:text-forest-200 mb-3 tamil-text">
        🔔 விவசாய செயல் ஆலோசனைகள்
      </h3>

      {aiLoading && (
        <div className="flex flex-col gap-3 mb-4">
          {[1, 2, 3].map(n => <Skeleton key={n} className="h-20" />)}
        </div>
      )}

      {!aiLoading && alerts && alerts.length > 0 && (
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {alerts.map((alert, i) => {
              const style = urgencyStyle(alert.urgency)
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={cn('rounded-3xl border p-4', style.bg, style.border)}
                >
                  <div className="flex gap-3 items-start">
                    <span className="text-3xl flex-shrink-0">{alert.icon || '🌾'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className={cn('font-bold tamil-text', style.text)}>{alert.title}</h4>
                        <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', style.badge)}>
                          {style.label}
                        </span>
                      </div>
                      <p className={cn('text-sm leading-relaxed tamil-text', style.text)}>{alert.message}</p>
                      {alert.action && (
                        <button className={cn('mt-2 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all', style.text, style.border, 'bg-white/50 hover:bg-white/80')}>
                          {alert.action} →
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {!aiLoading && !alerts && !loading && (
        <div className="card text-center py-8 text-soil-400 tamil-text">
          <p className="text-3xl mb-2">🌤️</p>
          <p className="text-sm">{GEMINI_API_KEY ? 'AI ஆலோசனை கிடைக்கவில்லை.' : 'AI API கீ இல்லை — .env.local சரிபார்க்கவும்.'}</p>
        </div>
      )}

      {/* ── Attribution ───────────────────────────────────────────────────────── */}
      <p className="text-xs text-center text-soil-300 dark:text-forest-700 mt-6">
        வானிலை தரவு: Open-Meteo · AI ஆலோசனை: Gemini
      </p>
    </div>
  )
}
