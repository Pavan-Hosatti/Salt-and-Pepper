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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-sans font-bold text-sm text-gray-900">{t('cold_storage')}</h3>
        {!mlOnline && (
          <span className="text-[10px] font-semibold px-2.5 py-1 bg-red-50 text-red-500 rounded-lg border border-red-100">
            BACKUP
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="text-[10px] font-medium text-gray-400 mb-1">{t('temperature')}</div>
          <div className={`text-xl font-bold font-mono ${store.coldStorageTemp > 8 ? 'text-red-500' : store.coldStorageTemp > 6 ? 'text-amber-500' : 'text-blue-500'}`}>
            {store.coldStorageTemp}°C
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="text-[10px] font-medium text-gray-400 mb-1">{t('usage')}</div>
          <div className={`text-xl font-bold font-mono ${store.coldStorageUsagePct > 85 ? 'text-red-500' : store.coldStorageUsagePct > 70 ? 'text-amber-500' : 'text-emerald-500'}`}>
            {store.coldStorageUsagePct}%
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="text-[10px] font-medium text-gray-400 mb-1">{t('risk_score')}</div>
          <div className={`text-xl font-bold font-mono ${statusColor}`}>
            {score}/10
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              className={`h-2.5 flex-1 rounded-full ${i < score ? barColor : 'bg-gray-100'}`}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.05 }}
            />
          ))}
        </div>
      </div>

      {riskData?.alternatives && riskData.alternatives.length > 0 && (
        <div className="mt-5">
          <h4 className="text-xs font-semibold text-amber-600 mb-3">{t('alternatives')}</h4>
          <div className="space-y-2">
            {riskData.alternatives.map((alt, idx) => (
              <div key={idx} className={`bg-gray-50 rounded-xl border p-3 ${alt.recommendation === 'high' ? 'border-emerald-200' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-700">{idx + 1}. {alt.action}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${alt.recommendation === 'high' ? 'bg-emerald-50 text-emerald-600' : alt.recommendation === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                    {alt.recommendation.toUpperCase()}
                  </span>
                </div>
                <div className="flex gap-4 text-[10px]">
                  <span className="text-gray-400">Cost: <span className="text-red-500 font-semibold">₹{alt.cost}</span></span>
                  <span className="text-gray-400">Savings: <span className="text-emerald-500 font-semibold">₹{alt.savings}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
