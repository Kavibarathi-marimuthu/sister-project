import React from 'react'
import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div className="min-h-dvh bg-[var(--bg)] flex flex-col items-center justify-center gap-6">
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="w-24 h-24 bg-forest-600 rounded-3xl flex items-center justify-center shadow-float"
      >
        <span className="text-5xl">🌾</span>
      </motion.div>

      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display text-2xl font-bold text-forest-800 dark:text-forest-200"
        >
          Uzhavan AI
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-soil-500 tamil-text mt-1"
        >
          உழவன் AI — விதை முதல் விற்பனை வரை
        </motion.p>
      </div>

      {/* Loading dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2.5 h-2.5 bg-forest-400 rounded-full"
            animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  )
}
