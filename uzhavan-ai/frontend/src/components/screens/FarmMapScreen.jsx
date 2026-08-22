import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Plus, Trash2, Edit3, Layers } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { SectionHeader, EmptyState, Card } from '../ui/UIComponents'
import { cn, SOIL_TYPES, CROPS } from '../../lib/utils'

// Mock farm polygons for map visualization
const MOCK_MAP_URL = `https://maps.googleapis.com/maps/api/staticmap?center=9.9312,78.1198&zoom=14&size=400x300&maptype=satellite&key=${import.meta.env.VITE_MAPS_API_KEY || 'DEMO'}`

export default function FarmMapScreen() {
  const { farmerProfile, updateFarmerProfile } = useAuth()
  const { t, addToast } = useApp()
  const [showAdd, setShowAdd] = useState(false)
  const [newFarm, setNewFarm] = useState({ name: '', area: '', crop: CROPS[0], soilType: SOIL_TYPES[0] })

  const farms = farmerProfile?.farms || []

  const addFarm = () => {
    if (!newFarm.name || !newFarm.area) { addToast('தகவல்கள் உள்ளிடவும்', 'error'); return }
    const farm = {
      id: `farm-${Date.now()}`,
      name: newFarm.name,
      area: parseFloat(newFarm.area),
      crop: newFarm.crop,
      soilType: newFarm.soilType,
      stage: 'planning',
    }
    updateFarmerProfile({ farms: [...farms, farm] })
    setShowAdd(false)
    setNewFarm({ name: '', area: '', crop: CROPS[0], soilType: SOIL_TYPES[0] })
    addToast('வயல் சேர்க்கப்பட்டது! 🌾', 'success')
  }

  const deleteFarm = (id) => {
    updateFarmerProfile({ farms: farms.filter(f => f.id !== id) })
    addToast('வயல் நீக்கப்பட்டது', 'info')
  }

  const stageColors = {
    planning: 'bg-soil-200 text-soil-700',
    sowing: 'bg-wheat-200 text-wheat-700',
    vegetative: 'bg-leaf-200 text-leaf-700',
    flowering: 'bg-forest-200 text-forest-700',
    ripening: 'bg-wheat-300 text-wheat-800',
    harvest: 'bg-forest-600 text-white',
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 lg:px-6">
      <SectionHeader
        title={t('வயல் வரைபடம்', 'Farm Map')}
        subtitle={t('உங்கள் வயல்கள் மற்றும் திட்டங்கள்', 'Your farms and plots')}
        action={
          <button onClick={() => setShowAdd(s => !s)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> {t('வயல் சேர்', 'Add Farm')}
          </button>
        }
      />

      {/* Map placeholder */}
      <div className="card mb-5 overflow-hidden p-0">
        <div className="relative h-48 bg-gradient-to-br from-forest-700 to-leaf-600 flex items-center justify-center">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
          <div className="relative z-10 text-center text-white">
            <div className="text-5xl mb-2">🗺️</div>
            <p className="font-semibold tamil-text">GPS வரைபட இடைமுகம்</p>
            <p className="text-sm text-white/70 tamil-text mt-1">Google Maps API key சேர்க்கவும்</p>
          </div>
          {/* Mock farm polygons */}
          <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 400 300" preserveAspectRatio="none">
            <polygon points="80,60 180,50 200,130 100,150" fill="rgba(255,215,0,0.3)" stroke="rgba(255,215,0,0.8)" strokeWidth="2" />
            <polygon points="220,80 320,70 340,160 230,170" fill="rgba(144,238,144,0.3)" stroke="rgba(144,238,144,0.8)" strokeWidth="2" />
            <text x="130" y="110" fill="white" fontSize="11" textAnchor="middle" fontWeight="bold">வடக்கு வயல் (2.0 ஏ)</text>
            <text x="280" y="125" fill="white" fontSize="11" textAnchor="middle" fontWeight="bold">தெற்கு தோட்டம் (1.5 ஏ)</text>
          </svg>
          {/* Satellite toggle */}
          <button className="absolute top-3 right-3 bg-white/20 backdrop-blur text-white text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-white/30 transition-all">
            <Layers size={12} /> Satellite
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 text-sm text-soil-600 dark:text-soil-400">
            <MapPin size={14} className="text-forest-500" />
            <span className="tamil-text">{farmerProfile?.village}, {farmerProfile?.district}</span>
            <span className="ml-auto font-semibold text-forest-700">
              {farms.reduce((acc, f) => acc + (f.area || 0), 0).toFixed(1)} ஏக்கர் மொத்தம்
            </span>
          </div>
        </div>
      </div>

      {/* Add Farm Form */}
      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="card mb-4 border-2 border-dashed border-forest-300 dark:border-forest-700">
          <h3 className="font-display font-bold text-forest-800 dark:text-forest-200 mb-4 tamil-text">புது வயல் சேர்</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-soil-500 tamil-text block mb-1">வயல் பெயர்</label>
              <input className="input-field tamil-text" placeholder="எ.கா: வடக்கு வயல்" value={newFarm.name} onChange={e => setNewFarm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-soil-500 tamil-text block mb-1">அளவு (ஏக்கர்)</label>
              <input className="input-field" type="number" step="0.1" min="0.1" placeholder="1.5" value={newFarm.area} onChange={e => setNewFarm(f => ({ ...f, area: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-semibold text-soil-500 tamil-text block mb-1">பயிர்</label>
              <select className="input-field tamil-text" value={newFarm.crop} onChange={e => setNewFarm(f => ({ ...f, crop: e.target.value }))}>
                {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-soil-500 tamil-text block mb-1">மண் வகை</label>
              <select className="input-field tamil-text" value={newFarm.soilType} onChange={e => setNewFarm(f => ({ ...f, soilType: e.target.value }))}>
                {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={addFarm} className="btn-primary flex-1">{t('சேர்', 'Add Farm')}</button>
            <button onClick={() => setShowAdd(false)} className="btn-ghost">{t('ரத்து', 'Cancel')}</button>
          </div>
        </motion.div>
      )}

      {/* Farm cards */}
      {farms.length === 0
        ? <EmptyState icon="🌱" title="வயல் இல்லை" subtitle="மேலே உள்ள 'வயல் சேர்' பொத்தானை அழுத்தி உங்கள் முதல் வயலை சேர்க்கவும்" />
        : (
          <div className="flex flex-col gap-3">
            {farms.map((farm, i) => (
              <motion.div key={farm.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-forest-100 dark:bg-forest-900 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">🌾</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-forest-800 dark:text-forest-200 tamil-text">{farm.name}</h4>
                        <button onClick={() => deleteFarm(farm.id)} className="p-1.5 rounded-xl hover:bg-red-50 text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        <span className="badge-green">{farm.area} ஏக்கர்</span>
                        <span className="badge-blue tamil-text">{farm.crop}</span>
                        <span className={cn('inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full tamil-text', stageColors[farm.stage] || stageColors.planning)}>
                          {farm.stage === 'planning' ? 'திட்டமிடல்' : farm.stage === 'sowing' ? 'விதைப்பு' : farm.stage === 'vegetative' ? 'வளர்ச்சி' : farm.stage === 'flowering' ? 'பூக்கும் தருணம்' : farm.stage === 'harvest' ? 'அறுவடை' : farm.stage}
                        </span>
                      </div>
                      {farm.soilType && <p className="text-xs text-soil-400 mt-1 tamil-text">மண்: {farm.soilType}</p>}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )
      }

      {/* Soil zone legend */}
      <div className="card mt-5">
        <h3 className="font-display font-semibold text-forest-800 dark:text-forest-200 mb-3 tamil-text">மண் வலய வரைபடம்</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { color: '#8B4513', label: 'செம்மண் பகுதி' },
            { color: '#2D4A1E', label: 'கரிசல் மண் பகுதி' },
            { color: '#DEB887', label: 'வண்டல் மண் பகுதி' },
            { color: '#D2B48C', label: 'மணல் மண் பகுதி' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-xs text-soil-600 dark:text-soil-400 tamil-text">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
