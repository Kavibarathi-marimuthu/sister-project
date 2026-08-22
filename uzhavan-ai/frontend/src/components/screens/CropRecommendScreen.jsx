import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Droplets, Clock, TrendingUp, Info } from 'lucide-react'
import { mockCropRecommendations } from '../../data/mockCrops'
import { ConfidenceBadge, SectionHeader } from '../ui/UIComponents'
import { useApp } from '../../contexts/AppContext'
import { formatCurrency, cn } from '../../lib/utils'

export default function CropRecommendScreen() {
  const { t } = useApp()
  const [selected, setSelected] = useState(null)

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 lg:px-6">
      <SectionHeader
        title={t('AI பயிர் பரிந்துரை', 'AI Crop Recommendation')}
        subtitle={t('மண் + வானிலை + பருவம் அடிப்படையில்', 'Based on soil, weather & season')}
      />

      {/* Context chips */}
      <div className="flex gap-2 flex-wrap mb-5">
        {[
          { icon: '🧪', label: 'மண்: செம்மண் · pH 6.5' },
          { icon: '🌧️', label: 'பருவம்: குரோவை' },
          { icon: '🌡️', label: 'வெப்பம்: 32°C' },
        ].map(c => (
          <span key={c.label} className="flex items-center gap-1.5 bg-white dark:bg-forest-900 border border-soil-100 dark:border-forest-800 text-soil-600 dark:text-soil-400 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
            {c.icon} <span className="tamil-text">{c.label}</span>
          </span>
        ))}
      </div>

      {/* Crop cards */}
      <div className="flex flex-col gap-4">
        {mockCropRecommendations.map((crop, i) => (
          <motion.div
            key={crop.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <div
              className={cn('card cursor-pointer transition-all', selected === crop.id && 'ring-2 ring-forest-500')}
              onClick={() => setSelected(selected === crop.id ? null : crop.id)}
            >
              {/* Top row */}
              <div className="flex gap-4 items-start">
                <div className="w-16 h-16 bg-forest-50 dark:bg-forest-900 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0">
                  {crop.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display font-bold text-xl text-forest-800 dark:text-forest-200 tamil-text">{crop.name}</h3>
                      <p className="text-sm text-soil-500">{crop.nameEn} · {crop.season}</p>
                    </div>
                    {i === 0 && <span className="badge-green flex-shrink-0">🏆 சிறந்த பரிந்துரை</span>}
                  </div>
                  <div className="mt-2">
                    <ConfidenceBadge score={crop.confidence} />
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="bg-soil-50 dark:bg-forest-900 rounded-xl p-2.5 text-center">
                  <Clock size={14} className="text-soil-400 mx-auto mb-1" />
                  <div className="text-xs font-semibold text-forest-800 dark:text-forest-200 tamil-text">{crop.duration}</div>
                  <div className="text-xs text-soil-400">{t('காலம்', 'Duration')}</div>
                </div>
                <div className="bg-soil-50 dark:bg-forest-900 rounded-xl p-2.5 text-center">
                  <Droplets size={14} className="text-sky-400 mx-auto mb-1" />
                  <div className="text-xs font-semibold text-forest-800 dark:text-forest-200 tamil-text">{crop.waterRequirement}</div>
                  <div className="text-xs text-soil-400">{t('தண்ணீர்', 'Water')}</div>
                </div>
                <div className="bg-soil-50 dark:bg-forest-900 rounded-xl p-2.5 text-center">
                  <TrendingUp size={14} className="text-leaf-500 mx-auto mb-1" />
                  <div className="text-xs font-semibold text-forest-800 dark:text-forest-200">₹{(crop.profitEstimate / 1000).toFixed(0)}k</div>
                  <div className="text-xs text-soil-400">{t('இலாபம்', 'Profit')}</div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex gap-2 mt-3 flex-wrap">
                {crop.tags.map(tag => <span key={tag} className="badge-blue text-xs tamil-text">{tag}</span>)}
              </div>

              {/* Expandable AI reason */}
              <AnimatePresence>
                {selected === crop.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-soil-100 dark:border-forest-800">
                      <div className="flex items-start gap-2 bg-forest-50 dark:bg-forest-900 rounded-2xl p-3">
                        <span className="text-lg flex-shrink-0">🤖</span>
                        <div>
                          <p className="text-xs font-semibold text-forest-600 dark:text-forest-400 mb-1">AI விளக்கம்</p>
                          <p className="text-sm text-forest-800 dark:text-forest-200 tamil-text leading-relaxed">{crop.aiReason}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Link
                          to="/crops/varieties"
                          state={{ cropId: crop.id, cropName: crop.name }}
                          className="btn-primary flex-1 text-center text-sm"
                        >
                          {t('ரகங்கள் பார்', 'View Varieties')}
                        </Link>
                        <Link
                          to="/crops/seed-plan"
                          state={{ crop }}
                          className="btn-secondary flex-1 text-center text-sm"
                        >
                          {t('விதை திட்டம்', 'Seed Plan')}
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Expand indicator */}
              <div className="flex items-center justify-center mt-3">
                <ChevronRight
                  size={16}
                  className={cn('text-soil-400 transition-transform', selected === crop.id && 'rotate-90')}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
