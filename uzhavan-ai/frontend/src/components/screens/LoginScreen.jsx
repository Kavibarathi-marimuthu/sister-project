import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Eye, EyeOff, ArrowRight, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { loginWithEmail, registerWithEmail, loginWithGoogle } from '../../lib/firebase'
import { CROPS, SOIL_TYPES, DISTRICTS_TN } from '../../lib/utils'
import { cn } from '../../lib/utils'

const STEP_AUTH    = 'auth'     // email/google login
const STEP_PROFILE = 'profile'  // farmer details after first sign-in

// ── Profile multi-step form ──────────────────────────────────────────────────
const PROFILE_STEPS = [
  { id: 0, title: 'உங்கள் பெயர்', icon: '👨‍🌾' },
  { id: 1, title: 'வயல் விவரம்',  icon: '🌾'  },
  { id: 2, title: 'முதல் பயிர்',   icon: '🌱'  },
]

function ProfileSetup({ onDone }) {
  const [pStep, setPStep] = useState(0)
  const [form, setForm] = useState({
    name: '', village: '', district: DISTRICTS_TN[0],
    landSize: '', experience: '', soilType: SOIL_TYPES[0],
    primaryCrop: CROPS[0],
  })
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const canNext = () => {
    if (pStep === 0) return form.name.trim() && form.village.trim()
    if (pStep === 1) return form.landSize
    return true
  }

  const next = () => {
    if (pStep < PROFILE_STEPS.length - 1) setPStep(p => p + 1)
    else onDone(form)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Step indicator */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-soil-500 tamil-text">{pStep + 1} / {PROFILE_STEPS.length} — {PROFILE_STEPS[pStep].title}</span>
          <span className="text-2xl">{PROFILE_STEPS[pStep].icon}</span>
        </div>
        <div className="flex gap-1.5">
          {PROFILE_STEPS.map((_, i) => (
            <div key={i} className={cn('h-1.5 flex-1 rounded-full transition-all duration-500', i <= pStep ? 'bg-forest-500' : 'bg-soil-100')} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {pStep === 0 && (
          <motion.div key="p0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex flex-col gap-4 flex-1">
            <div>
              <label className="block text-sm font-semibold text-soil-600 mb-1.5 tamil-text">உங்கள் பெயர் *</label>
              <input className="input-field tamil-text" placeholder="எ.கா: முத்துக்குமார்" value={form.name} onChange={e => update('name', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-soil-600 mb-1.5 tamil-text">கிராமம் / ஊர் *</label>
              <input className="input-field tamil-text" placeholder="எ.கா: திருவாடானை" value={form.village} onChange={e => update('village', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-soil-600 mb-1.5 tamil-text">மாவட்டம்</label>
              <select className="input-field tamil-text" value={form.district} onChange={e => update('district', e.target.value)}>
                {DISTRICTS_TN.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </motion.div>
        )}

        {pStep === 1 && (
          <motion.div key="p1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex flex-col gap-4 flex-1">
            <div>
              <label className="block text-sm font-semibold text-soil-600 mb-1.5 tamil-text">நில அளவு (ஏக்கர்) *</label>
              <input className="input-field" type="number" min="0.1" step="0.1" placeholder="எ.கா: 2.5" value={form.landSize} onChange={e => update('landSize', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-soil-600 mb-1.5 tamil-text">விவசாய அனுபவம் (ஆண்டுகள்)</label>
              <input className="input-field" type="number" min="0" placeholder="எ.கா: 10" value={form.experience} onChange={e => update('experience', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-soil-600 mb-1.5 tamil-text">மண் வகை</label>
              <div className="grid grid-cols-2 gap-2">
                {SOIL_TYPES.map(s => (
                  <button key={s} onClick={() => update('soilType', s)}
                    className={cn('py-2.5 px-3 rounded-2xl text-sm font-medium transition-all tamil-text border',
                      form.soilType === s ? 'bg-forest-600 text-white border-forest-600' : 'bg-soil-50 text-soil-600 border-soil-200 hover:border-forest-300')}
                  >{s}</button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {pStep === 2 && (
          <motion.div key="p2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex flex-col gap-3 flex-1">
            <p className="text-sm text-soil-600 tamil-text">முக்கிய பயிர் தேர்வு செய்யுங்கள்</p>
            <div className="grid grid-cols-2 gap-2">
              {CROPS.map(c => (
                <button key={c} onClick={() => update('primaryCrop', c)}
                  className={cn('py-3 px-3 rounded-2xl text-sm font-medium transition-all tamil-text border',
                    form.primaryCrop === c ? 'bg-forest-600 text-white border-forest-600' : 'bg-soil-50 text-soil-600 border-soil-200 hover:border-forest-300')}
                >{c}</button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        {pStep > 0 && (
          <button onClick={() => setPStep(p => p - 1)} className="btn-ghost flex items-center gap-1">
            <ChevronLeft size={16} /> முந்தையது
          </button>
        )}
        <button onClick={next} disabled={!canNext()}
          className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
          {pStep < PROFILE_STEPS.length - 1
            ? <>அடுத்தது <ChevronRight size={16} /></>
            : <>தொடங்குவோம்! <Check size={16} /></>
          }
        </button>
      </div>
    </div>
  )
}

// ── Main LoginScreen ──────────────────────────────────────────────────────────
export default function LoginScreen() {
  const navigate = useNavigate()
  const { updateFarmerProfile } = useAuth()
  const { t } = useApp()

  const [step, setStep] = useState(STEP_AUTH)
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError]       = useState('')

  // ── helpers ──────────────────────────────────────────────────────────────────
  const goProfile = () => setStep(STEP_PROFILE)

  const handleEmailAuth = async () => {
    setError('')
    if (!email.trim() || !password) { setError('மின்னஞ்சல் மற்றும் கடவுச்சொல் அவசியம்'); return }
    setLoading(true)
    try {
      if (isRegister) {
        await registerWithEmail(email, password, name || email.split('@')[0])
      } else {
        await loginWithEmail(email, password)
      }
      goProfile()
    } catch (err) {
      setError(
        err.code === 'auth/wrong-password'       ? 'கடவுச்சொல் தவறு'                             :
        err.code === 'auth/invalid-credential'   ? 'மின்னஞ்சல் அல்லது கடவுச்சொல் தவறு'           :
        err.code === 'auth/user-not-found'       ? 'கணக்கு இல்லை — புதிதாக பதிவு செய்யுங்கள்'   :
        err.code === 'auth/email-already-in-use' ? 'இந்த மின்னஞ்சல் ஏற்கெனவே பயன்பாட்டில் உள்ளது' :
        err.code === 'auth/weak-password'        ? 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் வேண்டும்'  :
        err.message || 'உள்நுழைவு தோல்வி. மீண்டும் முயற்சிக்கவும்.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      goProfile()
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google உள்நுழைவு தோல்வி')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleProfileDone = (profileForm) => {
    updateFarmerProfile({
      name:         profileForm.name,
      village:      profileForm.village,
      district:     profileForm.district,
      landSize:     parseFloat(profileForm.landSize) || 1,
      experience:   parseInt(profileForm.experience) || 0,
      soilType:     profileForm.soilType,
      primaryCrop:  profileForm.primaryCrop,
      email,
      language:     'ta',
      farms: [{
        id:    'farm-1',
        name:  `${profileForm.name} வயல் 1`,
        area:  parseFloat(profileForm.landSize) || 1,
        crop:  profileForm.primaryCrop,
        stage: 'planning',
      }],
      activeFarm: 'farm-1',
      badges: [],
      streak: 0,
    })
    navigate('/')
  }

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-gradient-to-br from-forest-700 via-forest-600 to-leaf-700 flex flex-col">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-wheat-400/20 organic-blob" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-forest-400/20 organic-blob" />
      </div>

      {/* Branding */}
      <div className="relative z-10 flex flex-col items-center pt-14 pb-6 px-6">
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12 }}
          className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-4 backdrop-blur border border-white/30"
        >
          <span className="text-5xl">{step === STEP_PROFILE ? '👨‍🌾' : '🌾'}</span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-bold text-white text-center">
          Uzhavan AI
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="text-white/80 text-center mt-1 tamil-text text-sm">
          {step === STEP_PROFILE
            ? 'உங்கள் விவரங்களை நிரப்பவும்'
            : 'விதை முதல் விற்பனை வரை — விவசாயிக்கு AI துணை'}
        </motion.p>
      </div>

      {/* White card */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', damping: 20 }}
        className="relative z-10 flex-1 bg-white dark:bg-forest-950 rounded-t-3xl px-6 pt-6 pb-10 overflow-y-auto"
      >
        <AnimatePresence mode="wait">

          {/* ── PROFILE SETUP ─────────────────────────────────── */}
          {step === STEP_PROFILE && (
            <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-full">
              <ProfileSetup onDone={handleProfileDone} />
            </motion.div>
          )}

          {/* ── AUTH ──────────────────────────────────────────── */}
          {step === STEP_AUTH && (
            <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-forest-100 dark:bg-forest-900 rounded-2xl flex items-center justify-center text-2xl">
                  <Mail size={22} className="text-forest-600" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-forest-800 dark:text-forest-200 tamil-text">
                    {isRegister ? 'புது கணக்கு' : 'உள்நுழைவு'}
                  </h2>
                  <p className="text-sm text-soil-500 tamil-text">மின்னஞ்சல் மூலம் தொடரவும்</p>
                </div>
              </div>

              {/* Google Sign-In */}
              <button
                onClick={handleGoogle}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border-2 border-soil-200 dark:border-forest-700 bg-white dark:bg-forest-900 hover:bg-soil-50 dark:hover:bg-forest-800 transition-all font-semibold text-soil-700 dark:text-soil-300 mb-4 disabled:opacity-50"
              >
                {googleLoading ? (
                  <div className="w-5 h-5 border-2 border-soil-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  /* Google colour logo as inline SVG */
                  <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                )}
                <span className="tamil-text">Google மூலம் உள்நுழைவு</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-soil-100 dark:bg-forest-800" />
                <span className="text-xs text-soil-400 tamil-text">அல்லது மின்னஞ்சல் மூலம்</span>
                <div className="flex-1 h-px bg-soil-100 dark:bg-forest-800" />
              </div>

              {/* Email form */}
              {isRegister && (
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="உங்கள் பெயர்"
                  className="input-field mb-3 tamil-text"
                />
              )}
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="மின்னஞ்சல் உள்ளிடவும்"
                className="input-field mb-3"
                onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
              />
              <div className="relative mb-5">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="கடவுச்சொல்"
                  className="input-field pr-12 tamil-text"
                  onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
                />
                <button
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-soil-400 hover:text-soil-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && (
                <p className="text-red-500 text-sm mb-3 tamil-text bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-xl">{error}</p>
              )}

              <button
                onClick={handleEmailAuth}
                disabled={loading || googleLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> சரிபார்க்கிறது...</>
                  : isRegister
                  ? <>கணக்கு உருவாக்கு <ArrowRight size={16} /></>
                  : <>உள்நுழைவு <ArrowRight size={16} /></>
                }
              </button>

              <button
                onClick={() => { setIsRegister(r => !r); setError('') }}
                className="w-full text-center mt-3 text-sm text-forest-600 font-semibold tamil-text hover:underline"
              >
                {isRegister
                  ? 'ஏற்கெனவே கணக்கு உள்ளதா? உள்நுழைவு'
                  : 'புது கணக்கு உருவாக்கு'}
              </button>

            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
