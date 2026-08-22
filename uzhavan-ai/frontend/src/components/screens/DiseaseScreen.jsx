import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, AlertTriangle, CheckCircle } from 'lucide-react'
import { SeverityBadge, SectionHeader, Card } from '../ui/UIComponents'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
const GEMINI_VISION_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent'

/**
 * Convert an image File to base64 data URL string (data part only).
 */
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Send the image to Gemini Vision and ask for a structured plant disease diagnosis in Tamil.
 */
async function diagnoseWithGemini(file, cropHint, farmerProfile) {
  if (!GEMINI_API_KEY) throw new Error('VITE_GEMINI_API_KEY இல்லை — .env.local ல் சேர்க்கவும்.')

  const base64 = await fileToBase64(file)
  const mimeType = file.type || 'image/jpeg'

  const contextLines = []
  if (farmerProfile?.primaryCrop || cropHint) contextLines.push(`பயிர்: ${cropHint || farmerProfile?.primaryCrop}`)
  if (farmerProfile?.district) contextLines.push(`மாவட்டம்: ${farmerProfile.district}`)
  if (farmerProfile?.soilType) contextLines.push(`மண் வகை: ${farmerProfile.soilType}`)

  const contextText = contextLines.length ? `\nவிவசாயி தகவல்:\n${contextLines.join('\n')}\n` : ''

  const prompt = `${contextText}
இந்த பயிர் புகைப்படத்தை கவனமாக பகுப்பாய்வு செய்யுங்கள்.

பின்வரும் JSON format ல் மட்டுமே பதில் கொடுங்கள் (கூடுதல் உரை வேண்டாம்):
{
  "detected": true/false,
  "diseaseName": "நோயின் பெயர் தமிழில்",
  "diseaseNameEn": "Disease name in English",
  "pathogen": "நோய் காரணி (பக்டீரியா/பூஞ்சை/வைரஸ்/பூச்சி)",
  "severity": "low/medium/high",
  "confidence": 85,
  "affectedArea": "பாதிக்கப்பட்ட பகுதி சதவீதம்",
  "description": "நோயின் விரிவான விளக்கம் தமிழில் 2-3 வரிகளில்",
  "immediateTreatment": ["உடனடி சிகிச்சை படி 1", "படி 2", "படி 3"],
  "followUp": "தொடர் சிகிச்சை விளக்கம் தமிழில்",
  "prevention": "தடுப்பு முறைகள் தமிழில்",
  "noDisease": "நோய் இல்லை என்றால் இங்கே விளக்கம்"
}`

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          { inline_data: { mime_type: mimeType, data: base64 } },
        ],
      },
    ],
    generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
  }

  const res = await fetch(`${GEMINI_VISION_ENDPOINT}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Gemini Vision பிழை ${res.status}: ${txt.slice(0, 200)}`)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

  // Extract JSON from the response (Gemini sometimes wraps it in markdown code fences)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Gemini பதில் JSON format ல் இல்லை. மீண்டும் முயற்சிக்கவும்.')

  return JSON.parse(jsonMatch[0])
}

// ── Scan history (stored in component state; could be persisted to localStorage) ──
let scanHistoryStore = []

