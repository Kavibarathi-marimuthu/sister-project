import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Plus, X } from 'lucide-react'
import { mockMandiPrices, mockListings } from '../../data/mockMarket'
import { SectionHeader, Card, EmptyState } from '../ui/UIComponents'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'

export default function MarketScreen() {
  const { t, addToast } = useApp()
  const { farmerProfile } = useAuth()
  const [tab, setTab] = useState('prices') // prices | listings
  const [selectedCrop, setSelectedCrop] = useState(mockMandiPrices[0])
  const [showListingForm, setShowListingForm] = useState(false)
  const [listing, setListing] = useState({ crop: '', qty: '', price: '', location: farmerProfile?.village || '' })

  const handleCreateListing = () => {
    if (!listing.crop || !listing.qty || !listing.price) {
      addToast('அனைத்து விவரங்களும் தேவை', 'error')
      return
    }
    addToast('விற்பனை பட்டியல் சேர்க்கப்பட்டது! 🎉', 'success')
    setShowListingForm(false)
    setListing({ crop: '', qty: '', price: '', location: farmerProfile?.village || '' })
  }

  const trendData = selectedCrop.trend.map((price, i) => ({
    day: `நாள் ${i * 5 + 1}`,
    price,
  }))

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 lg:px-6">
      <SectionHeader
        title={t('சந்தை விலை', 'Market Prices')}
        subtitle={t('நேரடி மண்டி விலை + விற்பனை', 'Live mandi prices + sell produce')}
        action={
          tab === 'listings'
            ? <button onClick={() => setShowListingForm(true)} className="btn-primary flex items-center gap-1.5 text-sm"><Plus size={16} /> {t('பட்டியல்', 'List')}</button>
            : null
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-soil-50 dark:bg-forest-900 rounded-2xl p-1 mb-5">
        {[
          { key: 'prices', label: '📊 மண்டி விலை', labelEn: 'Mandi Prices' },
          { key: 'listings', label: '🛒 விற்பனை', labelEn: 'Sell Produce' },
        ].map(t_ => (
          <button key={t_.key} onClick={() => setTab(t_.key)} className={cn('flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all tamil-text', tab === t_.key ? 'bg-white dark:bg-forest-800 text-forest-700 dark:text-forest-300 shadow-sm' : 'text-soil-500')}>
            {t(t_.label, t_.labelEn)}
          </button>
        ))}
      </div>

      {tab === 'prices' && (
        <div>
          {/* Price ticker */}
          <div className="flex flex-col gap-2 mb-5">
            {mockMandiPrices.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <button
                  onClick={() => setSelectedCrop(item)}
                  className={cn('w-full card text-left transition-all', selectedCrop.id === item.id ? 'border-2 border-forest-500 ring-2 ring-forest-100 dark:ring-forest-900' : 'hover:shadow-card-hover')}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-forest-800 dark:text-forest-200 tamil-text">{item.crop}</div>
                      <div className="text-xs text-soil-500 tamil-text">{item.mandi}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-display font-bold text-xl text-forest-800 dark:text-forest-200">₹{item.price}</div>
                      <div className="text-xs text-soil-400 tamil-text">/{item.unit}</div>
                    </div>
                    <div className={cn('flex flex-col items-end flex-shrink-0 ml-1', item.change >= 0 ? 'text-leaf-600' : 'text-red-500')}>
                      {item.change >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                      <span className="text-xs font-bold">{item.change >= 0 ? '+' : ''}{item.changePct}%</span>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>

          {/* Trend chart — inline SVG */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-sm text-forest-800 dark:text-forest-200 tamil-text">
                {selectedCrop.emoji} {selectedCrop.crop} — 7 நாள் விலை போக்கு
              </h3>
              <span className={cn('text-sm font-bold', selectedCrop.change >= 0 ? 'text-leaf-600' : 'text-red-500')}>
                {selectedCrop.change >= 0 ? '↑' : '↓'} {Math.abs(selectedCrop.changePct)}%
              </span>
            </div>
            {(() => {
              const prices = selectedCrop.trend
              const minP = Math.min(...prices), maxP = Math.max(...prices)
              const W = 300, H = 100, padL = 36, padB = 18
              const x = (i) => padL + (i / (prices.length - 1)) * (W - padL - 8)
              const y = (v) => H - ((v - minP) / (maxP - minP || 1)) * (H - 10) + 5
              const pathD = prices.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
              const color = selectedCrop.change >= 0 ? '#1a7d2e' : '#dc2626'
              return (
                <svg viewBox={`0 0 ${W} ${H + padB}`} className="w-full h-36">
                  <defs>
                    <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity="0.15" />
                      <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={`${pathD} L${x(prices.length-1).toFixed(1)},${H} L${x(0).toFixed(1)},${H} Z`}
                    fill="url(#priceGrad)" />
                  <path d={pathD} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
                  {prices.map((v, i) => (
                    <text key={i} x={x(i)} y={H + 14} textAnchor="middle" fontSize={8} fill="#6b6459">
                      {i === 0 ? 'D1' : i === prices.length - 1 ? 'আজ' : ''}
                    </text>
                  ))}
                  <text x={padL - 2} y={y(maxP)} fontSize={8} fill="#6b6459" textAnchor="end">₹{maxP}</text>
                  <text x={padL - 2} y={y(minP)} fontSize={8} fill="#6b6459" textAnchor="end">₹{minP}</text>
                  <circle cx={x(prices.length - 1)} cy={y(prices[prices.length - 1])} r={5} fill={color} />
                </svg>
              )
            })()}
            <div className="flex gap-3 mt-2">
              {[['குறைந்தபட்சம்', Math.min(...selectedCrop.trend)], ['தற்போது', selectedCrop.price], ['அதிகபட்சம்', Math.max(...selectedCrop.trend)]].map(([label, val]) => (
                <div key={label} className="flex-1 text-center p-2 bg-soil-50 dark:bg-forest-900 rounded-xl">
                  <div className="text-sm font-bold text-forest-700">₹{val}</div>
                  <div className="text-xs text-soil-400 tamil-text">{label}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === 'listings' && (
        <div>
          {/* Create listing modal */}
          <AnimatePresence>
            {showListingForm && (
              <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                className="card mb-4 border-2 border-dashed border-forest-300 dark:border-forest-700">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-forest-800 dark:text-forest-200 tamil-text">விற்பனை பட்டியல் சேர்</h3>
                  <button onClick={() => setShowListingForm(false)} className="p-1 rounded-lg hover:bg-soil-50"><X size={18} className="text-soil-500" /></button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-soil-500 tamil-text block mb-1">பயிர் வகை</label>
                    <input className="input-field tamil-text" placeholder="எ.கா: நெல்" value={listing.crop} onChange={e => setListing(l => ({ ...l, crop: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-soil-500 tamil-text block mb-1">அளவு (கிலோ)</label>
                    <input className="input-field" type="number" placeholder="500" value={listing.qty} onChange={e => setListing(l => ({ ...l, qty: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-soil-500 tamil-text block mb-1">விலை (₹/கிலோ)</label>
                    <input className="input-field" type="number" placeholder="22" value={listing.price} onChange={e => setListing(l => ({ ...l, price: e.target.value }))} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-soil-500 tamil-text block mb-1">இடம்</label>
                    <input className="input-field tamil-text" placeholder="கிராமம் / நகரம்" value={listing.location} onChange={e => setListing(l => ({ ...l, location: e.target.value }))} />
                  </div>
                </div>
                <button onClick={handleCreateListing} className="btn-primary w-full mt-4">{t('பட்டியல் சேர்', 'Add Listing')}</button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Existing listings */}
          <div className="flex flex-col gap-3">
            {mockListings.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card>
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-forest-800 dark:text-forest-200 tamil-text">{item.crop}</h4>
                        <span className="badge-green tamil-text">{item.qty} {item.unit}</span>
                      </div>
                      <p className="text-sm text-soil-500 tamil-text mt-0.5">📍 {item.location} · ⏱ {item.posted} முன்பு</p>
                      <p className="text-xs text-soil-400 tamil-text">விவசாயி: {item.farmer}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-forest-700 text-lg">₹{item.price}/கிலோ</div>
                      <a href={`tel:${item.phone}`} className="text-xs bg-forest-100 dark:bg-forest-800 text-forest-700 dark:text-forest-300 px-3 py-1.5 rounded-xl font-semibold mt-1 inline-block">
                        📞 தொடர்பு
                      </a>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
