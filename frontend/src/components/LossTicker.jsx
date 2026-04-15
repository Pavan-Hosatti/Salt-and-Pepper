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
    <div className="w-full relative py-8 px-8 md:px-16 lg:px-20 bg-storeos-surface/40 border-b border-storeos-border/50 overflow-hidden transition-all duration-700">
      {/* Dynamic Aura Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-storeos-red/10 blur-[150px] rounded-full translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[30%] h-full bg-storeos-amber/10 blur-[150px] rounded-full -translate-x-1/4" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
        {/* Left Side: Context & Agent Status */}
        <div className="flex flex-col items-center md:items-start gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-storeos-red/10 border border-storeos-red/20">
                <motion.div 
                  animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }} 
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-2 h-2 bg-storeos-red rounded-full shadow-[0_0_12px_rgba(248,113,113,0.8)]" 
                />
                <span className="text-[10px] font-black tracking-[0.3em] text-storeos-red uppercase">
                  {t('network_leakage')}
                </span>
             </div>
          </div>
          <div className="flex items-center gap-4 bg-storeos-bg/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-storeos-border/50">
             <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full bg-storeos-red/20 border-2 border-storeos-bg flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-storeos-red rounded-full animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                  </div>
                ))}
             </div>
             <span className="text-[9px] font-black uppercase tracking-widest text-storeos-muted opacity-60">
                {t('ai_mitigation_active')}
             </span>
          </div>
        </div>

        {/* Center: The Massive Ticker */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-baseline gap-4 md:gap-8 group">
            <span className="h-premium text-4xl md:text-6xl text-storeos-red text-glow-red opacity-80 group-hover:scale-110 transition-transform duration-500 italic">₹</span>
            <div className="h-premium text-6xl md:text-8xl lg:text-9xl tracking-tighter-premium text-storeos-text tabular-nums flex leading-[0.8]">
              <AnimatePresence mode="popLayout transition-all duration-300">
                {formattedLoss.split('').map((char, index) => (
                  <motion.span
                    key={`${index}-${char}`}
                    initial={{ y: 25, opacity: 0, scale: 0.8 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -25, opacity: 0, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={char === ',' ? 'opacity-30 mx-1' : ''}
                  >
                    {char}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Side: High-res metrics */}
        <div className="flex flex-col items-center md:items-end gap-2 flex-shrink-0">
          <div className="flex items-center gap-3">
             <span className="h-premium text-3xl md:text-4xl text-storeos-red italic">{t('per_hour')}</span>
             <span className="h-premium text-xl md:text-2xl text-storeos-muted opacity-30 mt-1">/ {t('cluster')}</span>
          </div>
          <div className="h-1.5 w-full md:w-48 bg-storeos-border/30 rounded-full overflow-hidden mt-4">
             <motion.div 
               initial={{ x: '-100%' }}
               animate={{ x: '100%' }}
               transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
               className="h-full w-24 bg-gradient-to-r from-transparent via-storeos-red/40 to-transparent" 
             />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-storeos-muted opacity-40 mt-2">
            Verifying Transactions on Algorand Ledger
          </span>
        </div>
      </div>
    </div>
  )
}
