import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import api from '../api'
import TopBar from '../components/TopBar'
import LossTicker from '../components/LossTicker'
import StoreCard from '../components/StoreCard'

export default function NetworkOverview() {
  const { t } = useTranslation()
  const [stores, setStores] = useState([])
  const [totalLoss, setTotalLoss] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storesRes, lossRes, statusRes] = await Promise.all([
          api.get('/api/stores'),
          api.get('/api/loss'),
          api.get('/api/status'),
        ])
        setStores(storesRes.data)
        setTotalLoss(lossRes.data.totalLossPerHour)
        setDemoMode(statusRes.data.isDemoMode)
      } catch (err) {
        setError('Failed to load network data. Is the backend running?')
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const worstStore = stores.reduce((worst, s) => (!worst || s.lossPerHour > worst.lossPerHour ? s : worst), null)

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-sm text-amber-500 animate-pulse font-medium">Loading network data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm text-red-500 mb-4">{error}</div>
          <button onClick={() => window.location.reload()} className="text-xs px-5 py-2.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl font-semibold hover:bg-amber-100 transition-all">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <TopBar demoMode={demoMode} />
      <LossTicker baseAmount={totalLoss} />

      {worstStore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-6 mt-4 p-4 bg-red-50 border border-red-100 rounded-xl"
        >
          <p className="text-xs font-medium text-red-600">
            ⚠ {t('predictive_banner', { store: worstStore.name, amount: (worstStore.lossPerHour * 2).toFixed(0) })}
          </p>
        </motion.div>
      )}

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-sans font-bold text-xl text-gray-900">
            {t('all_stores')}
          </h2>
          <div className="text-xs text-gray-400 font-medium">
            {stores.length} nodes active · {stores.reduce((t, s) => t + s.activeAlerts, 0)} alerts
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stores.map((store, index) => (
            <StoreCard key={store._id} store={store} index={index} />
          ))}
        </div>
      </div>
    </div>
  )
}
