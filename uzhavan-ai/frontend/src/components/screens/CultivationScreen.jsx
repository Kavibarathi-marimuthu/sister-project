import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Circle, ChevronDown, Bell } from 'lucide-react'
import { SectionHeader } from '../ui/UIComponents'
import { useApp } from '../../contexts/AppContext'
import { cn } from '../../lib/utils'

const stages = [
  {
    id: 'land', icon: '🚜', label: 'நில தயாரிப்பு', labelEn: 'Land Preparation',
    days: '1-5', completed: true,
    tips: ['நிலத்தை 2-3 முறை உழுங்கள்', 'கடைசி உழவில் அடியுரம் கலக்கவும்', 'மண்ணை சமப்படுத்தவும்'],
    tipsEn: ['Plough 2-3 times', 'Add basal fertilizer in last ploughing', 'Level the field'],
    reminder: null,
  },
  {
    id: 'sowing', icon: '🌱', label: 'விதைப்பு', labelEn: 'Sowing / Transplanting',
    days: '6-10', completed: true,
    tips: ['சான்றளிக்கப்பட்ட விதை பயன்படுத்தவும்', 'விதை சோதனை செய்யவும்', 'வரிசை மற்றும் இடைவெளி பராமரிக்கவும்'],
    tipsEn: ['Use certified seeds', 'Test seed germination', 'Maintain proper row spacing'],
    reminder: null,
  },
  {
    id: 'vegetative', icon: '🌿', label: 'வளர்ச்சி கட்டம்', labelEn: 'Vegetative Stage',
    days: '11-40', completed: false, active: true,
    tips: ['தொடர் நீர் பாசனம் பராமரிக்கவும்', '25ம் நாளில் தளியுரம் சேர்க்கவும்', 'களை கட்டுப்படுத்துங்கள்'],
    tipsEn: ['Maintain regular irrigation', 'Apply top dressing on day 25', 'Control weeds'],
    reminder: '2 நாட்களில் தளியுரம் கொடுக்க வேண்டும்',
    reminderEn: 'Top dressing due in 2 days',
  },
  {
    id: 'flowering', icon: '🌸', label: 'பூக்கும் கட்டம்', labelEn: 'Flowering Stage',
    days: '41-70', completed: false,
    tips: ['வயலில் தண்ணீர் நிறுத்தி வைக்கவும்', 'பூச்சி தாக்குதலை கவனமாக கவனிக்கவும்', 'நிலவேம்பு கஷாயம் தெளிக்கலாம்'],
    tipsEn: ['Maintain standing water', 'Watch for pest attacks', 'Can spray Nilavembu extract'],
    reminder: null,
  },
  {
    id: 'ripening', icon: '🌾', label: 'பழுத்தல் கட்டம்', labelEn: 'Ripening Stage',
    days: '71-100', completed: false,
    tips: ['நீர் பாசனம் நிறுத்தவும்', 'அறுவடை இயந்திரம் முன்பதிவு செய்யவும்', 'சந்தை விலை கண்காணிக்கவும்'],
    tipsEn: ['Stop irrigation', 'Book harvesting machine', 'Monitor market prices'],
    reminder: null,
  },
  {
    id: 'harvest', icon: '🌻', label: 'அறுவடை', labelEn: 'Harvest',
    days: '101-120', completed: false,
    tips: ['காலை நேரத்தில் அறுவடை செய்யவும்', 'அறுவடைக்கு பின் உடனடியாக உலர்த்தவும்', 'சேமிப்பில் ஈரப்பதம் <14% பராமரிக்கவும்'],
    tipsEn: ['Harvest in morning hours', 'Dry immediately after harvest', 'Maintain moisture <14% in storage'],
    reminder: null,
  },
]

const checklist = [
  { id: 'c1', label: '25ம் நாள் தளியுரம் கொடுக்கவும்', done: false, urgent: true },
  { id: 'c2', label: 'வாரம் ஒரு முறை பூச்சி கண்காணிப்பு', done: true, urgent: false },
  { id: 'c3', label: 'நீர் பாசன அட்டவணை பின்பற்றவும்', done: true, urgent: false },
  { id: 'c4', label: 'மண்ணில் ஈரப்பதம் சோதிக்கவும்', done: false, urgent: false },
  { id: 'c5', label: 'வானிலை அறிவிப்பு கவனிக்கவும்', done: false, urgent: true },
]

