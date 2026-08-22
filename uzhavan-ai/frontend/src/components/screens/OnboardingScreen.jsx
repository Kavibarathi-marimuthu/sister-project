import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Check, Plus, Trash2, MapPin, Loader } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'

// ── Static option lists ──────────────────────────────────────────────────────
const CROPS = [
  'நெல்', 'கோதுமை', 'கரும்பு', 'பருத்தி', 'வாழை',
  'தக்காளி', 'வெங்காயம்', 'கத்தரி', 'மிளகாய்', 'சோளம்', 'கடலை', 'உளுந்து',
]
const SOIL_TYPES = ['செம்மண்', 'கரிசல் மண்', 'வண்டல் மண்', 'மணல் மண்', 'களிமண்']
const IRRIGATION = ['மழை நீர்', 'கால்வாய்', 'ஆழ்துளை கிணறு', 'திறந்த கிணறு', 'சொட்டு நீர்பாசனம்', 'தெளிப்பு பாசனம்']
const STAGES = [
  { id: 'planning',   label: 'திட்டமிடல்' },
  { id: 'sowing',     label: 'விதைப்பு' },
  { id: 'vegetative', label: 'வளர்ச்சி நிலை' },
  { id: 'flowering',  label: 'பூக்கும் நிலை' },
  { id: 'ripening',   label: 'பழுக்கும் நிலை' },
  { id: 'harvest',    label: 'அறுவடை' },
]
const STATES_IN = [
  'Tamil Nadu', 'Andhra Pradesh', 'Telangana', 'Karnataka', 'Kerala',
  'Maharashtra', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Punjab',
  'Haryana', 'Madhya Pradesh', 'Bihar', 'Odisha', 'West Bengal',
]
const LANGUAGES = [
  { id: 'ta', label: 'தமிழ்' },
  { id: 'en', label: 'English' },
]

