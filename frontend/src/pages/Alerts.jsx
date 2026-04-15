import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import api from '../api'
import TopBar from '../components/TopBar'
import AlertCard from '../components/AlertCard'

export default function Alerts() {
  const { t } = useTranslation()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [resolvedAlerts, setResolvedAlerts] = useState(new Set())
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const [alertsRes, statusRes] = await Promise.all([
          api.get('/api/alerts'),
          api.get('/api/status'),
        ])
        setAlerts(alertsRes.data)
        setDemoMode(statusRes.data.isDemoMode)
      } catch (err) {
        console.error('Failed to load alerts:', err)
      }
      setLoading(false)
    }
    fetchAlerts()
  }, [])

  const handleResolve = async (alert) => {
    try {
      await api.post('/api/actions/resolve', {
        storeId: alert.storeId,
        sku: alert.sku,
        action: alert.recommendation || 'Acknowledged',
        savings: alert.savedIfFollowed || 0,
      })
      setResolvedAlerts(prev => new Set([...prev, `${alert.sku}-${alert.type}-${alert.storeId}`]))
    } catch (err) {
      console.error('Failed to resolve:', err)
    }
  }

  const storeNames = [...new Set(alerts.map(a => a.storeName))]

  const filteredAlerts = alerts.filter(a => {
    if (filter !== 'all' && a.storeName !== filter) return false
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false
    return true
  })

  const totalAtStake = filteredAlerts.reduce((sum, a) => sum + (a.lossPerHour || a.lostIfIgnored || 0), 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-sm text-amber-500 animate-pulse font-medium">Loading alerts...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <TopBar demoMode={demoMode} />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-sans font-extrabold text-2xl text-gray-900">
            {t('alerts_control')}
          </h1>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-gray-400">{t('money_at_stake')}</div>
              <div className="font-mono font-bold text-xl text-red-500">₹{totalAtStake.toFixed(0)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">Total</div>
              <div className="font-mono font-bold text-xl text-gray-900">{filteredAlerts.length}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400">{t('filter_by_store')}:</span>
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {t('all')}
              </button>
              {storeNames.map(name => (
                <button
                  key={name}
                  onClick={() => setFilter(name)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${filter === name ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400">{t('severity')}:</span>
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {['all', 'critical', 'warning'].map(sev => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    severityFilter === sev 
                      ? (sev === 'critical' ? 'bg-red-500 text-white shadow-sm' : sev === 'warning' ? 'bg-amber-500 text-white shadow-sm' : 'bg-white text-gray-900 shadow-sm') 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {sev === 'all' ? t('all') : t(sev)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Alert List */}
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-8 text-center">
              <div className="text-emerald-600 font-semibold text-sm">✓ No alerts matching filter</div>
            </div>
          ) : (
            filteredAlerts.map((alert, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <AlertCard
                  alert={alert}
                  onResolve={handleResolve}
                  resolved={resolvedAlerts.has(`${alert.sku}-${alert.type}-${alert.storeId}`)}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
