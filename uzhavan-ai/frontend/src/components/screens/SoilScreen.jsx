import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Camera, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { GaugeChart, ProgressBar, SectionHeader, Card } from '../ui/UIComponents'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'

const soilParams = [
  { key: 'nitrogen', label: 'நைட்ரஜன் (N)', unit: 'kg/ha', min: 0, max: 280, low: 140, high: 280, color: 'bg-leaf-500' },
  { key: 'phosphorus', label: 'பாஸ்பரஸ் (P)', unit: 'kg/ha', min: 0, max: 56, low: 11, high: 56, color: 'bg-wheat-500' },
  { key: 'potassium', label: 'பொட்டாசியம் (K)', unit: 'kg/ha', min: 0, max: 336, low: 108, high: 336, color: 'bg-forest-500' },
  { key: 'pH', label: 'pH மதிப்பு', unit: '', min: 0, max: 14, low: 6, high: 8, color: 'bg-sky-500' },
  { key: 'organicCarbon', label: 'கரிமப் பொருள் (%)', unit: '%', min: 0, max: 1.2, low: 0.5, high: 1.2, color: 'bg-soil-500' },
]

const defaultValues = { nitrogen: 180, phosphorus: 28, potassium: 220, pH: 6.5, organicCarbon: 0.72 }

