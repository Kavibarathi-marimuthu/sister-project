import React from 'react'
import { motion } from 'framer-motion'
import { Bell, Cloud, Bug, ShoppingCart, Award, CheckCircle } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { SectionHeader } from '../ui/UIComponents'
import { cn } from '../../lib/utils'

const icons = { weather: Cloud, disease: Bug, market: ShoppingCart, scheme: Award }
const urgencyBg = {
  high: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900',
  medium: 'bg-wheat-50 dark:bg-wheat-950/30 border-wheat-200 dark:border-wheat-900',
  low: 'bg-leaf-50 dark:bg-leaf-950/30 border-leaf-200 dark:border-leaf-900',
}

export default function NotificationsScreen() {
  const { notifications, markNotificationRead, t } = useApp()

  const unread = notifications.filter(n => !n.read)
  const read = notifications.filter(n => n.read)

  const NotifCard = ({ notif }) => {
    const Icon = icons[notif.type] || Bell
    return (
      <motion.button
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => markNotificationRead(notif.id)}
        className={cn(
          'w-full text-left rounded-3xl border p-4 transition-all',
          urgencyBg[notif.urgency],
          !notif.read ? 'shadow-sm' : 'opacity-70'
        )}
      >
        <div className="flex gap-3 items-start">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', notif.urgency === 'high' ? 'bg-red-100 dark:bg-red-900' : notif.urgency === 'medium' ? 'bg-wheat-100 dark:bg-wheat-900' : 'bg-leaf-100 dark:bg-leaf-900')}>
            <Icon size={18} className={notif.urgency === 'high' ? 'text-red-600' : notif.urgency === 'medium' ? 'text-wheat-600' : 'text-leaf-600'} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className={cn('font-bold text-sm tamil-text', notif.urgency === 'high' ? 'text-red-800 dark:text-red-200' : notif.urgency === 'medium' ? 'text-wheat-800 dark:text-wheat-200' : 'text-leaf-800 dark:text-leaf-200')}>
                {notif.title}
              </h4>
              {!notif.read && <div className="w-2.5 h-2.5 bg-forest-500 rounded-full flex-shrink-0" />}
            </div>
            <p className="text-sm text-soil-600 dark:text-soil-400 mt-0.5 tamil-text leading-snug">{notif.message}</p>
            <p className="text-xs text-soil-400 mt-1.5 tamil-text">{notif.time} முன்பு</p>
          </div>
        </div>
      </motion.button>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 lg:px-6">
      <SectionHeader
        title={t('அறிவிப்புகள்', 'Notifications')}
        subtitle={`${unread.length} ${t('படிக்காதவை', 'unread')}`}
      />

      {unread.length > 0 && (
        <div className="mb-5">
          <h3 className="text-sm font-bold text-soil-500 uppercase tracking-wide mb-3 tamil-text">புதியவை</h3>
          <div className="flex flex-col gap-2">
            {unread.map(n => <NotifCard key={n.id} notif={n} />)}
          </div>
        </div>
      )}

      {read.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-soil-500 uppercase tracking-wide mb-3 tamil-text">முன்னர் படித்தவை</h3>
          <div className="flex flex-col gap-2">
            {read.map(n => <NotifCard key={n.id} notif={n} />)}
          </div>
        </div>
      )}

      {notifications.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="text-6xl">🔔</span>
          <div>
            <h3 className="font-display font-bold text-xl text-forest-800 dark:text-forest-200 tamil-text">அறிவிப்புகள் இல்லை</h3>
            <p className="text-soil-500 mt-1 tamil-text">புதிய எச்சரிக்கைகள் இங்கே தோன்றும்</p>
          </div>
        </div>
      )}
    </div>
  )
}
