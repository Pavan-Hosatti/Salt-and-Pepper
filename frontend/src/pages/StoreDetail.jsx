import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import api from '../api'
import TopBar from '../components/TopBar'
import SKUTable from '../components/SKUTable'
import AlertCard from '../components/AlertCard'
import ColdStoragePanel from '../components/ColdStoragePanel'

export default function StoreDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [resolvedAlerts, setResolvedAlerts] = useState(new Set())
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const [storeRes, statusRes] = await Promise.all([
          api.get(`/api/stores/${id}`),
          api.get('/api/status'),
        ])
        setStore(storeRes.data)
        setDemoMode(statusRes.data.isDemoMode)
      } catch (err) {
        console.error('Failed to load store:', err)
      }
      setLoading(false)
    }
    fetchStore()
  }, [id])

  const handleResolve = async (alert) => {
    try {
      await api.post('/api/actions/resolve', {
        storeId: alert.storeId,
        sku: alert.sku,
        action: alert.recommendation || 'Acknowledged',
        savings: alert.savedIfFollowed || 0,
      })
      setResolvedAlerts(prev => new Set([...prev, `${alert.sku}-${alert.type}`]))
    } catch (err) {
      console.error('Failed to resolve:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-sm text-amber-500 animate-pulse font-medium">Loading store data...</div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-sm text-red-500 font-medium">Store not found</div>
      </div>
    )
  }

  const silentLossAlerts = store.alerts?.filter(a => a.type === 'silent_loss') || []
  const conflictAlerts = store.alerts?.filter(a => a.type === 'conflict') || []
  const expiryAlerts = store.alerts?.filter(a => a.type === 'expiry_warning') || []
  const totalStoreLoss = store.lossPerHour || 0

  return (
    <div className="min-h-screen bg-storeos-surface transition-colors duration-500">
      <TopBar demoMode={demoMode} />

      <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/')}
              className="mt-1 p-2 rounded-xl bg-storeos-bg border border-storeos-border text-storeos-muted hover:text-storeos-amber hover:border-storeos-amber transition-all"
              title={t('back_to_network')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-storeos-muted uppercase tracking-widest">{t('store_node')}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-storeos-green" />
              </div>
              <h1 className="font-sans font-extrabold text-3xl md:text-4xl text-storeos-text tracking-tight">{store.name}</h1>
              <p className="text-sm text-storeos-muted font-medium mt-1">{store.location}</p>
            </div>
          </div>
          
          <div className="bg-storeos-bg border border-storeos-border rounded-2xl p-5 shadow-sm min-w-[200px]">
            <div className="flex items-baseline gap-2 justify-end">
              <span className="text-storeos-red font-extrabold text-4xl tabular-nums">₹{totalStoreLoss.toFixed(0)}</span>
              <span className="text-storeos-red/60 font-bold text-sm uppercase tracking-tighter">{t('per_hour')}</span>
            </div>
            <div className="text-[10px] font-bold text-storeos-muted uppercase tracking-widest text-right mt-1">{t('current_drain_rate')}</div>
          </div>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT — SKU Table (Responsive Container) */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="bg-storeos-bg rounded-2xl border border-storeos-border shadow-sm p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-sans font-extrabold text-sm text-storeos-text tracking-tight uppercase">
                  {t('sku_inventory')}
                </h3>
                <span className="text-[10px] font-bold text-storeos-muted bg-storeos-surface px-2 py-1 rounded-md border border-storeos-border">
                  {store.skus?.length || 0} ITEMS
                </span>
              </div>
              <SKUTable skus={store.skus || []} />
            </div>
          </div>

          {/* CENTER — Alerts & Intelligence */}
          <div className="lg:col-span-4 space-y-6 order-1 lg:order-2">
            {silentLossAlerts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-storeos-bg rounded-2xl border border-storeos-red/20 shadow-lg shadow-storeos-red/5 p-5 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-storeos-red/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <h3 className="font-sans font-extrabold text-sm text-storeos-red mb-5 flex items-center gap-2 relative z-10">
                  <span className="w-2 h-2 rounded-full bg-storeos-red animate-pulse" />
                  {t('silent_loss_detected').toUpperCase()}
                </h3>
                <div className="space-y-4 relative z-10">
                  {silentLossAlerts.map((alert, idx) => (
                    <AlertCard
                      key={idx}
                      alert={alert}
                      onResolve={handleResolve}
                      resolved={resolvedAlerts.has(`${alert.sku}-${alert.type}`)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {conflictAlerts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-storeos-bg rounded-2xl border-2 border-storeos-amber/20 shadow-lg shadow-storeos-amber/5 p-5"
              >
                <h3 className="font-sans font-extrabold text-sm text-storeos-amber mb-5 flex items-center gap-2 uppercase tracking-tight">
                  <span className="text-xl">⚠️</span> {t('decision_conflict')}
                </h3>
                <div className="space-y-4">
                  {conflictAlerts.map((alert, idx) => (
                    <AlertCard
                      key={idx}
                      alert={alert}
                      onResolve={handleResolve}
                      resolved={resolvedAlerts.has(`${alert.sku}-${alert.type}`)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {expiryAlerts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-storeos-bg rounded-2xl border border-storeos-border shadow-sm p-5"
              >
                <h3 className="font-sans font-extrabold text-sm text-storeos-text mb-5 flex items-center gap-2 uppercase">
                  <span className="text-lg">⏰</span> {t('action_timer').toUpperCase()}
                </h3>
                <div className="space-y-4">
                  {expiryAlerts.map((alert, idx) => (
                    <AlertCard
                      key={idx}
                      alert={alert}
                      onResolve={handleResolve}
                      resolved={resolvedAlerts.has(`${alert.sku}-${alert.type}`)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {silentLossAlerts.length === 0 && conflictAlerts.length === 0 && expiryAlerts.length === 0 && (
              <div className="bg-storeos-green/5 rounded-2xl border border-storeos-green/10 p-12 text-center">
                <div className="w-16 h-16 bg-storeos-green/10 rounded-full flex items-center justify-center mx-auto mb-4 text-storeos-green text-2xl">✓</div>
                <div className="text-storeos-green font-bold text-sm tracking-tight">{t('all_systems_optimal')}</div>
                <p className="text-xs text-storeos-muted mt-2 tracking-wide uppercase">{t('no_active_alerts')}</p>
              </div>
            )}
          </div>

          {/* RIGHT — Cold Storage & Metrics */}
          <div className="lg:col-span-3 space-y-6 order-3">
            <ColdStoragePanel store={store} />

            <div className="bg-storeos-bg rounded-2xl border border-storeos-border shadow-sm p-6">
              <h3 className="font-sans font-extrabold text-sm text-storeos-text mb-6 uppercase tracking-tight">{t('store_metrics')}</h3>
              <div className="space-y-5">
                {[
                  { label: t('orders_per_hour'), value: store.ordersPerHour, color: 'text-storeos-cold' },
                  { label: t('profitability'), value: `${store.profitabilityScore}%`, color: store.profitabilityScore > 60 ? 'text-storeos-green' : 'text-storeos-amber' },
                  { label: t('active_alerts'), value: store.alerts?.length || 0, color: store.alerts?.length > 3 ? 'text-storeos-red' : 'text-storeos-text' },
                  { label: t('items_expiring'), value: store.itemsExpiringSoon || 0, color: 'text-storeos-amber' },
                ].map((m, i) => (
                  <div key={i} className="flex justify-between items-center group">
                    <span className="text-xs font-medium text-storeos-muted group-hover:text-storeos-text transition-colors uppercase tracking-widest text-[10px]">{m.label}</span>
                    <span className={`text-sm font-bold font-mono tracking-tighter ${m.color}`}>{m.value}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-storeos-border">
                <button className="w-full py-3 bg-storeos-surface border border-storeos-border text-storeos-text text-xs font-bold rounded-xl hover:bg-storeos-bg hover:border-storeos-amber transition-all uppercase tracking-widest">
                  {t('generate_report')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
