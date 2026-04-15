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
    <div className="w-full relative py-8 px-8 md:px-16 lg:px-20 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-rose-500/5 blur-[120px] rounded-full translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[30%] h-full bg-amber-500/5 blur-[120px] rounded-full -translate-x-1/4" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
        
        {/* LEFT: Financial Pulse */}
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.6)]" />
            <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em]">
              LIVE_NETWORK_DRAIN
            </span>
          </div>
          
          <div className="flex items-baseline gap-6">
            <div className="flex items-baseline gap-2">
              <span className="text-xl md:text-2xl text-rose-500/40 font-bold italic tracking-tighter">₹</span>
              <div className="flex h-premium text-6xl md:text-7xl lg:text-8xl tracking-tighter-premium text-white tabular-nums leading-none">
                <AnimatePresence mode="popLayout">
                  {formattedLoss.split('').map((char, index) => (
                    <motion.span
                      key={`${index}-${char}`}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className={char === ',' ? 'opacity-20 mx-1' : ''}
                    >
                      {char}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            <span className="text-xl md:text-2xl text-white/20 font-black italic tracking-widest leading-none">
              /HR
            </span>
          </div>
        </div>

        {/* RIGHT: System Health & Telemetry */}
        <div className="flex items-center gap-12">
          {/* Status Indicators */}
          <div className="hidden xl:flex flex-col items-end gap-3 pr-12 border-r border-white/5">
            <div className="flex gap-1">
               {[...Array(10)].map((_, i) => (
                 <div key={i} className={`w-1 h-4 rounded-full ${i < 7 ? 'bg-emerald-500/40' : 'bg-rose-500 animate-pulse'}`} />
               ))}
            </div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              BUFFER_CAPACITY: <span className="text-rose-500">72%</span>
            </span>
          </div>

          {/* Verification Badge */}
          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="flex -space-x-1.5">
                {[1,2,3].map(i => (
                  <div key={i} className="w-5 h-5 rounded-full bg-[#020617] border-2 border-white/5 flex items-center justify-center">
                    <div className="w-1 h-1 bg-amber-500 rounded-full animate-ping" />
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-black text-amber-500/80 uppercase tracking-widest">
                Ledger Verifying
              </span>
            </div>
            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">
              NODE_CLUSTER_BNG_04
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}
