import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'

export default function LossTicker({ baseAmount }) {
  const { t } = useTranslation()
  const [currentLoss, setCurrentLoss] = useState(baseAmount || 0)

  useEffect(() => {
    setCurrentLoss(baseAmount || 0)
  }, [baseAmount])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLoss(prev => prev + (Math.random() * 0.4 + 0.1))
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  const formattedLoss = Math.floor(currentLoss).toLocaleString('en-IN')

  return (
    <div className="w-full relative py-10 px-8 bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 border-b border-gray-100">
      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold tracking-widest text-red-500 uppercase">
            {t('network_bleeding')}
          </span>
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
        </div>

        <div className="flex items-baseline gap-3">
          <div className="font-sans font-extrabold text-7xl md:text-8xl text-gray-900 tracking-tighter tabular-nums flex">
            <span className="text-red-500 mr-2">₹</span>
            <AnimatePresence mode="popLayout">
              {formattedLoss.split('').map((char, index) => (
                <motion.span
                  key={`${index}-${char}`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {char}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
          <div className="flex flex-col">
            <span className="text-red-500 font-bold text-xl">{t('per_hour')}</span>
            <span className="text-xs text-gray-400 font-medium">total network drain</span>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-6 text-xs text-gray-400">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-200 max-w-32" />
          <span className="font-medium">Real-time Operational Intelligence Active</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-200 max-w-32" />
        </div>
      </div>
    </div>
  )
}
