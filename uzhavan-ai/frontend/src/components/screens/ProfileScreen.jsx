import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Sun, Moon, Type, LogOut, Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { SectionHeader, Card } from '../ui/UIComponents'
import { cn } from '../../lib/utils'

const CROPS = ['நெல்', 'கோதுமை', 'கரும்பு', 'பருத்தி', 'வாழை', 'தக்காளி', 'வெங்காயம்', 'கத்தரி', 'மிளகாய்', 'சோளம்', 'கடலை', 'உளுந்து']
const SOIL_TYPES = ['செம்மண்', 'கரிசல் மண்', 'வண்டல் மண்', 'மணல் மண்', 'களிமண்']
const IRRIGATION = ['மழை நீர்', 'கால்வாய்', 'ஆழ்துளை கிணறு', 'திறந்த கிணறு', 'சொட்டு நீர்பாசனம்', 'தெளிப்பு பாசனம்']
const STAGES = [
  { id: 'planning',   label: 'திட்டமிடல்'  },
  { id: 'sowing',     label: 'விதைப்பு'     },
  { id: 'vegetative', label: 'வளர்ச்சி'     },
  { id: 'flowering',  label: 'பூக்கும் நிலை' },
  { id: 'ripening',   label: 'பழுக்கும் நிலை' },
  { id: 'harvest',    label: 'அறுவடை'       },
]

const STAGE_LABEL = (id) => STAGES.find(s => s.id === id)?.label || id

