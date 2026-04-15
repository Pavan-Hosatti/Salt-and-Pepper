import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function CountdownTimer({ hours }) {
  const [remaining, setRemaining] = useState(hours * 3600)

  useEffect(() => {
    setRemaining(hours * 3600)
  }, [hours])

  useEffect(() => {
    if (remaining <= 0) return
    const interval = setInterval(() => {
      setRemaining(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [remaining])

  const h = Math.floor(remaining / 3600)
  const m = Math.floor((remaining % 3600) / 60)
  const s = remaining % 60

  const isUrgent = remaining < 1800
  const isExpired = remaining === 0

  return (
    <motion.div
      className={`h-premium text-2xl tabular-nums rounded-2xl px-4 py-2 border flex items-center gap-3 transition-all duration-700 ${
        isExpired ? 'text-slate-600 bg-white/5 border-white/5 line-through opacity-30 shadow-none' 
        : isUrgent ? 'text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]' 
        : 'text-amber-500/80 bg-amber-500/5 border-amber-500/20'
      }`}
      animate={isUrgent && !isExpired ? { 
        borderColor: ['rgba(244,63,94,0.2)', 'rgba(244,63,94,0.5)', 'rgba(244,63,94,0.2)'],
        boxShadow: ['0 0 10px rgba(244,63,94,0.1)', '0 0 25px rgba(244,63,94,0.3)', '0 0 10px rgba(244,63,94,0.1)']
      } : {}}
      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
    >
      <div className="flex items-center gap-1.5 translate-y-[1px]">
        {String(h).padStart(2, '0')}
        <span className="opacity-30 text-sm">:</span>
        {String(m).padStart(2, '0')}
        <span className="opacity-30 text-sm">:</span>
        {String(s).padStart(2, '0')}
      </div>
      
      {!isExpired && isUrgent && (
        <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
      )}
    </motion.div>
  )
}
