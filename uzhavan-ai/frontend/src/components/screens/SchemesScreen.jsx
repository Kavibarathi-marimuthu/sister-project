import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ChevronDown, ChevronUp, ExternalLink, Check } from 'lucide-react'
import { mockSchemes, mockExperts } from '../../data/mockSchemes'
import { SectionHeader, Card } from '../ui/UIComponents'
import { useApp } from '../../contexts/AppContext'
import { cn } from '../../lib/utils'

const categoryColors = {
  income: 'badge-green',
  credit: 'badge-blue',
  insurance: 'badge-yellow',
  advisory: 'bg-purple-100 text-purple-700 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full',
}

const categoryLabels = {
  income: 'வருமானம்',
  credit: 'கடன்',
  insurance: 'காப்பீடு',
  advisory: 'ஆலோசனை',
}

export default function SchemesScreen() {
  const { t, addToast } = useApp()
  const [tab, setTab] = useState('schemes') // schemes | experts
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState({})
  const [bookedSlots, setBookedSlots] = useState({})

  const filtered = mockSchemes.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.nameTa.includes(search)
  )

  const bookSlot = (expertId, slot) => {
    setBookedSlots(b => ({ ...b, [expertId]: slot }))
    addToast('நிபுணர் ஆலோசனை பதிவு முடிந்தது! 📅', 'success')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 lg:px-6">
      <SectionHeader
        title={t('அரசு திட்டங்கள்', 'Government Schemes')}
        subtitle={t('விண்ணப்பம் + நிபுணர் ஆலோசனை', 'Apply + Expert Consultation')}
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-soil-50 dark:bg-forest-900 rounded-2xl p-1 mb-5">
        {[
          { key: 'schemes', label: '🏛️ திட்டங்கள்', labelEn: 'Schemes' },
          { key: 'experts', label: '👨‍🔬 நிபுணர்கள்', labelEn: 'Experts' },
        ].map(t_ => (
          <button key={t_.key} onClick={() => setTab(t_.key)}
            className={cn('flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all tamil-text', tab === t_.key ? 'bg-white dark:bg-forest-800 text-forest-700 dark:text-forest-300 shadow-sm' : 'text-soil-500')}>
            {t(t_.label, t_.labelEn)}
          </button>
        ))}
      </div>

      {tab === 'schemes' && (
        <div>
          {/* Search */}
          <div className="relative mb-5">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-soil-400" />
            <input
              className="input-field pl-11 tamil-text"
              placeholder="திட்டம் தேட..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Scheme cards */}
          <div className="flex flex-col gap-3">
            {filtered.map((scheme, i) => {
              const isExpanded = expanded === scheme.id
              return (
                <motion.div key={scheme.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card>
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : scheme.id)}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="font-bold text-forest-800 dark:text-forest-200 tamil-text">{scheme.nameTa}</h4>
                          <span className={categoryColors[scheme.category]}>{categoryLabels[scheme.category]}</span>
                          {scheme.status === 'open' && <span className="badge-green">✅ திறந்துள்ளது</span>}
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="font-bold text-forest-600 tamil-text">{scheme.amount}</span>
                          <span className="text-soil-400 tamil-text text-xs">⏰ {scheme.deadline}</span>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp size={18} className="text-soil-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-soil-400 flex-shrink-0" />}
                    </div>

                    {/* Expanded */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                          <div className="mt-3 pt-3 border-t border-soil-100 dark:border-forest-800">
                            <p className="text-sm text-forest-800 dark:text-forest-200 tamil-text leading-relaxed mb-3">{scheme.benefits}</p>
                            <div className="mb-3">
                              <h5 className="text-xs font-bold text-soil-500 uppercase mb-1.5 tamil-text">தகுதி நிலைமைகள்</h5>
                              <div className="flex flex-col gap-1">
                                {scheme.eligibility.map((e, j) => (
                                  <div key={j} className="flex gap-2 items-start">
                                    <Check size={14} className="text-leaf-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-soil-600 dark:text-soil-400 tamil-text">{e}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="mb-3">
                              <h5 className="text-xs font-bold text-soil-500 uppercase mb-1.5 tamil-text">தேவையான ஆவணங்கள்</h5>
                              <div className="flex flex-wrap gap-1.5">
                                {scheme.documents.map(d => <span key={d} className="badge-blue tamil-text">{d}</span>)}
                              </div>
                            </div>
                            <button className="btn-primary w-full flex items-center justify-center gap-2 text-sm">
                              <ExternalLink size={14} /> {t('இப்போது விண்ணப்பிக்கவும்', 'Apply Now')}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'experts' && (
        <div className="flex flex-col gap-4">
          {mockExperts.map((expert, i) => (
            <motion.div key={expert.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-forest-400 to-leaf-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {expert.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-forest-800 dark:text-forest-200 tamil-text">{expert.name}</h4>
                    <p className="text-sm text-soil-500 tamil-text">{expert.specialty}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-wheat-500">{'★'.repeat(Math.round(expert.rating))}</span>
                      <span className="text-xs text-soil-500">{expert.rating}</span>
                      <span className={cn('badge-green text-xs', !expert.available && 'badge-red')}>
                        {expert.available ? '🟢 கிடைக்கிறார்' : '🔴 கிடைக்கவில்லை'}
                      </span>
                    </div>
                  </div>
                </div>
                {expert.available && (
                  <div>
                    <p className="text-xs font-semibold text-soil-500 mb-2 tamil-text">நேர வாய்ப்புகள்</p>
                    <div className="flex gap-2 flex-wrap mb-3">
                      {expert.slots.map(slot => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(s => ({ ...s, [expert.id]: slot }))}
                          className={cn('px-3 py-1.5 rounded-xl text-sm font-semibold transition-all', selectedSlot[expert.id] === slot ? 'bg-forest-600 text-white' : 'bg-soil-100 dark:bg-forest-900 text-soil-600 dark:text-soil-400 hover:bg-forest-100')}
                        >{slot}</button>
                      ))}
                    </div>
                    <button
                      onClick={() => selectedSlot[expert.id] && bookSlot(expert.id, selectedSlot[expert.id])}
                      disabled={!selectedSlot[expert.id]}
                      className={cn('btn-primary w-full text-sm', !selectedSlot[expert.id] && 'opacity-50 cursor-not-allowed')}
                    >
                      {bookedSlots[expert.id] ? `✅ பதிவு: ${bookedSlots[expert.id]}` : t('ஆலோசனை பதிவு செய்', 'Book Consultation')}
                    </button>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
