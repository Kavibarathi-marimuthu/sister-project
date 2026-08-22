import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { X, Send, Mic, MicOff, Volume2, Minimize2, Maximize2, GripVertical } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { askGemini } from '../../lib/gemini'
import { cn } from '../../lib/utils'

// Default position — bottom-right corner
const DEFAULT_POS = { x: 16, y: 80 }

export default function FloatingAssistant() {
  const { t } = useApp()
  const { farmerProfile, chatPos, saveChatPos } = useAuth()

  const [open, setOpen]         = useState(false)   // chat window visible
  const [minimized, setMinimized] = useState(false)  // minimized pill
  const [position, setPosition] = useState(() => chatPos || DEFAULT_POS)
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking]   = useState(false)

  const dragControls  = useDragControls()
  const constrainRef  = useRef(null)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)
  const messagesRef    = useRef(messages)
  useEffect(() => { messagesRef.current = messages }, [messages])

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Cancel TTS when chat closes
  useEffect(() => {
    if (!open && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
    }
  }, [open])

  // Initialise with greeting on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        id: 1, role: 'assistant',
        text: `வணக்கம் ${farmerProfile?.name || 'விவசாயி'}! 🌾 நான் உழவன் AI. எந்த விஷயத்திலும் உதவுகிறேன் — பயிர், மண், நோய், வானிலை, சந்தை, திட்டங்கள் என எதுவும் கேளுங்கள்.`,
      }])
    }
  }, [open, farmerProfile])

  const speak = useCallback((text) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'ta-IN'
    utter.rate = 0.88
    utter.onstart = () => setSpeaking(true)
    utter.onend   = () => setSpeaking(false)
    utter.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utter)
  }, [])

  const sendMessage = useCallback(async (text) => {
    const trimmed = (text || input).trim()
    if (!trimmed || loading) return
    setInput('')
    const userMsg = { id: Date.now(), role: 'user', text: trimmed }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    try {
      const history = messagesRef.current.slice(-10).map(m => ({ role: m.role, text: m.text }))
      const reply = await askGemini(trimmed, {
        farmerProfile,
        farmContext: {
          district:    farmerProfile?.district,
          state:       farmerProfile?.state,
          landSize:    farmerProfile?.landSize,
          farms:       farmerProfile?.farms,
          experience:  farmerProfile?.experience,
          location:    farmerProfile?.location,
        },
        history,
      })
      const aiMsg = { id: Date.now() + 1, role: 'assistant', text: reply }
      setMessages(prev => [...prev, aiMsg])
      speak(reply)
    } catch (err) {
      const errText = `பிழை: ${err.message?.slice(0, 120)}`
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: errText, isError: true }])
    } finally {
      setLoading(false)
    }
  }, [input, loading, farmerProfile, speak])

  const toggleVoice = useCallback(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRec) return
    if (listening) { recognitionRef.current?.stop(); setListening(false); return }
    const rec = new SpeechRec()
    rec.lang = 'ta-IN'; rec.continuous = false; rec.interimResults = false
    rec.onresult = e => { const t = e.results[0][0].transcript; setInput(t); sendMessage(t) }
    rec.onerror  = () => setListening(false)
    rec.onend    = () => setListening(false)
    rec.start(); recognitionRef.current = rec; setListening(true)
  }, [listening, sendMessage])

  const handleDragEnd = (_, info) => {
    const newPos = {
      x: position.x + info.offset.x,
      y: position.y + info.offset.y,
    }
    setPosition(newPos)
    saveChatPos(newPos)
  }

  const quickQ = [
    'இன்று என்ன செய்ய வேண்டும்?',
    'என் பயிருக்கு உரம் பரிந்துரை',
    'இன்றைய மண்டி விலை',
    'நோய் கண்டறிதல் எப்படி?',
    'அரசு திட்டங்கள் என்ன?',
  ]

  return (
    // Full-screen drag constraint layer
    <div ref={constrainRef} className="fixed inset-0 pointer-events-none z-[100]">
      <motion.div
        drag
        dragMomentum={false}
        dragControls={dragControls}
        dragConstraints={constrainRef}
        onDragEnd={handleDragEnd}
        initial={{ x: position.x, y: position.y }}
        style={{ x: position.x, y: position.y, position: 'absolute', bottom: 'auto', right: 'auto', top: 0, left: 0 }}
        className="pointer-events-auto"
      >
        <AnimatePresence mode="wait">
          {/* ── Minimized pill ───────────────────────────────────── */}
          {(!open || minimized) && (
            <motion.button
              key="fab"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => { setOpen(true); setMinimized(false) }}
              onPointerDown={e => { e.stopPropagation(); dragControls.start(e) }}
              className={cn(
                'flex items-center gap-2 px-4 py-3 rounded-2xl shadow-float bg-forest-600 text-white transition-all hover:bg-forest-700 active:scale-95 cursor-grab active:cursor-grabbing',
                speaking && 'animate-pulse-green'
              )}
            >
              <span className="text-xl">🎙️</span>
              {!minimized && <span className="text-sm font-semibold tamil-text hidden sm:block">AI ஆலோசனை</span>}
              {speaking && <Volume2 size={14} className="text-white/80 animate-pulse" />}
            </motion.button>
          )}

          {/* ── Chat window ──────────────────────────────────────── */}
          {open && !minimized && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-[340px] sm:w-[380px] bg-white dark:bg-forest-950 rounded-3xl shadow-float border border-soil-100 dark:border-forest-800 flex flex-col overflow-hidden"
              style={{ maxHeight: '70vh' }}
            >
              {/* Header — drag handle */}
              <div
                className="flex items-center gap-2 px-4 pt-3 pb-3 bg-forest-600 cursor-grab active:cursor-grabbing select-none"
                onPointerDown={e => dragControls.start(e)}
              >
                <GripVertical size={16} className="text-white/60 flex-shrink-0" />
                <div className={cn('w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-lg', speaking && 'animate-pulse')}>
                  🎙️
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm tamil-text leading-tight">AI விவசாய ஆலோசகர்</p>
                  <p className="text-white/70 text-xs tamil-text">
                    {listening ? '🔴 கேட்கிறது' : loading ? '⏳ Gemini...' : speaking ? '🔊 பேசுகிறது' : '✅ கேளுங்கள்'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setMinimized(true)} className="p-1.5 rounded-lg hover:bg-white/20 text-white/80">
                    <Minimize2 size={15} />
                  </button>
                  <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20 text-white/80">
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Waveform */}
              {(listening || speaking) && (
                <div className="flex items-end justify-center gap-1 py-2 bg-forest-50 dark:bg-forest-900">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className={cn('w-1.5 rounded-full', listening ? 'bg-red-400' : 'bg-forest-400')}
                      animate={{ height: [4, 4 + (i % 3) * 8 + 6, 4] }}
                      transition={{ duration: 0.5 + i * 0.05, repeat: Infinity, delay: i * 0.07 }}
                    />
                  ))}
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 min-h-[120px]">
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn('flex gap-2', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 bg-forest-100 dark:bg-forest-900 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                        {msg.isError ? '⚠️' : '🌾'}
                      </div>
                    )}
                    <div className={cn(
                      'max-w-[82%] px-3 py-2 rounded-2xl text-xs leading-relaxed tamil-text whitespace-pre-wrap',
                      msg.role === 'user'
                        ? 'bg-forest-600 text-white rounded-tr-sm'
                        : msg.isError
                        ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 rounded-tl-sm'
                        : 'bg-soil-50 dark:bg-forest-900 text-forest-800 dark:text-forest-200 rounded-tl-sm'
                    )}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 bg-forest-100 rounded-lg flex items-center justify-center text-sm">🌾</div>
                    <div className="bg-soil-50 dark:bg-forest-900 rounded-2xl rounded-tl-sm px-3 py-2 flex gap-1 items-center">
                      {[0,1,2].map(i => (
                        <motion.div key={i} className="w-1.5 h-1.5 bg-forest-400 rounded-full"
                          animate={{ y: [0,-4,0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }} />
                      ))}
                      <span className="text-xs text-soil-400 ml-1">Gemini...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick chips — show only when few messages */}
              {messages.length <= 2 && (
                <div className="flex gap-1.5 px-3 pb-1 overflow-x-auto scrollbar-hide">
                  {quickQ.map(q => (
                    <button key={q} onClick={() => sendMessage(q)} disabled={loading}
                      className="flex-shrink-0 text-xs bg-forest-50 dark:bg-forest-900 border border-forest-200 dark:border-forest-700 text-forest-700 dark:text-forest-300 px-2.5 py-1.5 rounded-xl hover:bg-forest-100 transition-all tamil-text disabled:opacity-50 whitespace-nowrap">
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="flex gap-2 px-3 pb-3 pt-1">
                <input
                  type="text" value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  disabled={loading}
                  placeholder={t('கேளுங்கள்...', 'Ask anything...')}
                  className="input-field flex-1 text-xs py-2.5 disabled:opacity-60 tamil-text"
                />
                <button onClick={toggleVoice} disabled={loading}
                  className={cn('w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40',
                    listening ? 'bg-red-500 text-white animate-pulse' : 'bg-soil-100 dark:bg-forest-900 text-soil-600')}>
                  {listening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
                <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                  className="w-10 h-10 bg-forest-600 text-white rounded-xl flex items-center justify-center hover:bg-forest-700 disabled:opacity-40 transition-all">
                  <Send size={15} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
