import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, Share2 } from 'lucide-react'
import { SectionHeader, Card } from '../ui/UIComponents'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { formatCurrency } from '../../lib/utils'

const SEED_RATES = { rice: 20, banana: 0, sugarcane: 6000, tomato: 0.25, cotton: 4 }
const FERT_RATES = { N: 120, P: 60, K: 60 } // kg/ha
const FERT_PRICES = { urea: 6, dap: 27, mop: 17 } // ₹/kg

export default function SeedPlanScreen() {
  const { t, addToast } = useApp()
  const { farmerProfile } = useAuth()
  const { state } = useLocation()
  const crop = state?.crop || { id: 'rice', name: 'நெல்', nameEn: 'Rice', emoji: '🌾' }
  const area = farmerProfile?.farms?.[0]?.area || 2

  const seedRate = SEED_RATES[crop.id] || 20
  const seedQty = (seedRate * area).toFixed(1)
  const seedCost = seedQty * 65

  // Fertilizer calculation
  const ureaKg = Math.round((FERT_RATES.N / 0.46) * area * 0.01) // convert to quintals/ha→kg
  const dapKg = Math.round((FERT_RATES.P / 0.46) * area * 0.01)
  const mopKg = Math.round((FERT_RATES.K / 0.6) * area * 0.01)
  const fertCost = ureaKg * FERT_PRICES.urea + dapKg * FERT_PRICES.dap + mopKg * FERT_PRICES.mop

  const pestCost = Math.round(area * 1200)
  const laborCost = Math.round(area * 4000)
  const totalCost = Math.round(seedCost + fertCost + pestCost + laborCost)

  const schedule = [
    { stage: 'விதைப்பு', stageEn: 'Sowing', day: 'நாள் 1', items: [`விதை ${seedQty} கிலோ (வீரிய கலப்பினம்)`], cost: Math.round(seedCost) },
    { stage: 'அடியுரம்', stageEn: 'Basal Fertilizer', day: 'நாள் 3', items: [`DAP ${dapKg} கிலோ`, `MOP ${mopKg} கிலோ`, `யூரியா ${Math.round(ureaKg * 0.3)} கிலோ`], cost: Math.round(fertCost * 0.6) },
    { stage: 'தளியுரம் 1', stageEn: 'Top Dressing 1', day: 'நாள் 25', items: [`யூரியா ${Math.round(ureaKg * 0.4)} கிலோ`], cost: Math.round(fertCost * 0.25) },
    { stage: 'தளியுரம் 2', stageEn: 'Top Dressing 2', day: 'நாள் 45', items: [`யூரியா ${Math.round(ureaKg * 0.3)} கிலோ`, `MOP ${Math.round(mopKg * 0.3)} கிலோ`], cost: Math.round(fertCost * 0.15) },
    { stage: 'பூச்சி மேலாண்மை', stageEn: 'Pest Management', day: 'தேவைக்கேற்ப', items: ['கார்போஃபியூரான் 3G', 'குளோர்பைரிஃபாஸ்'], cost: pestCost },
  ]

  const handleShare = () => {
    const text = `🌾 ${crop.name} விதை & உரத் திட்டம்\nநில அளவு: ${area} ஏக்கர்\nமொத்த செலவு: ₹${formatCurrency(totalCost)}`
    if (navigator.share) {
      navigator.share({ title: 'Uzhavan AI - விதை திட்டம்', text })
    } else {
      navigator.clipboard.writeText(text)
      addToast('திட்டம் நகலெடுக்கப்பட்டது! 📋', 'success')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 lg:px-6">
      <SectionHeader
        title={t('விதை & உரத் திட்டம்', 'Seed & Fertilizer Plan')}
        subtitle={`${crop.name} · ${area} ஏக்கர்`}
        action={
          <div className="flex gap-2">
            <button onClick={handleShare} className="btn-ghost p-2.5"><Share2 size={18} /></button>
            <button onClick={() => window.print()} className="btn-ghost p-2.5"><Download size={18} /></button>
          </div>
        }
      />

      {/* Cost summary */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card mb-5 bg-gradient-to-br from-forest-50 to-leaf-50 dark:from-forest-900 dark:to-leaf-950 border-forest-200 dark:border-forest-700">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{crop.emoji}</span>
          <div>
            <h3 className="font-display font-bold text-xl text-forest-800 dark:text-forest-200 tamil-text">{crop.name}</h3>
            <p className="text-soil-500 text-sm">{area} ஏக்கர் · மொத்த முதலீடு மதிப்பீடு</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'விதை செலவு', value: Math.round(seedCost), icon: '🌱' },
            { label: 'உர செலவு', value: fertCost, icon: '💊' },
            { label: 'பூச்சிக்கொல்லி', value: pestCost, icon: '🧴' },
            { label: 'தொழிலாளர்', value: laborCost, icon: '👷' },
          ].map(item => (
            <div key={item.label} className="bg-white/60 dark:bg-forest-900/60 rounded-2xl p-3">
              <div className="text-lg mb-1">{item.icon}</div>
              <div className="font-bold text-forest-800 dark:text-forest-200">₹{item.value.toLocaleString('en-IN')}</div>
              <div className="text-xs text-soil-500 tamil-text">{item.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-forest-200 dark:border-forest-700 flex items-center justify-between">
          <span className="font-bold text-lg text-forest-800 dark:text-forest-200 tamil-text">மொத்த செலவு</span>
          <span className="font-display text-2xl font-bold text-forest-700">₹{totalCost.toLocaleString('en-IN')}</span>
        </div>
      </motion.div>

      {/* Schedule */}
      <h3 className="font-display font-bold text-forest-800 dark:text-forest-200 mb-3 tamil-text">கட்டம் கட்டமான திட்டம்</h3>
      <div className="flex flex-col gap-3">
        {schedule.map((s, i) => (
          <motion.div key={s.stage} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
            <Card>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-forest-600 text-white rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0">{i + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-forest-800 dark:text-forest-200 tamil-text">{s.stage}</h4>
                    <span className="badge-green text-xs">{s.day}</span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {s.items.map(item => (
                      <li key={item} className="text-sm text-soil-600 dark:text-soil-400 flex items-center gap-2 tamil-text">
                        <span className="w-1.5 h-1.5 rounded-full bg-forest-400 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="text-xs font-semibold text-wheat-600 mt-2">₹{s.cost.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
