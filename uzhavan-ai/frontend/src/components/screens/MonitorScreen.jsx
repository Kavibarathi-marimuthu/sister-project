import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, Plus, TrendingUp } from 'lucide-react'
import { SectionHeader, Card, ProgressBar } from '../ui/UIComponents'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'

const photoJournal = [
  { id: 'p1', date: '15 டிசம்பர்', stage: 'நடவு', emoji: '🌱', note: 'நடவு முடிந்தது. செடிகள் நன்றாக உள்ளன.' },
  { id: 'p2', date: '28 டிசம்பர்', stage: 'வளர்ச்சி', emoji: '🌿', note: 'பசுமையாக வளர்கிறது. களை நீக்கினோம்.' },
  { id: 'p3', date: '10 ஜனவரி', stage: 'வளர்ச்சி', emoji: '🌾', note: 'யூரியா தெளித்தோம். வளர்ச்சி நல்லது.' },
]

const growthStages = [
  { name: 'நடவு', icon: '🌱', pct: 100, date: 'டிசம்பர் 15' },
  { name: 'வளர்ச்சி', icon: '🌿', pct: 70, date: 'ஜனவரி 5' },
  { name: 'பூக்கும் தருணம்', icon: '🌸', pct: 0, date: 'பிப்ரவரி 1 (எதிர்பார்ப்பு)' },
  { name: 'பழுத்தல்', icon: '✨', pct: 0, date: 'மார்ச் 1 (எதிர்பார்ப்பு)' },
  { name: 'அறுவடை', icon: '🎉', pct: 0, date: 'மார்ச் 20 (எதிர்பார்ப்பு)' },
]

export default function MonitorScreen() {
  const { t, addToast } = useApp()
  const { farmerProfile } = useAuth()
  const [note, setNote] = useState('')
  const [photos, setPhotos] = useState(photoJournal)
  const fileRef = useRef()

  const handlePhoto = (file) => {
    const newPhoto = {
      id: `p${Date.now()}`,
      date: new Date().toLocaleDateString('ta-IN', { day: 'numeric', month: 'long' }),
      stage: 'வளர்ச்சி',
      emoji: '📸',
      note: note || 'புதிய பதிவு',
      url: URL.createObjectURL(file),
    }
    setPhotos(prev => [newPhoto, ...prev])
    setNote('')
    addToast('புகைப்படம் சேர்க்கப்பட்டது! 📸', 'success')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 lg:px-6">
      <SectionHeader
        title={t('பயிர் கண்காணிப்பு', 'Crop Monitoring')}
        subtitle={t('வளர்ச்சி நிலை + புகைப்பட டயரி', 'Growth stage + photo diary')}
      />

      {/* Growth timeline */}
      <Card className="mb-5">
        <h3 className="font-display font-bold text-forest-800 dark:text-forest-200 mb-4 tamil-text">வளர்ச்சி நிலை கண்காணிப்பு</h3>
        <div className="flex justify-between items-end mb-2">
          {growthStages.map((stage, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <span className={cn('text-2xl', stage.pct === 0 ? 'opacity-30' : '')}>{stage.icon}</span>
              <div className="w-full px-0.5">
                <div className="h-2 bg-soil-100 dark:bg-forest-900 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stage.pct}%` }}
                    transition={{ delay: i * 0.1, duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-forest-400 to-leaf-500 rounded-full"
                  />
                </div>
              </div>
              <span className={cn('text-xs text-center leading-tight tamil-text', stage.pct > 0 ? 'text-forest-700 dark:text-forest-300 font-semibold' : 'text-soil-400')}>{stage.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 p-3 bg-forest-50 dark:bg-forest-900 rounded-2xl">
          <p className="text-sm text-forest-800 dark:text-forest-200 tamil-text font-medium">
            🌾 தற்போதைய நிலை: <strong>வளர்ச்சி காலம் (70%)</strong>
          </p>
          <p className="text-xs text-soil-500 mt-0.5 tamil-text">பூக்கும் தருணம் — 22 நாட்களில் எதிர்பார்க்கப்படுகிறது</p>
        </div>
      </Card>

      {/* Digital Farm Twin teaser */}
      <div className="card mb-5 bg-gradient-to-br from-forest-600 to-leaf-600 text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 opacity-10 text-[120px] leading-none">🌾</div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full">🔮 விரைவில்</span>
          </div>
          <h3 className="font-display font-bold text-xl tamil-text">டிஜிட்டல் பண்ண இரட்டையர்</h3>
          <p className="text-sm text-white/80 mt-1 tamil-text">உங்கள் வயலின் நேரடி டிஜிட்டல் பிரதி — IoT சென்சார் + AI + Live Dashboard</p>
          <div className="flex gap-2 mt-3">
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">🌡️ மண் வெப்பம்</span>
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">💧 ஈரப்பதம்</span>
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full">☀️ சூரிய ஒளி</span>
          </div>
        </div>
      </div>

      {/* Photo diary add */}
      <div className="card mb-4">
        <h3 className="font-display font-bold text-forest-800 dark:text-forest-200 mb-3 tamil-text">📸 புகைப்பட டயரி</h3>
        <div className="flex gap-2">
          <input
            className="input-field flex-1 text-sm tamil-text"
            placeholder="குறிப்பு எழுதுங்கள்..."
            value={note}
            onChange={e => setNote(e.target.value)}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="btn-primary flex items-center gap-2 flex-shrink-0 text-sm"
          >
            <Camera size={16} /> எடு
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={e => e.target.files?.[0] && handlePhoto(e.target.files[0])} />
        </div>
      </div>

      {/* Photo entries */}
      <div className="flex flex-col gap-3">
        {photos.map((photo, i) => (
          <motion.div key={photo.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <div className="flex gap-3">
                {photo.url
                  ? <img src={photo.url} alt="" className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" />
                  : <div className="w-16 h-16 bg-forest-50 dark:bg-forest-900 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">{photo.emoji}</div>
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="badge-green tamil-text text-xs">{photo.stage}</span>
                    <span className="text-xs text-soil-400 tamil-text">{photo.date}</span>
                  </div>
                  <p className="text-sm text-forest-800 dark:text-forest-200 mt-1 tamil-text">{photo.note}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
