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
      className={`font-mono font-bold text-lg tabular-nums px-3 py-1 rounded-lg ${
        isExpired ? 'text-red-400 bg-red-50 line-through' 
        : isUrgent ? 'text-red-500 bg-red-50 animate-pulse' 
        : 'text-amber-600 bg-amber-50'
      }`}
      animate={isUrgent && !isExpired ? { scale: [1, 1.03, 1] } : {}}
      transition={{ repeat: Infinity, duration: 1 }}
    >
      {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </motion.div>
  )
}
