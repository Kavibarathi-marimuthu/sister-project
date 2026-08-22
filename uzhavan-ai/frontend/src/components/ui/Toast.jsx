import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/utils'

const types = {
  success: { icon: CheckCircle, cls: 'bg-leaf-600 text-white' },
  error: { icon: AlertCircle, cls: 'bg-red-600 text-white' },
  warning: { icon: AlertTriangle, cls: 'bg-wheat-600 text-white' },
  info: { icon: Info, cls: 'bg-forest-600 text-white' },
}

export default function Toast({ message, type = 'info' }) {
  const { icon: Icon, cls } = types[type] ?? types.info
  return (
    <motion.div
      initial={{ opacity: 0, x: 48 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 48 }}
      className={cn('pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-float text-sm font-medium min-w-[220px] max-w-xs', cls)}
    >
      <Icon size={18} className="flex-shrink-0" />
      <span className="tamil-text">{message}</span>
    </motion.div>
  )
}
