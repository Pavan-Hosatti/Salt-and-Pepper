import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import api from '../api'

export default function ColdStoragePanel({ store }) {
  const { t } = useTranslation()
  const [riskData, setRiskData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mlOnline, setMlOnline] = useState(true)

  useEffect(() => {
    if (!store) return
    const fetchRisk = async () => {
      setLoading(true)
      try {
        const itemsExpiringSoon = store.skus ? store.skus.filter(s => s.expiryHoursLeft <= 6).length : 0
        const res = await api.post('/api/risk-score', {
          temp: store.coldStorageTemp,
          usagePct: store.coldStorageUsagePct,
          itemsExpiringSoon,
        })
        setRiskData(res.data)
        setMlOnline(res.data.mlOnline !== false)
      } catch (err) {
        setRiskData({
          riskScore: store.coldStorageRiskScore || 5,
          status: 'warning',
          alternatives: [],
        })
        setMlOnline(false)
      }
      setLoading(false)
    }
    fetchRisk()
  }, [store])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-32 mb-4" />
        <div className="h-20 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  const score = riskData?.riskScore || 0
  const status = riskData?.status || 'normal'
  const statusColor = status === 'critical' ? 'text-red-500' : status === 'warning' ? 'text-amber-500' : 'text-emerald-500'
  const barColor = status === 'critical' ? 'bg-red-500' : status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'

  return (
    <div className="bg-storeos-bg rounded-2xl border border-storeos-border shadow-sm p-6 transition-colors duration-300">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-sans font-bold text-sm text-storeos-text tracking-tight uppercase">{t('cold_storage')}</h3>
        {!mlOnline && (
          <span className="text-[10px] font-semibold px-2.5 py-1 bg-storeos-red/10 text-storeos-red rounded-lg border border-storeos-red/20 uppercase tracking-wider">
            BACKUP MODE
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="bg-storeos-surface border border-storeos-border rounded-xl p-3 text-center">
          <div className="text-[10px] font-medium text-storeos-muted mb-1">{t('temperature')}</div>
          <div className={`text-xl font-bold font-mono ${store.coldStorageTemp > 8 ? 'text-storeos-red' : store.coldStorageTemp > 6 ? 'text-storeos-amber' : 'text-storeos-cold'}`}>
            {store.coldStorageTemp}°C
          </div>
        </div>
        <div className="bg-storeos-surface border border-storeos-border rounded-xl p-3 text-center">
          <div className="text-[10px] font-medium text-storeos-muted mb-1">{t('usage')}</div>
          <div className={`text-xl font-bold font-mono ${store.coldStorageUsagePct > 85 ? 'text-storeos-red' : store.coldStorageUsagePct > 70 ? 'text-storeos-amber' : 'text-storeos-green'}`}>
            {store.coldStorageUsagePct}%
          </div>
        </div>
        <div className="bg-storeos-surface border border-storeos-border rounded-xl p-3 text-center">
          <div className="text-[10px] font-medium text-storeos-muted mb-1">{t('risk_score')}</div>
          <div className={`text-xl font-bold font-mono ${statusColor}`}>
            {score}/10
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex gap-1 h-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              className={`flex-1 rounded-full ${i < score ? barColor : 'bg-storeos-border/30'}`}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.05 }}
            />
          ))}
        </div>
      </div>

      {riskData?.alternatives && riskData.alternatives.length > 0 && (
        <div className="mt-5 pt-5 border-t border-storeos-border">
          <h4 className="text-xs font-bold text-storeos-amber mb-3 uppercase tracking-wide">{t('ai_recommendations')}</h4>
          <div className="space-y-3">
            {riskData.alternatives.map((alt, idx) => (
              <div key={idx} className={`bg-storeos-surface rounded-xl border p-3 transition-all hover:shadow-sm ${alt.recommendation === 'high' ? 'border-storeos-green/20 bg-storeos-green/5' : 'border-storeos-border'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-storeos-text">{idx + 1}. {alt.action}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${alt.recommendation === 'high' ? 'bg-storeos-green/10 text-storeos-green border-storeos-green/20' : alt.recommendation === 'medium' ? 'bg-storeos-amber/10 text-storeos-amber border-storeos-amber/20' : 'bg-storeos-muted/10 text-storeos-muted border-storeos-border'}`}>
                    {alt.recommendation.toUpperCase()}
                  </span>
                </div>
                <div className="flex gap-4 text-[10px] font-medium">
                  <span className="text-storeos-muted">Potential Cost: <span className="text-storeos-red">₹{alt.cost}</span></span>
                  <span className="text-storeos-muted">Saved Capital: <span className="text-storeos-green">₹{alt.savings}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
