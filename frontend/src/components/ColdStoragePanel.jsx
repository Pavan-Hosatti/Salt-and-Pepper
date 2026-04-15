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
    <div className="glass-strong p-8 md:p-10 group relative overflow-hidden transition-all duration-700">
      {/* Thermal Glow Background */}
      <div className={`absolute top-0 right-0 w-48 h-48 blur-[80px] opacity-10 rounded-full translate-x-1/2 -translate-y-1/2 transition-colors duration-1000 ${
        store.coldStorageTemp > 8 ? 'bg-storeos-red' : store.coldStorageTemp > 6 ? 'bg-storeos-amber' : 'bg-storeos-cold'
      }`} />

      <div className="flex items-center justify-between mb-10 relative z-10">
        <div>
           <h3 className="h-premium text-2xl text-storeos-text mb-1 italic">{t('THERMAL_MATRIX')}</h3>
           <p className="text-[10px] font-black text-storeos-muted uppercase tracking-[0.3em] opacity-40">REAL-TIME SENSOR ARRAY x04</p>
        </div>
        {!mlOnline && (
          <span className="flex items-center gap-2 px-3 py-1 bg-storeos-red text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-storeos-red/20 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            MANUAL OVERRIDE
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-10 relative z-10">
        {[
          { label: t('temperature'), value: `${store.coldStorageTemp}°C`, color: store.coldStorageTemp > 8 ? 'text-storeos-red' : 'text-storeos-cold' },
          { label: t('utilization'), value: `${store.coldStorageUsagePct}%`, color: store.coldStorageUsagePct > 85 ? 'text-storeos-red' : 'text-emerald-500' },
          { label: t('risk_index'), value: `${score}/10`, color: statusColor }
        ].map((stat, i) => (
          <div key={i} className="bg-storeos-surface/40 border border-storeos-border/50 rounded-2xl p-4 text-center group/stat hover:border-storeos-amber/30 transition-colors">
            <div className="text-[9px] font-black text-storeos-muted mb-2 uppercase tracking-widest opacity-50 group-hover/stat:opacity-100">{stat.label}</div>
            <div className={`h-premium text-2xl md:text-3xl ${stat.color} transition-all`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-10 relative z-10">
        <div className="flex items-center justify-between mb-4">
           <span className="text-[10px] font-black text-storeos-muted uppercase tracking-widest opacity-40">{t('HAZARD_PROBABILITY')}</span>
           <span className={`text-[10px] font-black uppercase tracking-widest ${statusColor}`}>{status}</span>
        </div>
        <div className="flex gap-2 h-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              className={`flex-1 rounded-sm ${i < score ? barColor : 'bg-storeos-border/30 opacity-20'} shadow-inner`}
              initial={{ scaleY: 0.2, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ delay: i * 0.05, type: 'spring' }}
            />
          ))}
        </div>
      </div>

      {riskData?.alternatives && riskData.alternatives.length > 0 && (
        <div className="mt-10 pt-10 border-t border-storeos-border/50 relative z-10">
          <h4 className="h-premium text-lg text-storeos-amber mb-6 italic tracking-tight">{t('COGNITIVE_OVERRIDE_OPTIONS')}</h4>
          <div className="space-y-4">
            {riskData.alternatives.map((alt, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ x: 5 }}
                className={`glass p-5 group/alt cursor-pointer transition-all border-l-4 ${alt.recommendation === 'high' ? 'border-l-emerald-500 bg-emerald-500/5' : 'border-l-storeos-border/50 hover:border-l-storeos-amber bg-storeos-surface/30'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black text-storeos-text group-hover/alt:text-storeos-amber transition-colors uppercase tracking-wide">{alt.action}</span>
                  <span className={`text-[9px] font-black px-2 py-1 rounded-md border tracking-widest ${alt.recommendation === 'high' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-storeos-surface text-storeos-muted border-storeos-border'}`}>
                    {alt.recommendation.toUpperCase()}
                  </span>
                </div>
                <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
                  <span className="text-storeos-muted opacity-60">IMPACT: <span className="text-storeos-red">₹{alt.cost}</span></span>
                  <span className="text-storeos-muted opacity-60">RECOVERY: <span className="text-emerald-500">₹{alt.savings}</span></span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
