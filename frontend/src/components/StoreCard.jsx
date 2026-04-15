import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

export default function StoreCard({ store, index }) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const riskLevel = store.coldStorageRiskScore >= 7 ? 'critical' : store.coldStorageRiskScore >= 4 ? 'warning' : 'normal'
  const riskColor = riskLevel === 'critical' ? 'text-red-500' : riskLevel === 'warning' ? 'text-amber-500' : 'text-emerald-500'
  const riskBg = riskLevel === 'critical' ? 'bg-red-500' : riskLevel === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onClick={() => navigate(`/store/${store._id}`)}
      className="bg-storeos-bg rounded-2xl border border-storeos-border shadow-sm hover:shadow-xl hover:shadow-storeos-amber/10 cursor-pointer transition-all duration-300 hover:-translate-y-1 group overflow-hidden"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${riskLevel === 'critical' ? 'bg-storeos-red animate-pulse' : 'bg-storeos-green'}`} />
              <span className="text-[10px] font-semibold text-storeos-muted uppercase tracking-wider">Node {index + 1}</span>
            </div>
            <h3 className="font-sans font-bold text-xl text-storeos-text group-hover:text-storeos-amber transition-colors">
              {store.name}
            </h3>
            <p className="text-xs text-storeos-muted mt-0.5">{store.location}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-storeos-red">
              ₹{store.lossPerHour?.toFixed(0) || 0}
            </div>
            <div className="text-[10px] font-medium text-storeos-muted">{t('loss_per_hour')}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-storeos-surface rounded-xl px-4 py-3 border border-storeos-border">
            <div className="text-[10px] font-medium text-storeos-muted mb-1">{t('active_alerts')}</div>
            <div className={`text-xl font-bold font-mono ${store.activeAlerts > 3 ? 'text-storeos-red' : 'text-storeos-text'}`}>
              {String(store.activeAlerts).padStart(2, '0')}
            </div>
          </div>
          <div className="bg-storeos-surface rounded-xl px-4 py-3 border border-storeos-border">
            <div className="text-[10px] font-medium text-storeos-muted mb-1">{t('orders_per_hour')}</div>
            <div className="text-xl font-bold font-mono text-storeos-cold">
              {String(store.ordersPerHour).padStart(2, '0')}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium text-storeos-muted">{t('cold_storage_risk')}</span>
              <span className={`text-[10px] font-bold uppercase ${riskColor}`}>{riskLevel}</span>
            </div>
            <div className="flex gap-1 h-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-full rounded-full ${
                    i < store.coldStorageRiskScore 
                      ? (riskLevel === 'critical' ? 'bg-storeos-red' : 'bg-storeos-amber')
                      : 'bg-storeos-border'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-storeos-border">
            <span className="text-[10px] font-medium text-storeos-muted">{t('profitability')}</span>
            <span className={`text-sm font-bold ${store.profitabilityScore > 60 ? 'text-storeos-green' : 'text-storeos-amber'}`}>{store.profitabilityScore}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
