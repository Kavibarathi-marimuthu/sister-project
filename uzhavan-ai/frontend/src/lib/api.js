// API client — reads base URL from env, falls back to mock responses in dev
import { askGemini } from './gemini'

const BASE = import.meta.env.VITE_API_URL || ''

async function request(path, options = {}) {
  try {
    const res = await fetch(`${BASE}/api${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  } catch {
    // Return mock data when backend is unavailable
    return getMock(path, options)
  }
}

function getMock(path) {
  if (path.startsWith('/crops/recommend')) return import('../data/mockCrops').then(m => m.mockCropRecommendations)
  if (path.startsWith('/weather')) return import('../data/mockWeather').then(m => m.mockWeatherAlerts)
  if (path.startsWith('/market')) return import('../data/mockMarket').then(m => m.mockMandiPrices)
  if (path.startsWith('/disease')) return import('../data/mockDisease').then(m => m.mockDiseaseResult)
  if (path.startsWith('/schemes')) return import('../data/mockSchemes').then(m => m.mockSchemes)
  return Promise.resolve({})
}

// ── Crops ────────────────────────────────────────────────────────────────────
export const cropAPI = {
  recommend: (payload) => request('/crops/recommend', { method: 'POST', body: JSON.stringify(payload) }),
  varieties: (cropId) => request(`/crops/${cropId}/varieties`),
  cultivationGuide: (cropId) => request(`/crops/${cropId}/guide`),
}

// ── Soil ─────────────────────────────────────────────────────────────────────
export const soilAPI = {
  analyze: (payload) => request('/soil/analyze', { method: 'POST', body: JSON.stringify(payload) }),
  ocrScan: (formData) => request('/soil/ocr', { method: 'POST', headers: {}, body: formData }),
}

// ── Weather ──────────────────────────────────────────────────────────────────
export const weatherAPI = {
  alerts: (lat, lon) => request(`/weather/alerts?lat=${lat}&lon=${lon}`),
  forecast: (lat, lon) => request(`/weather/forecast?lat=${lat}&lon=${lon}`),
}

// ── Disease detection ────────────────────────────────────────────────────────
export const diseaseAPI = {
  detect: (formData) => request('/disease/detect', { method: 'POST', headers: {}, body: formData }),
  history: (farmerId) => request(`/disease/history/${farmerId}`),
}

// ── Market ───────────────────────────────────────────────────────────────────
export const marketAPI = {
  prices: (district) => request(`/market/prices?district=${district}`),
  trends: (cropId, days = 30) => request(`/market/trends?crop=${cropId}&days=${days}`),
  createListing: (payload) => request('/market/listings', { method: 'POST', body: JSON.stringify(payload) }),
}

// ── AI Chat / Voice — always uses Gemini directly (no backend round-trip needed) ──
export const aiAPI = {
  /**
   * Send a message to Gemini. Returns { reply: string }.
   * history: array of { role, text } for multi-turn context.
   */
  chat: async (message, farmContext, history = []) => {
    const reply = await askGemini(message, {
      farmerProfile: farmContext?.farmerProfile,
      farmContext: farmContext?.farmData,
      history,
    })
    return { reply }
  },
  tts: (text, lang = 'ta') => request('/ai/tts', { method: 'POST', body: JSON.stringify({ text, lang }) }),
}

// ── Schemes ──────────────────────────────────────────────────────────────────
export const schemesAPI = {
  list: (filters) => request(`/schemes?${new URLSearchParams(filters)}`),
  eligibility: (schemeId, farmerProfile) => request(`/schemes/${schemeId}/eligibility`, { method: 'POST', body: JSON.stringify(farmerProfile) }),
}

export default { cropAPI, soilAPI, weatherAPI, diseaseAPI, marketAPI, aiAPI, schemesAPI }
