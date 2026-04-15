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
    <div className="w-full relative py-12 px-8 bg-storeos-surface border-b border-storeos-border overflow-hidden transition-colors duration-500">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-storeos-red rounded-full filter blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-storeos-amber rounded-full filter blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-4">
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-2.5 h-2.5 bg-storeos-red rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
          />
          <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-storeos-red uppercase">
            {t('network_bleeding')}
          </span>
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }} 
            transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
            className="w-2.5 h-2.5 bg-storeos-red rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
          />
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-baseline gap-2 md:gap-4">
          <div className="font-sans font-extrabold text-6xl md:text-8xl lg:text-9xl text-storeos-text tracking-tighter tabular-nums flex leading-none">
            <span className="text-storeos-red mr-2 md:mr-4">₹</span>
            <AnimatePresence mode="popLayout">
              {formattedLoss.split('').map((char, index) => (
                <motion.span
                  key={`${index}-${char}`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {char}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <span className="text-storeos-red font-extrabold text-xl md:text-3xl uppercase tracking-tighter">{t('per_hour')}</span>
            <span className="text-[10px] md:text-xs text-storeos-muted font-bold tracking-widest uppercase opacity-60">Total Network Drain</span>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-8 w-full max-w-2xl px-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-storeos-border to-transparent" />
          <div className="flex items-center gap-2 text-[10px] font-bold text-storeos-muted uppercase tracking-[0.2em] whitespace-nowrap opacity-50">
            <span className="w-1.5 h-1.5 rounded-full bg-storeos-green animate-pulse" />
            Operational Intelligence Active
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-storeos-border to-transparent" />
        </div>
      </div>
    </div>
  )
}
