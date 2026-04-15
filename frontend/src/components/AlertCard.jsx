import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import CountdownTimer from './CountdownTimer'
import { AlertCircle, Brain, Zap, ShieldCheck } from 'lucide-react'

export default function AlertCard({ alert, onResolve, resolved }) {
  const { t } = useTranslation()

  const isConflict = alert.type === 'conflict'
  const isCritical = alert.severity === 'critical'
  const typeLabel = alert.type === 'silent_loss' ? t('silent_loss') : alert.type === 'conflict' ? t('conflict_detected') : 'EXPIRY'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className={`glass-strong p-4 md:p-5 relative overflow-hidden transition-all duration-700 border-l-4 group ${
        resolved ? 'opacity-50 grayscale select-none' : 
        isCritical ? 'border-l-storeos-red' : 'border-l-storeos-amber'
      }`}
    >
      {/* Immersive Scan Glow */}
      {!resolved && (
        <div className={`absolute top-0 right-0 w-[40%] h-full blur-[100px] opacity-10 rounded-full translate-x-1/2 pointer-events-none transition-colors duration-1000 ${
          isCritical ? 'bg-storeos-red' : 'bg-storeos-amber'
        }`} />
      )}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10 w-full">
        
        {/* LEFT: Identity & Status */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className={`h-premium text-[10px] px-3 py-1.5 rounded-xl border-2 uppercase tracking-[0.2em] font-black shadow-lg ${
              isCritical ? 'bg-storeos-red text-white border-storeos-red/20' : 'bg-storeos-amber text-white border-storeos-amber/20'
            }`}>
              {typeLabel}
            </span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-storeos-surface/50 border border-storeos-border">
              <span className="text-[10px] font-black text-storeos-muted uppercase tracking-widest">{alert.storeName}</span>
              <span className="w-1 h-3 border-l border-storeos-border" />
              <span className="text-[10px] font-black text-storeos-amber uppercase tracking-widest opacity-80">{alert.shelfSlot}</span>
            </div>
          </div>
          
          <h3 className="h-premium text-sm md:text-base text-storeos-text tracking-tight leading-snug pr-4">
            {alert.message}
          </h3>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <Brain className={`w-4 h-4 ${isCritical ? 'text-storeos-red' : 'text-storeos-amber'}`} />
                <span className="text-xs font-bold text-storeos-muted line-clamp-1 italic opacity-70">
                  {alert.recommendation}
                </span>
             </div>
          </div>
        </div>

        {/* CENTER: Real-time Telemetry Metrics */}
        <div className="flex flex-wrap items-center gap-6 lg:px-8 lg:border-l lg:border-r border-storeos-border/30">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-1">{t('SAVINGS_POTENTIAL')}</span>
            <span className="font-mono text-lg text-emerald-500 font-bold">₹{alert.savedIfFollowed}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-storeos-red uppercase tracking-[0.3em] mb-1">{t('DRAIN_RISK')}</span>
            <span className="font-mono text-lg text-storeos-red font-bold">₹{alert.lostIfIgnored}</span>
          </div>
        </div>

        {/* RIGHT: Agent Action Portal */}
        <div className="flex flex-col gap-3 min-w-[160px]">
          <div className="flex justify-end">
            <CountdownTimer hours={alert.timeRemaining || 1} />
          </div>
          
          {!resolved ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onResolve(alert)}
              className="w-full h-10 bg-white text-[#020617] h-premium text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-xl active:shadow-inner flex items-center justify-center gap-2 group"
            >
              <Zap className="w-4 h-4 group-hover:fill-current" />
              {t('handover_resolution')}
            </motion.button>
          ) : (
            <div className="w-full h-14 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl flex items-center justify-center gap-3 text-emerald-500 text-xs font-black uppercase tracking-[0.3em] opacity-100">
              <ShieldCheck className="w-5 h-5" />
              {t('SYNCHRONIZED')}
            </div>
          )}
        </div>
      </div>
      
      {/* Trace Light Effect */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-storeos-border/50 to-transparent" />
    </motion.div>
  )
}