export default function CultivationScreen() {
  const { t, addToast } = useApp()
  const [expanded, setExpanded] = useState('vegetative')
  const [tasks, setTasks] = useState(checklist)

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
    addToast('பணி நிலை புதுப்பிக்கப்பட்டது ✅', 'success')
  }

  const activeStageIdx = stages.findIndex(s => s.active)
  const progress = Math.round(((activeStageIdx + 0.5) / stages.length) * 100)

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-6 lg:px-6">
      <SectionHeader
        title={t('சாகுபடி வழிகாட்டி', 'Cultivation Guide')}
        subtitle={t('நெல் · நாள் 28 · வளர்ச்சி கட்டம்', 'Paddy · Day 28 · Vegetative Stage')}
      />

      {/* Overall progress */}
      <div className="card mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-forest-800 dark:text-forest-200 tamil-text">ஒட்டுமொத்த முன்னேற்றம்</span>
          <span className="font-bold text-forest-600">{progress}%</span>
        </div>
        <div className="w-full h-3 bg-soil-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-forest-400 to-forest-600 rounded-full"
          />
        </div>
        <div className="flex justify-between mt-2">
          {stages.map((s, i) => (
            <div key={s.id} className={cn('flex flex-col items-center gap-0.5', i <= activeStageIdx ? 'opacity-100' : 'opacity-30')}>
              <span className="text-lg">{s.icon}</span>
              <div className={cn('w-2 h-2 rounded-full', s.completed ? 'bg-forest-600' : s.active ? 'bg-wheat-500' : 'bg-soil-200')} />
            </div>
          ))}
        </div>
      </div>

      {/* Stage timeline */}
      <div className="flex flex-col gap-2 mb-6">
        {stages.map((stage) => (
          <div key={stage.id}>
            <button
              onClick={() => setExpanded(expanded === stage.id ? null : stage.id)}
              className={cn('w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all',
                stage.active ? 'bg-forest-600 text-white shadow-float' :
                stage.completed ? 'bg-leaf-50 dark:bg-leaf-950/40 border border-leaf-200 dark:border-leaf-800' :
                'bg-white dark:bg-forest-900 border border-soil-100 dark:border-forest-800'
              )}
            >
              <span className="text-2xl">{stage.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn('font-bold tamil-text', stage.active ? 'text-white' : 'text-forest-800 dark:text-forest-200')}>
                    {t(stage.label, stage.labelEn)}
                  </span>
                  {stage.completed && <span className="text-leaf-500 text-xs font-semibold">✓ முடிந்தது</span>}
                  {stage.active && <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full">தற்போது</span>}
                </div>
                <span className={cn('text-xs', stage.active ? 'text-white/70' : 'text-soil-400')}>நாள் {stage.days}</span>
              </div>
              {stage.reminder && (
                <span className="flex items-center gap-1 bg-wheat-400 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  <Bell size={10} /> {t('நினைவூட்டல்', 'Reminder')}
                </span>
              )}
              <ChevronDown size={16} className={cn('transition-transform flex-shrink-0', expanded === stage.id && 'rotate-180', stage.active ? 'text-white/70' : 'text-soil-400')} />
            </button>

            <AnimatePresence>
              {expanded === stage.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mx-2 mt-1 bg-soil-50 dark:bg-forest-900 rounded-2xl p-4 border border-soil-100 dark:border-forest-800">
                    {stage.reminder && (
                      <div className="flex items-center gap-2 bg-wheat-50 dark:bg-wheat-950/40 border border-wheat-200 rounded-xl p-2.5 mb-3 text-sm">
                        <Bell size={14} className="text-wheat-600" />
                        <span className="tamil-text text-wheat-800">{stage.reminder}</span>
                      </div>
                    )}
                    <ul className="space-y-2">
                      {stage.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-forest-800 dark:text-forest-200">
                          <span className="w-5 h-5 bg-forest-100 dark:bg-forest-800 rounded-full flex items-center justify-center text-xs text-forest-600 font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                          <span className="tamil-text">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Checklist */}
      <div className="card">
        <h3 className="font-display font-bold text-forest-800 dark:text-forest-200 mb-4 tamil-text">
          இன்றைய பணிகள் ({tasks.filter(t => t.done).length}/{tasks.length})
        </h3>
        <div className="flex flex-col gap-2">
          {tasks.map(task => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={cn('flex items-center gap-3 p-3 rounded-2xl text-left transition-all',
                task.done ? 'bg-leaf-50 dark:bg-leaf-950/40' : task.urgent ? 'bg-red-50 dark:bg-red-950/40' : 'bg-soil-50 dark:bg-forest-900'
              )}
            >
              {task.done
                ? <CheckCircle size={20} className="text-leaf-600 flex-shrink-0" />
                : <Circle size={20} className={cn('flex-shrink-0', task.urgent ? 'text-red-400' : 'text-soil-300')} />
              }
              <span className={cn('text-sm font-medium tamil-text flex-1', task.done ? 'line-through text-soil-400' : task.urgent ? 'text-red-700 dark:text-red-400' : 'text-forest-800 dark:text-forest-200')}>
                {task.label}
              </span>
              {task.urgent && !task.done && <span className="badge-red text-xs">அவசரம்</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
