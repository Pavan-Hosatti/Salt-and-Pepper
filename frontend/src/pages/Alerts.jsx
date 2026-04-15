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
    <div className="min-h-screen bg-storeos-surface transition-colors duration-500">
      <TopBar demoMode={demoMode} />

      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-storeos-muted uppercase tracking-widest">{t('operational_control')}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-storeos-red animate-pulse" />
            </div>
            <h1 className="font-sans font-extrabold text-3xl md:text-4xl text-storeos-text tracking-tight">
              {t('alerts_control')}
            </h1>
          </div>
          
          <div className="flex items-center gap-4 md:gap-8 bg-storeos-bg border border-storeos-border rounded-2xl p-5 shadow-sm">
            <div className="text-right">
              <div className="text-[10px] font-bold text-storeos-muted uppercase tracking-widest mb-1">{t('money_at_stake')}</div>
              <div className="font-mono font-bold text-2xl text-storeos-red leading-none">₹{totalAtStake.toFixed(0)}</div>
            </div>
            <div className="w-px h-10 bg-storeos-border hidden sm:block" />
            <div className="text-right">
              <div className="text-[10px] font-bold text-storeos-muted uppercase tracking-widest mb-1">Total Signals</div>
              <div className="font-mono font-bold text-2xl text-storeos-text leading-none">{filteredAlerts.length}</div>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-storeos-bg border border-storeos-border rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-bold text-storeos-muted uppercase tracking-widest">{t('filter_by_store')}</span>
              <div className="flex flex-wrap bg-storeos-surface rounded-xl p-1 border border-storeos-border">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filter === 'all' ? 'bg-storeos-bg text-storeos-text shadow-md' : 'text-storeos-muted hover:text-storeos-text'}`}
                >
                  {t('all').toUpperCase()}
                </button>
                {storeNames.map(name => (
                  <button
                    key={name}
                    onClick={() => setFilter(name)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filter === name ? 'bg-storeos-bg text-storeos-text shadow-md' : 'text-storeos-muted hover:text-storeos-text'}`}
                  >
                    {name.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-bold text-storeos-muted uppercase tracking-widest">{t('priority_level')}</span>
              <div className="flex bg-storeos-surface rounded-xl p-1 border border-storeos-border">
                {['all', 'critical', 'warning'].map(sev => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                      severityFilter === sev 
                        ? (sev === 'critical' ? 'bg-storeos-red text-white shadow-lg shadow-storeos-red/20' : sev === 'warning' ? 'bg-storeos-amber text-white shadow-lg shadow-storeos-amber/20' : 'bg-storeos-bg text-storeos-text shadow-md') 
                        : 'text-storeos-muted hover:text-storeos-text'
                    }`}
                  >
                    {sev === 'all' ? t('all').toUpperCase() : t(sev).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Alert List Container */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-storeos-green/5 rounded-3xl border-2 border-dashed border-storeos-green/20 p-20 text-center"
            >
              <div className="w-20 h-20 bg-storeos-green/10 rounded-full flex items-center justify-center mx-auto mb-6 text-storeos-green text-3xl">✓</div>
              <div className="text-storeos-green font-bold text-xl tracking-tight">{t('all_systems_optimal')}</div>
              <p className="text-sm text-storeos-muted mt-2 uppercase tracking-widest">No signals matching current protocol</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredAlerts.map((alert, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <AlertCard
                    alert={alert}
                    onResolve={handleResolve}
                    resolved={resolvedAlerts.has(`${alert.sku}-${alert.type}-${alert.storeId}`)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