export default function SoilScreen() {
  const { t, addToast } = useApp()
  const { farmerProfile } = useAuth()
  const [mode, setMode] = useState('manual') // manual | ocr
  const [values, setValues] = useState(defaultValues)
  const [analyzed, setAnalyzed] = useState(false)
  const [ocrFile, setOcrFile] = useState(null)
  const [ocrLoading, setOcrLoading] = useState(false)
  const fileRef = useRef()

  const soilScore = Math.round(
    ((values.nitrogen / 280) * 30) +
    ((values.phosphorus / 56) * 20) +
    ((values.potassium / 336) * 20) +
    ((1 - Math.abs(values.pH - 7) / 7) * 20) +
    ((values.organicCarbon / 1.2) * 10)
  )

  const getStatus = (key, val) => {
    const p = soilParams.find(s => s.key === key)
    if (!p) return 'medium'
    if (val < p.low * 0.5) return 'low'
    if (val > p.high * 1.1) return 'high'
    return 'optimal'
  }

  const statusLabel = { low: { ta: 'குறைவு', en: 'Low', cls: 'badge-red' }, optimal: { ta: 'சரியானது', en: 'Optimal', cls: 'badge-green' }, high: { ta: 'அதிகம்', en: 'High', cls: 'badge-yellow' } }

  const handleOcrUpload = async (file) => {
    setOcrFile(file)
    setOcrLoading(true)
    // Mock OCR extraction
    await new Promise(r => setTimeout(r, 1800))
    setValues({ nitrogen: 165, phosphorus: 22, potassium: 195, pH: 6.8, organicCarbon: 0.65 })
    setOcrLoading(false)
    setMode('manual')
    setAnalyzed(true)
    addToast('OCR மூலம் மண் தகவல் பிரித்தெடுக்கப்பட்டது! 🧪', 'success')
  }

  const handleAnalyze = () => {
    setAnalyzed(true)
    addToast('மண் பகுப்பாய்வு முடிந்தது! ✅', 'success')
  }

  const scoreColor = soilScore >= 70 ? '#1a7d2e' : soilScore >= 40 ? '#d49b0c' : '#dc2626'
  const scoreLabel = soilScore >= 70 ? 'நல்ல மண்' : soilScore >= 40 ? 'சராசரி மண்' : 'மண் பராமரிப்பு தேவை'

  const recommendations = []
  if (values.nitrogen < 140) recommendations.push({ icon: '💚', text: 'யூரியா உரம் 50 கிலோ/ஏக்கர் சேர்க்கவும்', priority: 'high' })
  if (values.phosphorus < 11) recommendations.push({ icon: '🟡', text: 'டைஅமோனியம் பாஸ்பேட் (DAP) சேர்க்கவும்', priority: 'medium' })
  if (values.pH < 6) recommendations.push({ icon: '⚗️', text: 'மண் pH அதிகரிக்க சுண்ணாம்பு சேர்க்கவும்', priority: 'high' })
  if (values.organicCarbon < 0.5) recommendations.push({ icon: '🌿', text: 'மண் கரிமப் பொருள் அதிகரிக்க மண்புழு உரம் சேர்க்கவும்', priority: 'medium' })
  if (recommendations.length === 0) recommendations.push({ icon: '✅', text: 'மண் ஆரோக்கியமாக உள்ளது. தொடர்ந்து கவனிக்கவும்.', priority: 'low' })

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 lg:px-6">
      <SectionHeader
        title={t('மண் பகுப்பாய்வு', 'Soil Analysis')}
        subtitle={t('N-P-K, pH மற்றும் கரிமப் பொருள் சோதனை', 'N-P-K, pH and organic matter test')}
      />

      {/* Mode tabs */}
      <div className="flex gap-1 bg-soil-50 dark:bg-forest-900 rounded-2xl p-1 mb-5">
        {[
          { key: 'manual', label: '✏️ கைமுறை உள்ளீடு', labelEn: 'Manual Entry' },
          { key: 'ocr', label: '📄 அறிக்கை ஸ்கேன்', labelEn: 'Scan Report' },
        ].map(m => (
          <button key={m.key} onClick={() => setMode(m.key)} className={cn('flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all tamil-text', mode === m.key ? 'bg-white dark:bg-forest-800 text-forest-700 dark:text-forest-300 shadow-sm' : 'text-soil-500')}>
            {t(m.label, m.labelEn)}
          </button>
        ))}
      </div>

      {/* OCR mode */}
      <AnimatePresence>
        {mode === 'ocr' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="card mb-5">
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-forest-300 dark:border-forest-700 rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:bg-forest-50 dark:hover:bg-forest-900 transition-all"
            >
              <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => e.target.files?.[0] && handleOcrUpload(e.target.files[0])} />
              <div className="w-16 h-16 bg-forest-100 dark:bg-forest-900 rounded-2xl flex items-center justify-center text-3xl">📄</div>
              {ocrLoading ? (
                <div className="text-center">
                  <div className="text-forest-600 font-semibold tamil-text">OCR பகுப்பாய்வு நடக்கிறது...</div>
                  <div className="flex gap-1.5 justify-center mt-2">
                    {[0,1,2].map(i => <motion.div key={i} className="w-2 h-2 bg-forest-400 rounded-full" animate={{ y: [0,-6,0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />)}
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <p className="font-semibold text-forest-800 dark:text-forest-200 tamil-text">மண் அறிக்கை பதிவேற்றவும்</p>
                    <p className="text-sm text-soil-500 tamil-text mt-1">AI மூலம் N-P-K தானாக பிரித்தெடுக்கப்படும்</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="badge-green">JPG / PNG</span>
                    <span className="badge-blue">PDF</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual entry */}
      <div className="card mb-5">
        <h3 className="font-display font-semibold text-forest-800 dark:text-forest-200 mb-4 tamil-text">மண் தகவல் உள்ளீடு</h3>
        <div className="flex flex-col gap-4">
          {soilParams.map(param => (
            <div key={param.key}>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-semibold text-soil-600 dark:text-soil-400 tamil-text">{param.label}</label>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-forest-700">{values[param.key]}{param.unit}</span>
                  <span className={statusLabel[getStatus(param.key, values[param.key])].cls + ' text-xs tamil-text'}>
                    {t(statusLabel[getStatus(param.key, values[param.key])].ta, statusLabel[getStatus(param.key, values[param.key])].en)}
                  </span>
                </div>
              </div>
              <input
                type="range" min={param.min} max={param.max} step={param.max > 100 ? 5 : 0.1}
                value={values[param.key]}
                onChange={e => setValues(v => ({ ...v, [param.key]: parseFloat(e.target.value) }))}
                className="w-full accent-forest-600 h-2"
              />
              <div className="flex justify-between text-xs text-soil-400 mt-0.5">
                <span>{param.min}</span>
                <span>{param.max}</span>
              </div>
            </div>
          ))}
        </div>
        <button onClick={handleAnalyze} className="btn-primary w-full mt-5">
          {t('பகுப்பாய்வு செய்', 'Analyze Soil')}
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {analyzed && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
            {/* Gauge */}
            <Card>
              <h3 className="font-display font-bold text-center text-forest-800 dark:text-forest-200 mb-4 tamil-text">மண் ஆரோக்கிய மதிப்பீடு</h3>
              <div className="flex justify-center">
                <GaugeChart value={soilScore} label={scoreLabel} color={scoreColor} size={200} />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                {soilParams.slice(0,3).map(p => {
                  const pct = Math.round((values[p.key] / p.max) * 100)
                  return (
                    <div key={p.key} className="text-center">
                      <div className="text-lg font-bold text-forest-700">{values[p.key]}</div>
                      <div className="text-xs text-soil-500 tamil-text">{p.label.split(' ')[0]}</div>
                      <ProgressBar value={pct} max={100} color={p.color} className="mt-1" />
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Recommendations */}
            <Card>
              <h3 className="font-display font-bold text-forest-800 dark:text-forest-200 mb-3 tamil-text">AI பரிந்துரைகள்</h3>
              <div className="flex flex-col gap-2.5">
                {recommendations.map((r, i) => (
                  <div key={i} className={cn('flex gap-3 p-3 rounded-2xl', r.priority === 'high' ? 'bg-red-50 dark:bg-red-950/30' : r.priority === 'medium' ? 'bg-wheat-50 dark:bg-wheat-950/30' : 'bg-leaf-50 dark:bg-leaf-950/30')}>
                    <span className="text-xl">{r.icon}</span>
                    <p className="text-sm text-forest-800 dark:text-forest-200 tamil-text">{r.text}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Next step */}
            <div className="card bg-forest-50 dark:bg-forest-900 border-forest-200 dark:border-forest-700">
              <p className="text-sm text-forest-800 dark:text-forest-200 tamil-text font-medium">
                🌾 மண் பகுப்பாய்வின் அடிப்படையில் AI பயிர் பரிந்துரையை பெறுங்கள்
              </p>
              <a href="/crops" className="btn-primary inline-flex items-center gap-2 mt-3 text-sm">
                பயிர் பரிந்துரை பெறு →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
