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
    <div className="min-h-screen bg-gray-50/50">
      <TopBar demoMode={demoMode} />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-xs font-medium text-gray-400 hover:text-amber-500 transition-colors"
            >
              {t('back_to_network')}
            </button>
            <div>
              <h1 className="font-sans font-extrabold text-2xl text-gray-900">{store.name}</h1>
              <p className="text-xs text-gray-400">{store.location}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-sans font-extrabold text-3xl text-red-500">
              ₹{totalStoreLoss.toFixed(0)}<span className="text-lg text-red-300">{t('per_hour')}</span>
            </div>
            <div className="text-xs text-gray-400">{t('loss_per_hour')}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT — SKU Table */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-sans font-bold text-sm text-gray-900 mb-4">
                SKU Inventory
              </h3>
              <SKUTable skus={store.skus || []} />
            </div>
          </div>

          {/* CENTER — Alerts & Conflicts */}
          <div className="lg:col-span-4 space-y-4">
            {silentLossAlerts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl border border-red-100 shadow-sm p-5"
              >
                <h3 className="font-sans font-bold text-sm text-red-500 mb-4">
                  🔴 {t('silent_loss')}
                </h3>
                <div className="space-y-3">
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border-2 border-red-200 shadow-sm p-5"
              >
                <h3 className="font-sans font-extrabold text-lg text-red-500 mb-4">
                  ⚠ {t('conflict_detected')}
                </h3>
                <div className="space-y-3">
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5"
              >
                <h3 className="font-sans font-bold text-sm text-amber-500 mb-4">
                  ⏰ {t('action_timer')}
                </h3>
                <div className="space-y-3">
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
              <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-8 text-center">
                <div className="text-emerald-600 font-semibold text-sm">✓ All Clear — No Active Alerts</div>
              </div>
            )}
          </div>

          {/* RIGHT — Cold Storage & Stats */}
          <div className="lg:col-span-3 space-y-4">
            <ColdStoragePanel store={store} />

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-sans font-bold text-sm text-gray-900 mb-4">Store Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">{t('orders_per_hour')}</span>
                  <span className="text-sm font-bold font-mono text-blue-500">{store.ordersPerHour}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">{t('profitability')}</span>
                  <span className={`text-sm font-bold font-mono ${store.profitabilityScore > 60 ? 'text-emerald-500' : 'text-amber-500'}`}>{store.profitabilityScore}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">{t('active_alerts')}</span>
                  <span className={`text-sm font-bold font-mono ${store.alerts?.length > 3 ? 'text-red-500' : 'text-gray-900'}`}>{store.alerts?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">{t('items_expiring')}</span>
                  <span className="text-sm font-bold font-mono text-amber-500">{store.itemsExpiringSoon || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
