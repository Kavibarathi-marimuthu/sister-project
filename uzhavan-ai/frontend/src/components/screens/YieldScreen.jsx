import React from 'react'
import { motion } from 'framer-motion'
import { SectionHeader, Card } from '../ui/UIComponents'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'

const monthlyData = [
  { month: 'நவ', cost: 18000, rev: 0 },
  { month: 'டிச', cost: 24000, rev: 0 },
  { month: 'ஜன', cost: 32000, rev: 0 },
  { month: 'பிப்', cost: 38000, rev: 50000 },
  { month: 'மார்', cost: 42000, rev: 77000 },
]

const yieldData = [0, 2000, 4000, 5000, 5200]
const yieldLabels = ['நட்ட நாள்', 'வளர்ச்சி', 'பூக்கும்', 'பழுத்தல்', 'அறுவடை']

// Simple inline SVG bar chart
function BarChartSVG({ data, colorA, colorB, labelA, labelB }) {
  const maxVal = Math.max(...data.flatMap(d => [d.cost, d.rev]))
  const W = 340, H = 160, padL = 40, padB = 24, barW = 24, gap = 6
  return (
    <svg viewBox={`0 0 ${W} ${H + padB}`} className="w-full h-48">
      {data.map((d, i) => {
        const x = padL + i * ((barW * 2 + gap + 8))
        const hA = (d.cost / maxVal) * H
        const hB = (d.rev / maxVal) * H
        return (
          <g key={i}>
            <rect x={x} y={H - hA} width={barW} height={hA} rx={4} fill={colorA} opacity={0.85} />
            {d.rev > 0 && <rect x={x + barW + gap} y={H - hB} width={barW} height={hB} rx={4} fill={colorB} opacity={0.85} />}
            <text x={x + barW} y={H + 16} textAnchor="middle" fontSize={9} fill="#6b6459">{d.month}</text>
          </g>
        )
      })}
      <line x1={padL - 4} y1={0} x2={padL - 4} y2={H} stroke="#e8e2d9" strokeWidth={1} />
      <line x1={padL - 4} y1={H} x2={W} y2={H} stroke="#e8e2d9" strokeWidth={1} />
      {/* Legend */}
      <rect x={padL} y={H + padB - 6} width={10} height={10} rx={2} fill={colorA} />
      <text x={padL + 14} y={H + padB + 2} fontSize={9} fill="#6b6459">{labelA}</text>
      <rect x={padL + 90} y={H + padB - 6} width={10} height={10} rx={2} fill={colorB} />
      <text x={padL + 104} y={H + padB + 2} fontSize={9} fill="#6b6459">{labelB}</text>
    </svg>
  )
}

// Simple inline SVG line chart
function LineChartSVG({ data, labels, color }) {
  const maxVal = Math.max(...data) || 1
  const W = 340, H = 140, padL = 40, padB = 24
  const pts = data.map((v, i) => {
    const x = padL + (i / (data.length - 1)) * (W - padL - 8)
    const y = H - (v / maxVal) * (H - 10)
    return [x, y]
  })
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H + padB}`} className="w-full h-44">
      <path d={pathD} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r={4} fill={color} />
          <text x={p[0]} y={H + 16} textAnchor="middle" fontSize={8} fill="#6b6459">{labels[i]}</text>
          {data[i] > 0 && <text x={p[0]} y={p[1] - 8} textAnchor="middle" fontSize={8} fill={color} fontWeight="bold">{data[i].toLocaleString('en-IN')}</text>}
        </g>
      ))}
      <line x1={padL - 4} y1={0} x2={padL - 4} y2={H} stroke="#e8e2d9" strokeWidth={1} />
      <line x1={padL - 4} y1={H} x2={W} y2={H} stroke="#e8e2d9" strokeWidth={1} />
    </svg>
  )
}

export default function YieldScreen() {
  const { t } = useApp()
  const { farmerProfile } = useAuth()
  const area = farmerProfile?.landSize || 3.5

  const totalInputCost = 42000
  const expectedRevenue = Math.round(area * 5200 * 22)
  const netProfit = expectedRevenue - totalInputCost
  const roi = Math.round((netProfit / totalInputCost) * 100)

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 lg:px-6">
      <SectionHeader
        title={t('மகசூல் / லாப மதிப்பீடு', 'Yield / Profit Estimate')}
        subtitle={t('நெல் — CO 47 — 3.5 ஏக்கர்', `Paddy — CO 47 — ${area} acres`)}
      />

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          { label: 'எதிர்பார்ப்பு மகசூல்', value: `${Math.round(area * 5200).toLocaleString('en-IN')} கிலோ`, icon: '🌾', color: 'bg-wheat-50 dark:bg-wheat-950/30' },
          { label: 'மொத்த வருமானம்', value: `₹${expectedRevenue.toLocaleString('en-IN')}`, icon: '💰', color: 'bg-leaf-50 dark:bg-leaf-950/30' },
          { label: 'மொத்த செலவு', value: `₹${totalInputCost.toLocaleString('en-IN')}`, icon: '💸', color: 'bg-red-50 dark:bg-red-950/30' },
          { label: `நிகர லாபம் (ROI ${roi}%)`, value: `₹${netProfit.toLocaleString('en-IN')}`, icon: '📈', color: 'bg-forest-50 dark:bg-forest-950/30' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className={`card border-0 ${kpi.color}`}>
            <div className="text-2xl mb-1">{kpi.icon}</div>
            <div className="font-display font-bold text-lg text-forest-800 dark:text-forest-200">{kpi.value}</div>
            <div className="text-xs text-soil-500 tamil-text">{kpi.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Cost vs Revenue chart */}
      <Card className="mb-5">
        <h3 className="font-display font-bold text-forest-800 dark:text-forest-200 mb-3 tamil-text">💹 செலவு vs வருமானம்</h3>
        <BarChartSVG data={monthlyData} colorA="#b07843" colorB="#1a7d2e" labelA="செலவு" labelB="வருமானம்" />
      </Card>

      {/* Yield projection chart */}
      <Card className="mb-5">
        <h3 className="font-display font-bold text-forest-800 dark:text-forest-200 mb-3 tamil-text">📊 மகசூல் முன்னறிவிப்பு (கிலோ)</h3>
        <LineChartSVG data={yieldData} labels={yieldLabels} color="#1a7d2e" />
      </Card>

      {/* AI profit insight */}
      <div className="card bg-forest-50 dark:bg-forest-900 border-forest-200 dark:border-forest-700">
        <div className="flex gap-3">
          <span className="text-3xl">🤖</span>
          <div>
            <h4 className="font-bold text-forest-800 dark:text-forest-200 tamil-text">AI நுண்ணறிவு</h4>
            <p className="text-sm text-forest-700 dark:text-forest-300 mt-1 tamil-text leading-relaxed">
              இந்த பருவத்தில் தக்காளி விலை உயர்ந்துள்ளதால், அடுத்த முறை 1 ஏக்கர் தக்காளி சேர்க்கலாம். மிக்ஸ் கிராப்பிங் மூலம் ரிஸ்க் குறைக்கலாம்.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