// ── Blank farm template ──────────────────────────────────────────────────────
const blankFarm = () => ({
  id: `farm-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
  name: '',
  crop: CROPS[0],
  area: '',
  soilType: SOIL_TYPES[0],
  irrigation: IRRIGATION[0],
  stage: 'planning',
})

// ── Farm form (add / edit single farm) ───────────────────────────────────────
function FarmForm({ farm, onChange, onRemove, index, total }) {
  const u = (k, v) => onChange({ ...farm, [k]: v })
  return (
    <div className="border border-forest-200 dark:border-forest-700 rounded-2xl p-4 mb-3 bg-forest-50/50 dark:bg-forest-900/40">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-forest-700 dark:text-forest-300 text-sm tamil-text">
          🌾 வயல் {index + 1}
        </h4>
        {total > 1 && (
          <button onClick={onRemove} className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
            <Trash2 size={16} />
          </button>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-xs font-semibold text-soil-600 mb-1 tamil-text">வயல் பெயர் *</label>
          <input className="input-field text-sm py-2 tamil-text" placeholder="எ.கா: வடக்கு வயல்"
            value={farm.name} onChange={e => u('name', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-soil-600 mb-1 tamil-text">பயிர் *</label>
            <select className="input-field text-sm py-2 tamil-text" value={farm.crop} onChange={e => u('crop', e.target.value)}>
              {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-soil-600 mb-1 tamil-text">பரப்பு (ஏக்கர்) *</label>
            <input className="input-field text-sm py-2" type="number" min="0.1" step="0.1" placeholder="2.5"
              value={farm.area} onChange={e => u('area', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-soil-600 mb-1 tamil-text">மண் வகை</label>
            <select className="input-field text-sm py-2 tamil-text" value={farm.soilType} onChange={e => u('soilType', e.target.value)}>
              {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-soil-600 mb-1 tamil-text">நீர்ப்பாசனம்</label>
            <select className="input-field text-sm py-2 tamil-text" value={farm.irrigation} onChange={e => u('irrigation', e.target.value)}>
              {IRRIGATION.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-soil-600 mb-1.5 tamil-text">தற்போதைய நிலை</label>
          <div className="flex flex-wrap gap-1.5">
            {STAGES.map(s => (
              <button key={s.id} onClick={() => u('stage', s.id)}
                className={cn('text-xs px-3 py-1.5 rounded-xl border font-medium transition-all tamil-text',
                  farm.stage === s.id ? 'bg-forest-600 text-white border-forest-600' : 'bg-white dark:bg-forest-800 text-soil-600 dark:text-soil-400 border-soil-200 dark:border-forest-700')}
              >{s.label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Steps config ─────────────────────────────────────────────────────────────
const STEPS = [
  { title: 'தனிப்பட்ட தகவல்', icon: '👨‍🌾' },
  { title: 'இருப்பிடம்',       icon: '📍' },
  { title: 'விவசாய விவரம்',   icon: '🌾' },
  { title: 'உங்கள் வயல்கள்',   icon: '🗺️' },
  { title: 'இருப்பிட அனுமதி', icon: '📡' },
]

export default function OnboardingScreen() {
  const navigate = useNavigate()
  const { updateFarmerProfile } = useAuth()
  const [step, setStep] = useState(0)

  // Personal
  const [name, setName]           = useState('')
  const [mobile, setMobile]       = useState('')
  const [language, setLanguage]   = useState('ta')
  const [experience, setExperience] = useState('')

  // Location
  const [village, setVillage]     = useState('')
  const [district, setDistrict]   = useState('')
  const [state, setState]         = useState('Tamil Nadu')

  // Farms
  const [farms, setFarms] = useState([blankFarm()])

  // Location permission
  const [locStatus, setLocStatus] = useState('idle') // idle | requesting | granted | denied
  const [coords, setCoords]       = useState(null)

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) { setLocStatus('denied'); return }
    setLocStatus('requesting')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setLocStatus('granted')
      },
      () => setLocStatus('denied'),
      { timeout: 10000 }
    )
  }, [])

  // ── Farm helpers ────────────────────────────────────────────────────────────
  const updateFarm = (idx, updated) =>
    setFarms(fs => fs.map((f, i) => i === idx ? updated : f))

  const addFarm = () => setFarms(fs => [...fs, blankFarm()])

  const removeFarm = (idx) =>
    setFarms(fs => fs.filter((_, i) => i !== idx))

  // ── Validation ──────────────────────────────────────────────────────────────
  const canNext = () => {
    if (step === 0) return name.trim() && mobile.replace(/\D/g, '').length >= 10
    if (step === 1) return village.trim() && district.trim() && state
    if (step === 2) return experience !== ''
    if (step === 3) return farms.every(f => f.name.trim() && f.area && parseFloat(f.area) > 0)
    return true
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  const finish = () => {
    const totalArea = farms.reduce((s, f) => s + (parseFloat(f.area) || 0), 0)
    updateFarmerProfile({
      name,
      mobile,
      village,
      district,
      state,
      language,
      experience: parseInt(experience) || 0,
      landSize: totalArea,
      farms,
      location: coords,
      badges: [],
      streak: 0,
      onboarded: true,
    })
    navigate('/')
  }

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else finish()
  }

  const back = () => setStep(s => s - 1)

  // ── Step content ─────────────────────────────────────────────────────────────
  const stepContent = [
    /* 0 — Personal */
    <div key="personal" className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-semibold text-soil-600 dark:text-soil-400 mb-1.5 tamil-text">உங்கள் பெயர் *</label>
        <input className="input-field tamil-text" placeholder="முழுப் பெயர்" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-semibold text-soil-600 dark:text-soil-400 mb-1.5 tamil-text">மொபைல் எண் *</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-soil-500 font-semibold text-sm">🇮🇳 +91</span>
          <input className="input-field pl-16" type="tel" placeholder="98765 43210"
            value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-soil-600 dark:text-soil-400 mb-1.5 tamil-text">விரும்பிய மொழி</label>
        <div className="flex gap-2">
          {LANGUAGES.map(l => (
            <button key={l.id} onClick={() => setLanguage(l.id)}
              className={cn('flex-1 py-3 rounded-2xl font-semibold border text-sm transition-all tamil-text',
                language === l.id ? 'bg-forest-600 text-white border-forest-600' : 'bg-soil-50 text-soil-600 border-soil-200')}>
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>,

    /* 1 — Location */
    <div key="location" className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-semibold text-soil-600 dark:text-soil-400 mb-1.5 tamil-text">கிராமம் / ஊர் *</label>
        <input className="input-field tamil-text" placeholder="எ.கா: திருவாடானை" value={village} onChange={e => setVillage(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-semibold text-soil-600 dark:text-soil-400 mb-1.5 tamil-text">மாவட்டம் *</label>
        <input className="input-field tamil-text" placeholder="எ.கா: ராமநாதபுரம்" value={district} onChange={e => setDistrict(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-semibold text-soil-600 dark:text-soil-400 mb-1.5">State *</label>
        <select className="input-field" value={state} onChange={e => setState(e.target.value)}>
          {STATES_IN.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>,

    /* 2 — Farming info */
    <div key="farming" className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-semibold text-soil-600 dark:text-soil-400 mb-1.5 tamil-text">விவசாய அனுபவம் (ஆண்டுகள்) *</label>
        <input className="input-field" type="number" min="0" max="60" placeholder="எ.கா: 12"
          value={experience} onChange={e => setExperience(e.target.value)} />
      </div>
      <div className="p-4 bg-forest-50 dark:bg-forest-900/50 rounded-2xl">
        <p className="text-sm text-forest-700 dark:text-forest-300 tamil-text leading-relaxed">
          ℹ️ மொத்த நில அளவு அடுத்த படியில் உங்கள் வயல் விவரங்களிலிருந்து தானாகக் கணக்கிடப்படும்.
        </p>
      </div>
    </div>,

    /* 3 — Farms */
    <div key="farms" className="flex flex-col gap-2">
      {farms.map((farm, i) => (
        <FarmForm key={farm.id} farm={farm} index={i} total={farms.length}
          onChange={updated => updateFarm(i, updated)}
          onRemove={() => removeFarm(i)}
        />
      ))}
      <button onClick={addFarm}
        className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-forest-300 dark:border-forest-700 rounded-2xl text-forest-600 dark:text-forest-400 font-semibold text-sm hover:bg-forest-50 dark:hover:bg-forest-900/50 transition-all">
        <Plus size={18} /> வேறு வயல் சேர்
      </button>
      <p className="text-xs text-soil-400 text-center tamil-text mt-1">
        மொத்தம் {farms.reduce((s, f) => s + (parseFloat(f.area) || 0), 0).toFixed(1)} ஏக்கர்
      </p>
    </div>,

    /* 4 — Location permission */
    <div key="loc" className="flex flex-col items-center gap-6 py-4">
      <div className="w-24 h-24 bg-forest-100 dark:bg-forest-900 rounded-3xl flex items-center justify-center text-6xl">📡</div>
      <div className="text-center">
        <h3 className="font-display font-bold text-xl text-forest-800 dark:text-forest-200 tamil-text mb-2">இருப்பிட அனுமதி</h3>
        <p className="text-sm text-soil-600 dark:text-soil-400 tamil-text leading-relaxed">
          வானிலை எச்சரிக்கை, பூச்சி எச்சரிக்கை மற்றும் பயிர் பரிந்துரைக்கு இருப்பிடம் பயன்படுத்தப்படும்.
        </p>
      </div>

      {locStatus === 'idle' && (
        <button onClick={requestLocation}
          className="btn-primary flex items-center gap-2 px-6 tamil-text">
          <MapPin size={18} /> இருப்பிட அனுமதி கொடு
        </button>
      )}
      {locStatus === 'requesting' && (
        <div className="flex items-center gap-3 text-forest-600 tamil-text">
          <Loader size={20} className="animate-spin" /> கண்டறிகிறோம்...
        </div>
      )}
      {locStatus === 'granted' && (
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-leaf-600 font-semibold">
            <Check size={20} /> இருப்பிடம் கிடைத்தது ✅
          </div>
          <p className="text-xs text-soil-400">
            {coords?.lat.toFixed(4)}, {coords?.lon.toFixed(4)}
          </p>
        </div>
      )}
      {locStatus === 'denied' && (
        <div className="text-center">
          <p className="text-soil-500 text-sm tamil-text mb-3">அனுமதி மறுக்கப்பட்டது. பின்னர் அமைப்புகளில் மாற்றலாம்.</p>
          <button onClick={() => setLocStatus('idle')} className="text-xs text-forest-600 underline">மீண்டும் முயற்சி</button>
        </div>
      )}

      <p className="text-xs text-soil-400 text-center tamil-text">
        இதை தவிர்த்து பின்னர் சேர்க்கலாம்
      </p>
    </div>,
  ]

  return (
    <div className="min-h-dvh bg-white dark:bg-forest-950 flex flex-col">
      {/* Header with progress */}
      <div className="bg-gradient-to-r from-forest-700 to-leaf-600 px-5 pt-safe pt-5 pb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{STEPS[step].icon}</span>
            <div>
              <p className="text-white/70 text-xs tamil-text">{step + 1} / {STEPS.length}</p>
              <h2 className="font-display font-bold text-white tamil-text">{STEPS[step].title}</h2>
            </div>
          </div>
          <div className="text-white/70 text-sm">Uzhavan AI 🌾</div>
        </div>
        {/* Progress bar */}
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className={cn('h-1.5 flex-1 rounded-full transition-all duration-500',
              i <= step ? 'bg-white' : 'bg-white/30')} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            {stepContent[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer nav */}
      <div className="bg-white dark:bg-forest-950 border-t border-soil-100 dark:border-forest-800 px-5 py-4 flex gap-3 pb-safe">
        {step > 0 && (
          <button onClick={back} className="btn-ghost flex items-center gap-1 tamil-text">
            <ChevronLeft size={16} /> முந்தையது
          </button>
        )}
        <button
          onClick={next}
          disabled={!canNext()}
          className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 tamil-text"
        >
          {step < STEPS.length - 1
            ? <>அடுத்தது <ChevronRight size={16} /></>
            : <>தொடங்குவோம்! <Check size={16} /></>
          }
        </button>
      </div>
    </div>
  )
}
