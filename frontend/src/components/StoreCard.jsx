import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Activity, Shield, ArrowUpRight } from 'lucide-react'

export default function StoreCard({ store, index }) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const riskLevel = store.coldStorageRiskScore >= 7 ? 'critical' : store.coldStorageRiskScore >= 4 ? 'warning' : 'normal'
  const nodeShortId = store.name.split('-')[1]?.trim() || `NODE-${index + 1}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(`/store/${store._id}`)}
      className="glass-strong group hover:border-storeos-amber/50 cursor-pointer transition-all duration-700 relative overflow-hidden"
    >
      {/* Narrative Gradient Header */}
      <div className={`h-1.5 w-full ${riskLevel === 'critical' ? 'bg-storeos-red' : riskLevel === 'warning' ? 'bg-storeos-amber' : 'bg-emerald-500'
        }`} />

      <div className="p-5 md:p-7 flex flex-col h-full justify-between min-h-[220px]">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="px-2 py-1 rounded-lg bg-storeos-surface/50 border border-storeos-border flex items-center gap-2">
                <Shield className="w-3 h-3 text-storeos-muted opacity-50" />
                <span className="text-[10px] font-black text-storeos-muted uppercase tracking-[0.2em]">{nodeShortId}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${riskLevel === 'critical' ? 'bg-storeos-red animate-pulse' : 'bg-emerald-500'}`} />
                <span className="text-[9px] font-black text-storeos-muted uppercase tracking-widest opacity-50">SYNCED</span>
              </div>
            </div>

            <h3 className="h-premium text-xl md:text-2xl text-storeos-text group-hover:text-storeos-amber transition-colors italic tracking-tighter-premium truncate">
              {store.name.split('-')[0]}
            </h3>
            <p className="text-[9px] font-bold text-storeos-muted uppercase tracking-widest opacity-60 truncate">
              {store.location}
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <div className={`h-premium text-2xl md:text-3xl leading-none ${riskLevel === 'critical' ? 'text-storeos-red text-glow-red' : 'text-storeos-text'}`}>
              ₹{store.lossPerHour}
            </div>
            <p className="text-[8px] md:text-[9px] font-black text-storeos-muted uppercase tracking-widest mt-1.5 opacity-50">{t('DRAIN_RATE')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <p className="text-[9px] font-black text-storeos-muted uppercase tracking-widest opacity-40">{t('SIGNAL_COUNT')}</p>
            <div className="flex items-center gap-3">
              <span className={`h-premium text-2xl ${store.activeAlerts > 0 ? 'text-storeos-red' : 'text-storeos-text'}`}>{store.activeAlerts}</span>
              <Activity className={`w-4 h-4 ${store.activeAlerts > 0 ? 'text-storeos-red animate-pulse' : 'text-storeos-muted opacity-20'}`} />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[9px] font-black text-storeos-muted uppercase tracking-widest opacity-40">{t('PROFITABILITY')}</p>
            <span className="h-premium text-2xl text-emerald-500">{store.profitabilityScore}%</span>
          </div>
        </div>

        <div className="pt-5 border-t border-storeos-border/30 flex items-center justify-between group/btn mt-auto">
          <span className="text-[8px] md:text-[9px] font-black text-storeos-muted uppercase tracking-[0.2em] group-hover/btn:text-storeos-amber transition-colors truncate">OPERATIONAL_NODE_DETAIL</span>
          <ArrowUpRight className="w-4 h-4 text-storeos-muted group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 group-hover/btn:text-storeos-amber transition-all flex-shrink-0" />
        </div>
      </div>
    </motion.div>
  )
}
