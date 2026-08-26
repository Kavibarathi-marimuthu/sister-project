/**
 * Gemini REST client — no npm package needed, pure fetch.
 * Model: gemini-3.6-flash  (confirmed working)
 * Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent'

const SYSTEM_PROMPT = `You are Uzhavan AI (உழவன் AI), an expert Tamil agricultural advisor.
Your role: help Tamil farmers with crop selection, soil health, weather-based decisions, disease diagnosis, market prices, government schemes, and farm profitability — covering the full cycle from seed to sale.

STRICT RULES:
1. Always reply in Tamil (தமிழ்) by default. If the user writes in English, reply in English.
2. Keep answers concise, practical, and farmer-friendly (no jargon).
3. Use specific numbers, varieties, quantities, and timelines where relevant.
4. If you don't know something specific to the farmer's location, say so and give general guidance.
5. Never make up pesticide or fertilizer dosages — only cite well-known safe recommendations.
6. Format multi-step advice as a numbered list in Tamil.
7. End every reply with one short actionable next step.`

/**
 * Send a message to Gemini and get a Tamil agriculture answer.
 * @param {string} userMessage
 * @param {{ farmerProfile?: object, farmContext?: object, history?: Array }} options
 * @returns {Promise<string>} Tamil reply text
 */
export async function askGemini(userMessage, { farmerProfile, farmContext, history = [] } = {}) {
  if (!GEMINI_API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY இல்லை — .env.local ல் சேர்க்கவும்.')
  }

  // Build conversation history for multi-turn context
  const contents = []

  // Inject farm context as first user turn if available
  if (farmerProfile || farmContext) {
    const ctx = buildFarmContext(farmerProfile, farmContext)
    contents.push({ role: 'user', parts: [{ text: ctx }] })
    contents.push({ role: 'model', parts: [{ text: 'புரிந்தது. உங்கள் விவரங்களை வைத்து ஆலோசனை தருகிறேன்.' }] })
  }

  // Previous messages (keep last 8 to stay within token limit)
  const recentHistory = history.slice(-8)
  for (const msg of recentHistory) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    })
  }

  // Current message
  contents.push({ role: 'user', parts: [{ text: userMessage }] })

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  }

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API பிழை ${res.status}: ${err}`)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini காலியான பதில் அனுப்பியது.')
  return text.trim()
}

/**
 * Build a concise farm context string to inject as conversation preamble.
 */
function buildFarmContext(farmerProfile, farmContext) {
  const lines = ['[விவசாயி விவரம்]']
  if (farmerProfile?.name) lines.push(`பெயர்: ${farmerProfile.name}`)
  if (farmerProfile?.village) lines.push(`கிராமம்: ${farmerProfile.village}`)
  if (farmerProfile?.landSize) lines.push(`நிலம்: ${farmerProfile.landSize} ஏக்கர்`)
  if (farmerProfile?.experience) lines.push(`அனுபவம்: ${farmerProfile.experience} ஆண்டுகள்`)
  if (farmContext?.currentCrop) lines.push(`தற்போதைய பயிர்: ${farmContext.currentCrop}`)
  if (farmContext?.soilPH) lines.push(`மண் pH: ${farmContext.soilPH}`)
  if (farmContext?.district) lines.push(`மாவட்டம்: ${farmContext.district}`)
  return lines.join('\n')
}

/**
 * Crop-specific AI recommendation (structured response).
 * Returns a Tamil explanation string.
 */
export async function getCropRecommendation(soilData, weatherData, farmerProfile) {
  const prompt = `என் விவரங்கள்:
மண் pH: ${soilData.pH || 6.5}
நைட்ரஜன்: ${soilData.nitrogen || 180} kg/ha
பாஸ்பரஸ்: ${soilData.phosphorus || 22} kg/ha
பொட்டாசியம்: ${soilData.potassium || 195} kg/ha
நிலம்: ${farmerProfile?.landSize || 2} ஏக்கர்
மாவட்டம்: ${farmerProfile?.district || 'தஞ்சாவூர்'}
பருவம்: ${getCurrentSeason()}

மேற்கண்ட மண் மற்றும் வானிலை நிலைமைகளுக்கு ஏற்ற சிறந்த 3 பயிர்களை பரிந்துரை செய்யுங்கள். ஒவ்வொன்றுக்கும் காரணம், மகசூல் மதிப்பீடு, தண்ணீர் தேவை சொல்லுங்கள்.`

  return askGemini(prompt, { farmerProfile })
}

/**
 * Disease diagnosis from a text description (when CV model is not available).
 */
export async function diagnoseCrop(description, cropType, farmerProfile) {
  const prompt = `என் ${cropType || 'பயிர்'} இல் இந்த அறிகுறிகள் உள்ளன: ${description}
நோய் கண்டறிந்து, நோயின் பெயர், காரணம், தீவிரம், உடனடி சிகிச்சை முறை, தடுப்பு நடவடிக்கைகள் சொல்லுங்கள்.`

  return askGemini(prompt, { farmerProfile })
}

function getCurrentSeason() {
  const month = new Date().getMonth() + 1
  if (month >= 6 && month <= 9) return 'குரோவை (Kharif)'
  if (month >= 10 && month <= 12) return 'சம்பா (Rabi)'
  return 'நவரை (Summer)'
}
