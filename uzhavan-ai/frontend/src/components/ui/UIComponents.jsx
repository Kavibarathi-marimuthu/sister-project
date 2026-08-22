import React from 'react'
import { cn } from '../../lib/utils'

// Gauge chart for soil health, confidence scores etc.
export function GaugeChart({ value = 75, max = 100, label, color = '#1a7d2e', size = 160 }) {
  const r = (size / 2) * 0.7
  const cx = size / 2
  const cy = size / 2
  const circumference = Math.PI * r
  const pct = Math.min(Math.max(value / max, 0), 1)
  const dashOffset = circumference * (1 - pct)

  const getColor = (v) => {
    if (v >= 70) return '#1a7d2e'
    if (v >= 40) return '#d49b0c'
    return '#dc2626'
  }
  const c = color || getColor(value)

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size / 1.6} viewBox={`0 0 ${size} ${size / 1.6}`} className="overflow-visible">
        {/* Background arc */}
        <path
          d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`}
          stroke="#e8e2d9" strokeWidth="10" fill="none" strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`}
          stroke={c} strokeWidth="10" fill="none" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
        {/* Center value */}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="22" fontWeight="700" fill={c}>{value}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#6b6459">{label}</text>
      </svg>
    </div>
  )
}

// Confidence badge
export function ConfidenceBadge({ score }) {
  const color = score >= 80 ? 'bg-leaf-100 text-leaf-700' : score >= 60 ? 'bg-wheat-100 text-wheat-700' : 'bg-red-100 text-red-700'
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full', color)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {score}% நம்பகம்
    </span>
  )
}

// Severity badge
export function SeverityBadge({ level }) {
  const map = {
    low: 'badge-green',
    medium: 'badge-yellow',
    high: 'badge-red',
    critical: 'badge-red',
  }
  const labels = { low: 'குறைவு', medium: 'மிதம்', high: 'அதிகம்', critical: 'அபாயம்' }
  return <span className={cn(map[level] || 'badge-green')}>{labels[level] || level}</span>
}

// Progress bar with label
export function ProgressBar({ value, max = 100, color = 'bg-forest-500', label, className }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-soil-600 dark:text-soil-400 tamil-text">{label}</span>
          <span className="font-semibold text-forest-700">{pct}%</span>
        </div>
      )}
      <div className="w-full h-2.5 bg-soil-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-1000', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// Star rating
export function StarRating({ rating, max = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={i < Math.round(rating) ? 'text-wheat-400' : 'text-soil-200'}>★</span>
      ))}
      <span className="text-xs text-soil-500 ml-1">{rating}</span>
    </div>
  )
}

// Empty state illustration
export function EmptyState({ icon = '🌱', title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-6">
      <div className="text-7xl animate-sprout">{icon}</div>
      <div>
        <h3 className="font-display font-bold text-xl text-forest-800 dark:text-forest-200 tamil-text">{title}</h3>
        {subtitle && <p className="text-soil-500 mt-1 tamil-text">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// Section header
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="section-title tamil-text">{title}</h2>
        {subtitle && <p className="text-sm text-soil-500 mt-0.5 tamil-text">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// Card wrapper
export function Card({ children, className, onClick }) {
  return (
    <div className={cn(onClick ? 'card-hover' : 'card', className)} onClick={onClick}>
      {children}
    </div>
  )
}