export default function DiseaseScreen() {
  const { t, addToast } = useApp()
  const { farmerProfile } = useAuth()
  const [tab, setTab] = useState('scan')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState(null)
  const [cropHint, setCropHint] = useState('')
  const [history, setHistory] = useState(scanHistoryStore)
  const fileRef = useRef()

  const handleFile = async (file) => {
    setError(null)
    setResult(null)
    setPreviewUrl(URL.createObjectURL(file))
    setScanning(true)

    try {
      const diagnosis = await diagnoseWithGemini(file, cropHint, farmerProfile)
      setResult(diagnosis)
      // Save to history
      const entry = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('ta-IN'),
        crop: cropHint || farmerProfile?.primaryCrop || 'தெரியவில்லை',
        disease: diagnosis.detected ? diagnosis.diseaseNameEn : 'நோய் இல்லை',
        diseaseTa: diagnosis.detected ? diagnosis.diseaseName : 'நோய் இல்லை',
        severity: diagnosis.severity || 'low',
        treated: false,
        image: diagnosis.detected ? '🦠' : '✅',
        previewUrl: URL.createObjectURL(file),
      }
      scanHistoryStore = [entry, ...scanHistoryStore].slice(0, 20)
      setHistory(scanHistoryStore)

      if (diagnosis.detected) {
        addToast(`நோய் கண்டறியப்பட்டது: ${diagnosis.diseaseName} 🔬`, 'warning')
      } else {
        addToast('பயிர் ஆரோக்கியமாக உள்ளது ✅', 'success')
      }
    } catch (err) {
      setError(err.message)
      addToast('கண்டறிதல் தோல்வி ❌', 'error')
    } finally {
      setScanning(false)
    }
  }

  const reset = () => { setResult(null); setPreviewUrl(null); setError(null) }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 lg:px-6">
      <SectionHeader
        title={t('நோய் / பூச்சி கண்டறிதல்', 'Disease / Pest Detection')}
        subtitle={t('புகைப்படம் → Gemini AI → உடனடி கண்டறிதல்', 'Photo → Gemini AI → Instant diagnosis')}
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-soil-50 dark:bg-forest-900 rounded-2xl p-1 mb-5">
        {[
          { key: 'scan',    label: '📸 புதிய ஸ்கேன்', labelEn: 'New Scan'  },
          { key: 'history', label: `🕐 வரலாறு (${history.length})`, labelEn: 'History' },
        ].map(tab_ => (
          <button key={tab_.key} onClick={() => setTab(tab_.key)}
            className={cn('flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all tamil-text',
              tab === tab_.key ? 'bg-white dark:bg-forest-800 text-forest-700 dark:text-forest-300 shadow-sm' : 'text-soil-500')}>
            {t(tab_.label, tab_.labelEn)}
          </button>
        ))}
      </div>

      {tab === 'scan' && (
        <div>
          {/* Optional crop hint */}
          {!previewUrl && (
            <div className="mb-3">
              <label className="block text-xs font-semibold text-soil-500 mb-1 tamil-text">பயிர் வகை (விருப்பம்)</label>
              <input
                type="text"
                value={cropHint}
                onChange={e => setCropHint(e.target.value)}
                placeholder={`${farmerProfile?.primaryCrop || 'நெல்'}, வாழை, தக்காளி...`}
                className="input-field text-sm py-2 tamil-text"
              />
            </div>
          )}

          {/* Upload / camera area */}
          <div
            onClick={() => !scanning && fileRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-3xl overflow-hidden cursor-pointer transition-all mb-5',
              scanning ? 'border-forest-400 cursor-wait' : 'border-forest-300 dark:border-forest-700 hover:border-forest-500'
            )}
          >
            <input
              ref={fileRef} type="file" accept="image/*" capture="environment"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            />

            {previewUrl ? (
              <div className="relative">
                <img src={previewUrl} alt="scan" className="w-full h-64 object-cover" />
                {scanning && (
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    <p className="text-white font-semibold tamil-text">Gemini AI பகுப்பாய்வு செய்கிறது...</p>
                    <div className="flex gap-1.5">
                      {[0,1,2].map(i => (
                        <motion.div key={i} className="w-2 h-2 bg-white rounded-full"
                          animate={{ y: [0,-6,0] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
                      ))}
                    </div>
                    <p className="text-white/70 text-xs tamil-text">புகைப்படத்தை ஆராய்கிறோம்...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-12 px-4">
                <div className="w-20 h-20 bg-forest-100 dark:bg-forest-900 rounded-3xl flex items-center justify-center text-5xl">🔬</div>
                <div className="text-center">
                  <p className="font-bold text-forest-800 dark:text-forest-200 tamil-text">பாதிக்கப்பட்ட இலையை புகைப்படம் எடுங்கள்</p>
                  <p className="text-sm text-soil-500 mt-1 tamil-text">Gemini Vision AI மூலம் உடனடியாக கண்டறியப்படும்</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 bg-forest-600 text-white rounded-2xl text-sm font-semibold">
                    <Camera size={16} /> கேமரா
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-soil-100 text-soil-700 rounded-2xl text-sm font-semibold">
                    <Upload size={16} /> பதிவேற்று
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-4">
              <p className="text-red-700 dark:text-red-300 text-sm tamil-text">⚠️ {error}</p>
              <button onClick={reset} className="mt-2 text-xs text-red-600 font-semibold underline">மீண்டும் முயற்சி</button>
            </motion.div>
          )}

          {/* Result */}
          <AnimatePresence>
            {result && !scanning && !error && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">

                {/* No disease */}
                {!result.detected && (
                  <Card className="border-leaf-200 dark:border-leaf-900 bg-leaf-50 dark:bg-leaf-950/30">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">✅</span>
                      <div>
                        <h3 className="font-display font-bold text-leaf-800 dark:text-leaf-200 tamil-text">பயிர் ஆரோக்கியமாக உள்ளது!</h3>
                        <p className="text-sm text-leaf-600 dark:text-leaf-400 mt-1 tamil-text">{result.noDisease || 'தெரியும் நோய் எதுவும் கண்டறியப்படவில்லை.'}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Disease detected */}
                {result.detected && (
                  <>
                    {/* Disease card */}
                    <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
                      <div className="flex items-start gap-3">
                        <span className="text-4xl">🦠</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-display font-bold text-red-800 dark:text-red-200 tamil-text">{result.diseaseName}</h3>
                            <SeverityBadge level={result.severity} />
                          </div>
                          <p className="text-xs text-red-600 dark:text-red-400 italic mt-0.5">{result.diseaseNameEn} · {result.pathogen}</p>
                          <div className="flex gap-3 mt-2">
                            <span className="text-sm font-semibold text-red-700 dark:text-red-300">AI நம்பகம்: {result.confidence}%</span>
                            <span className="text-sm text-red-600 tamil-text">தாக்கம்: {result.affectedArea}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-red-800 dark:text-red-200 mt-3 tamil-text leading-relaxed">{result.description}</p>
                    </Card>

                    {/* Treatment */}
                    <Card>
                      <h3 className="font-display font-bold text-forest-800 dark:text-forest-200 mb-3 tamil-text">💊 உடனடி சிகிச்சை</h3>
                      <div className="flex flex-col gap-2">
                        {(result.immediateTreatment || []).map((step, i) => (
                          <div key={i} className="flex gap-3 p-2.5 bg-soil-50 dark:bg-forest-900 rounded-2xl">
                            <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i+1}</span>
                            <p className="text-sm tamil-text text-forest-800 dark:text-forest-200">{step}</p>
                          </div>
                        ))}
                      </div>
                      {result.followUp && (
                        <div className="mt-4 p-3 bg-wheat-50 dark:bg-wheat-950/30 rounded-2xl">
                          <h4 className="font-semibold text-wheat-800 dark:text-wheat-200 text-sm tamil-text mb-1">🔄 தொடர் சிகிச்சை</h4>
                          <p className="text-xs text-wheat-700 dark:text-wheat-300 tamil-text">{result.followUp}</p>
                        </div>
                      )}
                      {result.prevention && (
                        <div className="mt-3 p-3 bg-leaf-50 dark:bg-leaf-950/30 rounded-2xl">
                          <h4 className="font-semibold text-leaf-800 dark:text-leaf-200 text-sm tamil-text mb-1">✅ தடுப்பு முறை</h4>
                          <p className="text-xs text-leaf-700 dark:text-leaf-300 tamil-text">{result.prevention}</p>
                        </div>
                      )}
                    </Card>
                  </>
                )}

                {/* Rescan */}
                <button onClick={reset} className="btn-ghost w-full">🔄 மீண்டும் ஸ்கேன் செய்</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* History tab */}
      {tab === 'history' && (
        <div className="flex flex-col gap-3">
          {history.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-3">🔬</div>
              <p className="font-semibold text-forest-800 dark:text-forest-200 tamil-text">இன்னும் ஸ்கேன் இல்லை</p>
              <p className="text-sm text-soil-500 mt-1 tamil-text">முதல் ஸ்கேன் செய்யுங்கள்!</p>
            </div>
          )}
          {history.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 bg-soil-100 dark:bg-forest-900">
                    {item.previewUrl
                      ? <img src={item.previewUrl} alt="scan" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">{item.image}</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-forest-800 dark:text-forest-200 text-sm tamil-text truncate">{item.diseaseTa || item.disease}</h4>
                      <SeverityBadge level={item.severity} />
                    </div>
                    <p className="text-xs text-soil-500 tamil-text mt-0.5">{item.crop} · {item.date}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {item.treated
                      ? <span className="badge-green flex items-center gap-1"><CheckCircle size={12} /> சிகிச்சை</span>
                      : <span className="badge-red flex items-center gap-1"><AlertTriangle size={12} /> நிலுவை</span>
                    }
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
