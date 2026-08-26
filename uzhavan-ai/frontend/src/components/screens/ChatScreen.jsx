import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, MicOff, Volume2, VolumeX, Trash2, Bot } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { askGemini } from '../../lib/gemini'
import { cn } from '../../lib/utils'

const QUICK_QUESTIONS = [
  'இன்று என்ன செய்ய வேண்டும்?',
  'என் பயிருக்கு உரம் பரிந்துரை',
  'இன்றைய மண்டி விலை என்ன?',
  'நெல்லுக்கு நோய் கண்டறிய எப்படி?',
  'அரசு திட்டங்கள் என்ன உள்ளன?',
  'மண் pH சரிசெய்வது எப்படி?',
  'இந்த பருவத்தில் என்ன பயிர் பயிரிடலாம்?',
  'பயிர் காப்பீடு எப்படி எடுப்பது?',
]

export default function ChatScreen() {
  const { t, language } = useApp()
  const { farmerProfile } = useAuth()

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)
  const messagesRef = useRef(messages)
  useEffect(() => { messagesRef.current = messages }, [messages])

  // Greeting on mount
  useEffect(() => {
    setMessages([{
      id: 1,
      role: 'assistant',
      text: `வணக்கம் ${farmerProfile?.name || 'விவசாயி'}! 🌾\n\nநான் உழவன் AI — உங்கள் AI விவசாய ஆலோசகர். பயிர், மண், நோய், வானிலை, சந்தை விலை, அரசு திட்டங்கள் என எதுவும் கேளுங்கள். தமிழிலும் ஆங்கிலத்திலும் பதில் சொல்வேன்.`,
      time: new Date(),
    }])
  }, [farmerProfile?.name])

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Cancel TTS on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    }
  }, [])

  const speak = useCallback((text) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = language === 'ta' ? 'ta-IN' : 'en-IN'
    utter.rate = 0.88
    utter.onstart = () => setSpeaking(true)
    utter.onend = () => setSpeaking(false)
    utter.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utter)
  }, [language])

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  const sendMessage = useCallback(async (text) => {
    const trimmed = (text || input).trim()
    if (!trimmed || loading) return
    setInput('')
    inputRef.current?.focus()

    const userMsg = { id: Date.now(), role: 'user', text: trimmed, time: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const history = messagesRef.current.slice(-10).map(m => ({ role: m.role, text: m.text }))
      const reply = await askGemini(trimmed, {
        farmerProfile,
        farmContext: {
          district: farmerProfile?.district,
          state: farmerProfile?.state,
          landSize: farmerProfile?.landSize,
          experience: farmerProfile?.experience,
        },
        history,
      })
      const aiMsg = { id: Date.now() + 1, role: 'assistant', text: reply, time: new Date() }
      setMessages(prev => [...prev, aiMsg])
      speak(reply)
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        text: `⚠️ பிழை: ${err.message?.slice(0, 200)}`,
        isError: true,
        time: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }, [input, loading, farmerProfile, speak])

  const toggleVoice = useCallback(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRec) return
    if (listening) { recognitionRef.current?.stop(); setListening(false); return }
    const rec = new SpeechRec()
    rec.lang = 'ta-IN'
    rec.continuous = false
    rec.interimResults = false
    rec.onresult = e => {
      const transcript = e.results[0][0].transcript
      setInput(transcript)
      sendMessage(transcript)
    }
    rec.onerror = () => setListening(false)
    rec.onend = () => setListening(false)
    rec.start()
    recognitionRef.current = rec
    setListening(true)
  }, [listening, sendMessage])

  const clearChat = useCallback(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    setSpeaking(false)
    setMessages([{
      id: Date.now(),
      role: 'assistant',
      text: `வணக்கம் ${farmerProfile?.name || 'விவசாயி'}! 🌾 புதிய உரையாடல் தொடங்கலாம். எதுவும் கேளுங்கள்.`,
      time: new Date(),
    }])
  }, [farmerProfile?.name])

  const formatTime = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleTimeString('ta-IN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-var(--nav-height,4rem))] lg:h-[calc(100dvh-2rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-soil-100 dark:border-forest-800 bg-white dark:bg-forest-950">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 bg-forest-600 rounded-2xl flex items-center justify-center text-xl',
            (loading || speaking) && 'animate-pulse'
          )}>
            🌾
          </div>
          <div>
            <h1 className="font-bold text-forest-800 dark:text-forest-200 tamil-text text-base leading-tight">
              {t('AI விவசாய ஆலோசகர்', 'AI Farm Advisor')}
            </h1>
            <p className="text-xs text-soil-400 tamil-text">
              {listening ? '🔴 கேட்கிறது...' : loading ? '⏳ யோசிக்கிறது...' : speaking ? '🔊 பேசுகிறது...' : '✅ தயார்'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {speaking && (
            <button onClick={stopSpeaking} className="p-2 rounded-xl hover:bg-soil-50 dark:hover:bg-forest-900 text-forest-600" title="Stop speaking">
              <VolumeX size={18} />
            </button>
          )}
          <button onClick={clearChat} className="p-2 rounded-xl hover:bg-soil-50 dark:hover:bg-forest-900 text-soil-500" title={t('அழி', 'Clear')}>
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Voice waveform */}
      <AnimatePresence>
        {(listening || speaking) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 36, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-end justify-center gap-1 bg-forest-50 dark:bg-forest-900 overflow-hidden"
          >
            {Array.from({ length: 13 }).map((_, i) => (
              <motion.div
                key={i}
                className={cn('w-1.5 rounded-full', listening ? 'bg-red-400' : 'bg-forest-400')}
                animate={{ height: [4, 4 + (i % 4) * 6 + 6, 4] }}
                transition={{ duration: 0.45 + i * 0.04, repeat: Infinity, delay: i * 0.06 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[var(--bg)]">
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-forest-100 dark:bg-forest-900 rounded-xl flex items-center justify-center text-base flex-shrink-0 mt-1">
                {msg.isError ? '⚠️' : '🌾'}
              </div>
            )}
            <div className={cn(
              'max-w-[80%] flex flex-col gap-1',
              msg.role === 'user' ? 'items-end' : 'items-start'
            )}>
              <div className={cn(
                'px-4 py-3 rounded-2xl text-sm leading-relaxed tamil-text whitespace-pre-wrap',
                msg.role === 'user'
                  ? 'bg-forest-600 text-white rounded-tr-sm'
                  : msg.isError
                  ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-tl-sm'
                  : 'bg-white dark:bg-forest-900 text-forest-900 dark:text-forest-100 border border-soil-100 dark:border-forest-800 rounded-tl-sm shadow-sm'
              )}>
                {msg.text}
              </div>
              <span className="text-xs text-soil-400 px-1">{formatTime(msg.time)}</span>
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-forest-100 dark:bg-forest-900 rounded-xl flex items-center justify-center text-base flex-shrink-0 mt-1">🌾</div>
            <div className="bg-white dark:bg-forest-900 border border-soil-100 dark:border-forest-800 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center shadow-sm">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-2 h-2 bg-forest-400 rounded-full"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick question chips — shown only at start */}
      {messages.length <= 1 && (
        <div className="px-4 py-2 bg-white dark:bg-forest-950 border-t border-soil-50 dark:border-forest-800">
          <p className="text-xs text-soil-400 tamil-text mb-2">{t('விரைவு கேள்விகள்:', 'Quick questions:')}</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {QUICK_QUESTIONS.map(q => (
              <button key={q} onClick={() => sendMessage(q)} disabled={loading}
                className="flex-shrink-0 text-xs bg-forest-50 dark:bg-forest-900 border border-forest-200 dark:border-forest-700 text-forest-700 dark:text-forest-300 px-3 py-2 rounded-xl hover:bg-forest-100 dark:hover:bg-forest-800 transition-all tamil-text disabled:opacity-50 whitespace-nowrap">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 py-3 bg-white dark:bg-forest-950 border-t border-soil-100 dark:border-forest-800 flex gap-2 items-end">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
          }}
          disabled={loading}
          placeholder={t('கேளுங்கள்... (Enter to send)', 'Ask anything... (Enter to send)')}
          rows={1}
          className="input-field flex-1 text-sm py-2.5 resize-none disabled:opacity-60 tamil-text"
          style={{ minHeight: '42px', maxHeight: '100px', overflowY: 'auto' }}
        />
        <button onClick={toggleVoice} disabled={loading}
          className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-40',
            listening ? 'bg-red-500 text-white animate-pulse' : 'bg-soil-100 dark:bg-forest-900 text-soil-600 dark:text-soil-400 hover:bg-soil-200'
          )}>
          {listening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
          className="w-11 h-11 bg-forest-600 text-white rounded-xl flex items-center justify-center hover:bg-forest-700 disabled:opacity-40 transition-all flex-shrink-0">
          <Send size={17} />
        </button>
      </div>
    </div>
  )
}
