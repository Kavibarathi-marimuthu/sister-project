import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
}

export function formatNumber(n) {
  return new Intl.NumberFormat('en-IN').format(n)
}

export function formatDate(date, locale = 'ta-IN') {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(date))
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max)
}

export function getConfidenceColor(score) {
  if (score >= 80) return 'text-leaf-600 bg-leaf-50'
  if (score >= 60) return 'text-wheat-600 bg-wheat-50'
  return 'text-red-600 bg-red-50'
}

export function getSeverityColor(level) {
  const map = {
    low: 'badge-green',
    medium: 'badge-yellow',
    high: 'badge-red',
    critical: 'badge-red',
  }
  return map[level?.toLowerCase()] ?? 'badge-green'
}

export function getWeatherUrgency(level) {
  const map = {
    low: { bg: 'bg-leaf-50', border: 'border-leaf-200', text: 'text-leaf-800', icon: '🌤️' },
    medium: { bg: 'bg-wheat-50', border: 'border-wheat-200', text: 'text-wheat-800', icon: '⚠️' },
    high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: '🚨' },
  }
  return map[level?.toLowerCase()] ?? map.low
}

export function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

export function bytesToSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (!bytes) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`
}

// Tamil number words
export const tamilNumbers = ['பூஜ்யம்','ஒன்று','இரண்டு','மூன்று','நான்கு','ஐந்து','ஆறு','ஏழு','எட்டு','ஒன்பது','பத்து']

export const CROPS = ['நெல்', 'கோதுமை', 'கரும்பு', 'பருத்தி', 'வாழை', 'தக்காளி', 'வெங்காயம்', 'கத்தரி', 'மிளகாய்', 'சோளம்', 'கடலை', 'உளுந்து']
export const SOIL_TYPES = ['செம்மண்', 'கரிசல் மண்', 'வண்டல் மண்', 'மணல் மண்', 'களிமண்']
export const DISTRICTS_TN = ['கோயம்புத்தூர்', 'திருப்பூர்', 'ஈரோடு', 'சேலம்', 'நாமக்கல்', 'திண்டுக்கல்', 'மதுரை', 'திருவாரூர்', 'தஞ்சாவூர்', 'நாகப்பட்டினம்', 'புதுக்கோட்டை', 'விருதுநகர்', 'தேனி', 'கன்னியாகுமரி', 'திருநெல்வேலி']