// ── Inline farm edit form ─────────────────────────────────────────────────────
function FarmEditForm({ farm, onSave, onCancel }) {
  const [f, setF] = useState({ ...farm })
  const u = (k, v) => setF(prev => ({ ...prev, [k]: v }))
  const valid = f.name.trim() && f.area && parseFloat(f.area) > 0
  return (
    <div className="flex flex-col gap-3 mt-2">
      <div>
        <label className="block text-xs font-semibold text-soil-600 mb-1 tamil-text">வயல் பெயர் *</label>
        <input className="input-field text-sm py-2 tamil-text" value={f.name} onChange={e => u('name', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-soil-600 mb-1 tamil-text">பயிர்</label>
          <select className="input-field text-sm py-2 tamil-text" value={f.crop} onChange={e => u('crop', e.target.value)}>
            {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-soil-600 mb-1 tamil-text">பரப்பு (ஏக்கர்)</label>
          <input className="input-field text-sm py-2" type="number" min="0.1" step="0.1" value={f.area} onChange={e => u('area', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-soil-600 mb-1 tamil-text">மண் வகை</label>
          <select className="input-field text-sm py-2 tamil-text" value={f.soilType} onChange={e => u('soilType', e.target.value)}>
            {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-soil-600 mb-1 tamil-text">நீர்ப்பாசனம்</label>
          <select className="input-field text-sm py-2 tamil-text" value={f.irrigation} onChange={e => u('irrigation', e.target.value)}>
            {IRRIGATION.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-soil-600 mb-1.5 tamil-text">தற்போதைய நிலை</label>
        <div className="flex flex-wrap gap-1.5">
          {STAGES.map(s => (
            <button key={s.id} onClick={() => u('stage', s.id)}
              className={cn('text-xs px-2.5 py-1.5 rounded-xl border font-medium transition-all tamil-text',
                f.stage === s.id ? 'bg-forest-600 text-white border-forest-600' : 'bg-white dark:bg-forest-800 text-soil-600 dark:text-soil-400 border-soil-200 dark:border-forest-700')}
            >{s.label}</button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 mt-1">
        <button onClick={() => onSave(f)} disabled={!valid}
          className="btn-primary flex-1 text-sm py-2.5 flex items-center justify-center gap-1.5 disabled:opacity-50 tamil-text">
          <Check size={15} /> சேமி
        </button>
        <button onClick={onCancel} className="btn-ghost flex-1 text-sm py-2.5 tamil-text">ரத்து</button>
      </div>
    </div>
  )
}

// ── New farm blank ────────────────────────────────────────────────────────────
const blankFarm = () => ({
  id: `farm-${Date.now()}`,
  name: '', crop: CROPS[0], area: '',
  soilType: SOIL_TYPES[0], irrigation: IRRIGATION[0], stage: 'planning',
})

export default function ProfileScreen() {
  const { farmerProfile, updateFarmerProfile, addFarm, updateFarm, deleteFarm, logout, getStreak } = useAuth()
  const { t, toggleDark, toggleLargeText, darkMode, largeText, language, toggleLanguage } = useApp()

  const [editingFarmId, setEditingFarmId] = useState(null)
  const [addingFarm, setAddingFarm]       = useState(false)
  const [newFarm, setNewFarm]             = useState(blankFarm())

  const farms  = farmerProfile?.farms || []
  const streak = farmerProfile?.streak ?? getStreak()
  const totalArea = farms.reduce((s, f) => s + (parseFloat(f.area) || 0), 0)

  const handleSaveNew = (farm) => {
    addFarm(farm)
    setAddingFarm(false)
    setNewFarm(blankFarm())
  }

  const handleSaveEdit = (farm) => {
    updateFarm(farm.id, farm)
    setEditingFarmId(null)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 lg:px-6">
      <SectionHeader title={t('சுயவிவரம்', 'Profile')} />

      {/* ── Profile card ───────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card mb-5">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-forest-500 to-leaf-500 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-lg flex-shrink-0">
            {farmerProfile?.name?.[0]?.toUpperCase() || '👨'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-2xl text-forest-800 dark:text-forest-200 tamil-text truncate">
              {farmerProfile?.name || '—'}
            </h2>
            {(farmerProfile?.village || farmerProfile?.district) && (
              <p className="text-soil-500 tamil-text text-sm truncate">
                {[farmerProfile.village, farmerProfile.district, farmerProfile.state].filter(Boolean).join(', ')}
              </p>
            )}
            {farmerProfile?.mobile && (
              <p className="text-xs text-soil-400 mt-0.5">📱 +91 {farmerProfile.mobile}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-1.5">
              {totalArea > 0 && (
                <span className="text-xs bg-forest-50 dark:bg-forest-900 text-forest-600 px-2 py-0.5 rounded-lg">
                  📐 {totalArea.toFixed(1)} ஏக்கர்
                </span>
              )}
              {farmerProfile?.experience > 0 && (
                <span className="text-xs bg-soil-50 dark:bg-forest-900 text-soil-600 px-2 py-0.5 rounded-lg tamil-text">
                  🌾 {farmerProfile.experience} ஆண்டு
                </span>
              )}
              {streak > 0 && (
                <span className="text-xs bg-wheat-50 dark:bg-wheat-950/30 text-wheat-700 px-2 py-0.5 rounded-lg">
                  🔥 {streak} நாள் streak
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Farm management ────────────────────────────────── */}
      <Card className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-forest-800 dark:text-forest-200 tamil-text">
            🌾 என் வயல்கள் ({farms.length})
          </h3>
          <button onClick={() => { setAddingFarm(true); setNewFarm(blankFarm()) }}
            className="flex items-center gap-1.5 text-xs bg-forest-600 text-white px-3 py-1.5 rounded-xl font-semibold hover:bg-forest-700 transition-all tamil-text">
            <Plus size={14} /> வயல் சேர்
          </button>
        </div>

        {/* Add farm form */}
        <AnimatePresence>
          {addingFarm && (
            <motion.div
              key="add-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border border-forest-200 dark:border-forest-700 rounded-2xl p-3 mb-3 bg-forest-50/50 dark:bg-forest-900/40"
            >
              <p className="text-xs font-bold text-forest-700 dark:text-forest-300 mb-2 tamil-text">புதிய வயல்</p>
              <FarmEditForm
                farm={newFarm}
                onSave={handleSaveNew}
                onCancel={() => setAddingFarm(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {farms.length === 0 && !addingFarm && (
          <div className="text-center py-6 text-soil-400 tamil-text text-sm">
            வயல் எதுவும் சேர்க்கவில்லை
          </div>
        )}

        <div className="flex flex-col gap-2">
          {farms.map(farm => (
            <AnimatePresence key={farm.id} mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-soil-100 dark:border-forest-800 rounded-2xl p-3"
              >
                {editingFarmId === farm.id ? (
                  <FarmEditForm
                    farm={farm}
                    onSave={handleSaveEdit}
                    onCancel={() => setEditingFarmId(null)}
                  />
                ) : (
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-forest-800 dark:text-forest-200 tamil-text truncate">{farm.name}</p>
                        <span className="text-xs bg-forest-50 dark:bg-forest-900 text-forest-600 px-2 py-0.5 rounded-lg flex-shrink-0 tamil-text">
                          {STAGE_LABEL(farm.stage)}
                        </span>
                      </div>
                      <p className="text-xs text-soil-500 tamil-text mt-0.5">
                        {farm.crop} · {farm.area} ஏக்கர்
                        {farm.soilType ? ` · ${farm.soilType}` : ''}
                        {farm.irrigation ? ` · ${farm.irrigation}` : ''}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => setEditingFarmId(farm.id)}
                        className="p-1.5 rounded-lg hover:bg-soil-50 dark:hover:bg-forest-900 text-soil-400 hover:text-forest-600 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => deleteFarm(farm.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-soil-400 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          ))}
        </div>
      </Card>

      {/* ── Settings ────────────────────────────────────────── */}
      <Card className="mb-5">
        <h3 className="font-display font-bold text-forest-800 dark:text-forest-200 mb-3 tamil-text">⚙️ அமைப்புகள்</h3>
        <div className="flex flex-col gap-1">
          {/* Language */}
          <button onClick={toggleLanguage} className="flex items-center justify-between p-3 rounded-2xl hover:bg-soil-50 dark:hover:bg-forest-900 transition-colors w-full">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-forest-100 dark:bg-forest-900 rounded-xl flex items-center justify-center">🌐</div>
              <div className="text-left">
                <p className="font-semibold text-sm text-forest-800 dark:text-forest-200 tamil-text">மொழி / Language</p>
                <p className="text-xs text-soil-500">{language === 'ta' ? 'தமிழ்' : 'English'}</p>
              </div>
            </div>
            <span className="text-xs bg-forest-100 text-forest-700 px-2 py-0.5 rounded-lg font-medium">
              {language === 'ta' ? 'EN' : 'தமிழ்'}
            </span>
          </button>

          {/* Dark mode */}
          <button onClick={toggleDark} className="flex items-center justify-between p-3 rounded-2xl hover:bg-soil-50 dark:hover:bg-forest-900 transition-colors w-full">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-forest-100 dark:bg-forest-900 rounded-xl flex items-center justify-center">
                {darkMode ? <Sun size={18} className="text-wheat-500" /> : <Moon size={18} className="text-soil-600" />}
              </div>
              <p className="font-semibold text-sm text-forest-800 dark:text-forest-200 tamil-text">
                {darkMode ? 'ஒளிர் முறை' : 'இருள் முறை'}
              </p>
            </div>
            <div className={cn('w-12 h-6 rounded-full transition-colors flex items-center px-1', darkMode ? 'bg-forest-500' : 'bg-soil-200')}>
              <div className={cn('w-4 h-4 bg-white rounded-full shadow transition-transform', darkMode ? 'translate-x-6' : 'translate-x-0')} />
            </div>
          </button>

          {/* Large text */}
          <button onClick={toggleLargeText} className="flex items-center justify-between p-3 rounded-2xl hover:bg-soil-50 dark:hover:bg-forest-900 transition-colors w-full">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-forest-100 dark:bg-forest-900 rounded-xl flex items-center justify-center">
                <Type size={18} className="text-forest-600" />
              </div>
              <p className="font-semibold text-sm text-forest-800 dark:text-forest-200 tamil-text">பெரிய எழுத்து முறை</p>
            </div>
            <div className={cn('w-12 h-6 rounded-full transition-colors flex items-center px-1', largeText ? 'bg-forest-500' : 'bg-soil-200')}>
              <div className={cn('w-4 h-4 bg-white rounded-full shadow transition-transform', largeText ? 'translate-x-6' : 'translate-x-0')} />
            </div>
          </button>
        </div>
      </Card>

      {/* App info */}
      <div className="text-center mb-5">
        <div className="text-3xl mb-1">🌾</div>
        <p className="font-display font-bold text-forest-700 dark:text-forest-300">Uzhavan AI v1.0</p>
        <p className="text-xs text-soil-400 tamil-text">விதை முதல் விற்பனை வரை</p>
      </div>

      {/* Logout */}
      <button onClick={logout}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 font-semibold hover:bg-red-50 dark:hover:bg-red-950/30 transition-all tamil-text">
        <LogOut size={18} /> {t('வெளியேறு', 'Logout')}
      </button>
    </div>
  )
}
