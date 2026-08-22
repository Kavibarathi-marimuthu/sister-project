import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Minus } from 'lucide-react'
import { mockVarieties } from '../../data/mockCrops'
import { StarRating, SectionHeader } from '../ui/UIComponents'
import { useApp } from '../../contexts/AppContext'
import { cn } from '../../lib/utils'

export default function VarietyScreen() {
  const { t } = useApp()
  const { state } = useLocation()
  const cropId = state?.cropId || 'rice'
  const cropName = state?.cropName || 'நெல்'
  const varieties = mockVarieties[cropId] || mockVarieties.rice
  const [compareIds, setCompareIds] = useState([])
  const [view, setView] = useState('cards') // cards | compare

  const toggleCompare = (id) => {
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev
    )
  }

  const compareList = varieties.filter(v => compareIds.includes(v.id))

  const fields = [
    { key: 'duration', label: 'காலம்' },
    { key: 'yield', label: 'மகசூல்' },
    { key: 'water', label: 'தண்ணீர்' },
    { key: 'rating', label: 'மதிப்பீடு' },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 lg:px-6">
      <SectionHeader
        title={`${cropName} — ${t('ரக ஒப்பீடு', 'Variety Comparison')}`}
        subtitle={t('உங்கள் மண் மற்றும் பகுதிக்கு ஏற்ற ரகம் தேர்வு செய்யுங்கள்', 'Choose the best variety for your soil and region')}
      />

      {/* View toggle */}
      <div className="flex gap-1 bg-soil-50 dark:bg-forest-900 rounded-2xl p-1 mb-5">
        {[
          { key: 'cards', label: '🃏 அட்டைகள்', labelEn: 'Cards' },
          { key: 'compare', label: '⚖️ ஒப்பீடு', labelEn: 'Compare' },
        ].map(v => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={cn('flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all tamil-text',
              view === v.key ? 'bg-white dark:bg-forest-800 text-forest-700 dark:text-forest-300 shadow-sm' : 'text-soil-500'
            )}
          >
            {t(v.label, v.labelEn)}
          </button>
        ))}
      </div>

      {compareIds.length > 0 && (
        <div className="flex items-center justify-between bg-forest-50 dark:bg-forest-900 rounded-2xl px-4 py-2.5 mb-4 text-sm">
          <span className="tamil-text text-forest-700 dark:text-forest-300">
            {compareIds.length} ரகங்கள் தேர்ந்தெடுக்கப்பட்டது
          </span>
          <button onClick={() => { setView('compare') }} className="text-forest-600 font-semibold">
            ஒப்பிடு →
          </button>
        </div>
      )}

      {/* Cards view */}
      {view === 'cards' && (
        <div className="flex flex-col gap-4">
          {varieties.map((v, i) => (
            <motion.div key={v.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <div className={cn('card', compareIds.includes(v.id) && 'ring-2 ring-forest-500')}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-bold text-xl text-forest-800 dark:text-forest-200">{v.name}</h3>
                    <StarRating rating={v.rating} />
                  </div>
                  <button
                    onClick={() => toggleCompare(v.id)}
                    className={cn('w-8 h-8 rounded-xl flex items-center justify-center transition-all border-2',
                      compareIds.includes(v.id)
                        ? 'bg-forest-600 border-forest-600 text-white'
                        : 'border-soil-200 dark:border-forest-700 text-soil-400'
                    )}
                  >
                    {compareIds.includes(v.id) ? <Check size={14} /> : <Minus size={14} />}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  {[
                    { label: t('காலம்', 'Duration'), value: v.duration },
                    { label: t('மகசூல்', 'Yield'), value: v.yield },
                    { label: t('தண்ணீர்', 'Water'), value: v.water },
                    { label: t('நோய் எதிர்ப்பு', 'Disease Resist.'), value: v.resistance.join(', ') },
                  ].map(f => (
                    <div key={f.label} className="bg-soil-50 dark:bg-forest-900 rounded-xl p-2.5">
                      <div className="text-xs text-soil-500 tamil-text">{f.label}</div>
                      <div className="font-semibold text-sm text-forest-800 dark:text-forest-200 mt-0.5 tamil-text">{f.value}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {v.resistance.map(r => <span key={r} className="badge-green text-xs">{r} {t('எதிர்ப்பு', 'resistant')}</span>)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Compare table */}
      {view === 'compare' && (
        <div className="card overflow-x-auto">
          {compareList.length < 2 ? (
            <div className="text-center py-10">
              <p className="text-soil-500 tamil-text">குறைந்தது 2 ரகங்களை Cards பக்கத்தில் தேர்வு செய்யுங்கள்</p>
              <button onClick={() => setView('cards')} className="btn-primary mt-4">ரகங்கள் தேர்</button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-soil-100 dark:border-forest-800">
                  <th className="text-left py-2 pr-3 text-soil-500 font-semibold tamil-text">அம்சம்</th>
                  {compareList.map(v => (
                    <th key={v.id} className="text-center py-2 px-2 text-forest-700 dark:text-forest-300 font-bold">{v.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map(f => (
                  <tr key={f.key} className="border-b border-soil-50 dark:border-forest-900">
                    <td className="py-2.5 pr-3 text-soil-600 dark:text-soil-400 font-medium tamil-text">{f.label}</td>
                    {compareList.map(v => (
                      <td key={v.id} className="text-center py-2.5 px-2 text-forest-800 dark:text-forest-200 font-semibold tamil-text">
                        {f.key === 'rating' ? <StarRating rating={v[f.key]} /> : v[f.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
