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
    <div className="min-h-screen bg-storeos-bg transition-all duration-500">
      <TopBar demoMode={demoMode} />
      <div className="h-[90px] w-full" /> {/* Bulletproof Header Spacer */}

      <main className="max-w-[1440px] mx-auto px-8 md:px-16 lg:px-20 py-10 relative">
        {/* Ambient Store Profile Glow */}
        <div className="fixed top-0 right-0 w-[40%] h-[40%] bg-storeos-amber/5 blur-[120px] rounded-full pointer-events-none -z-10" />
        
        {/* Commander Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-12">
          <div className="flex items-start gap-8">
            <motion.button
              whileHover={{ scale: 1.1, x: -5 }}
              onClick={() => navigate('/')}
              className="mt-2 p-4 rounded-3xl bg-storeos-surface/50 border border-storeos-border text-storeos-muted hover:text-storeos-amber hover:border-storeos-amber transition-all shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </motion.button>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t('NODE_ONLINE')}
                </div>
                <span className="text-[10px] font-black text-storeos-muted uppercase tracking-[0.3em] opacity-40">/ CLUSTER-BNG-04</span>
              </div>
              <h1 className="h-premium text-5xl md:text-7xl tracking-tighter-premium text-storeos-text leading-none italic">
                {store.name}
              </h1>
              <p className="text-lg text-storeos-muted font-bold mt-4 tracking-tight group cursor-default">
                <span className="text-storeos-amber opacity-60 mr-2">LOCATION:</span>
                {store.location}
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="glass-strong p-8 min-w-[280px] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-storeos-red/5 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2" />
              <div className="flex items-baseline gap-3 justify-end relative z-10">
                <span className="h-premium text-storeos-red text-6xl text-glow-red italic">₹{totalStoreLoss.toFixed(0)}</span>
                <span className="h-premium text-storeos-red/40 text-lg uppercase tracking-widest">{t('hr')}</span>
              </div>
              <div className="text-[9px] font-black text-storeos-muted uppercase tracking-[0.4em] text-right mt-2 opacity-50">{t('REALTIME_DRAIN_RATE')}</div>
            </div>
            
            <button className="hidden xl:flex items-center justify-center p-8 glass group hover:border-storeos-amber transition-all duration-500">
               <div className="text-[10px] font-black text-storeos-amber uppercase tracking-[0.3em] rotate-90 whitespace-nowrap">{t('REPORTS')}</div>
            </button>
          </div>
        </div>

        {/* Dense Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* LEFT: Live Inventory Node */}
          <div className="xl:col-span-4 order-2 xl:order-1">
            <div className="glass p-1 rounded-2xl overflow-hidden group">
              <div className="bg-storeos-surface/30 p-5 md:p-6">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="h-premium text-2xl text-storeos-text mb-1 italic">
                      {t('TELEMETRY_FEED')}
                    </h3>
                    <p className="text-[10px] font-black text-storeos-muted uppercase tracking-[0.3em] opacity-40">SYSTEM-WIDE INVENTORY STATUS</p>
                  </div>
                  <div className="glass px-4 py-2 rounded-2xl flex items-center gap-3 border-storeos-border/50">
                    <span className="h-premium text-lg text-storeos-text">{store.skus?.length || 0}</span>
                    <span className="text-[9px] font-black text-storeos-muted tracking-widest uppercase opacity-40">ENTRIES</span>
                  </div>
                </div>
                <div className="max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                   <SKUTable skus={store.skus || []} />
                </div>
              </div>
            </div>
          </div>

          {/* CENTER: Cognitive Alerts & Logic */}
          <div className="xl:col-span-5 space-y-6 order-1 xl:order-2">
            <div className="flex flex-col gap-8">
              {silentLossAlerts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass p-8 border-l-4 border-l-storeos-red relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-storeos-red/5 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-storeos-red/10 transition-colors duration-500" />
                  
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <h3 className="h-premium text-xl text-storeos-red flex items-center gap-3">
                      <span className="flex h-3 w-3 rounded-full bg-storeos-red animate-ping" />
                      {t('SILENT_LOSS_DETECTION')}
                    </h3>
                    <span className="text-[9px] font-black text-storeos-red uppercase tracking-widest opacity-50">CRITICAL THREAT</span>
                  </div>
                  
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
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass p-8 border-l-4 border-l-storeos-amber relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-48 h-48 bg-storeos-amber/5 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
                  <h3 className="h-premium text-xl text-storeos-amber mb-8 flex items-center gap-3 uppercase italic">
                    <span className="text-xl">!</span> {t('DECISION_CONFLICT')}
                  </h3>
                  <div className="space-y-4 relative z-10">
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
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass p-8 border-l-4 border-l-storeos-cold"
                >
                  <h3 className="h-premium text-xl text-storeos-text mb-8 flex items-center gap-3 uppercase italic">
                    <span className="text-xl">⌛</span> {t('EXPIRY_TELEMETRY')}
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
                <div className="glass-strong p-16 text-center group transition-all duration-700">
                  <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-emerald-500 text-4xl group-hover:rotate-12 transition-transform duration-500 shadow-inner">✓</div>
                  <h3 className="h-premium text-2xl text-emerald-500 mb-2 italic">STATUS: OPTIMAL</h3>
                  <p className="text-[10px] font-black text-storeos-muted tracking-[0.4em] uppercase opacity-40">All intelligence nodes synchronized</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Operational Sensors & Global Metrics */}
          <div className="xl:col-span-3 space-y-8 order-3">
            <ColdStoragePanel store={store} />

            <div className="glass p-8 group overflow-hidden relative">
               <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-storeos-amber/40 to-transparent" />
               <h3 className="h-premium text-xl text-storeos-text mb-10 uppercase italic tracking-tighter">{t('CORE_SYSTEMS')}</h3>
               
               <div className="space-y-8 relative z-10">
                {[
                  { label: t('orders_per_hour'), value: store.ordersPerHour, color: 'text-storeos-cold' },
                  { label: t('profitability'), value: `${store.profitabilityScore}%`, color: store.profitabilityScore > 60 ? 'text-emerald-500' : 'text-storeos-amber' },
                  { label: t('active_alerts'), value: store.alerts?.length || 0, color: store.alerts?.length > 3 ? 'text-storeos-red' : 'text-storeos-text' },
                  { label: t('items_expiring'), value: store.itemsExpiringSoon || 0, color: 'text-storeos-amber' },
                ].map((m, i) => (
                  <div key={i} className="group/item flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-storeos-muted uppercase tracking-[0.2em] opacity-50 group-hover/item:opacity-100 transition-opacity">{m.label}</span>
                      <span className={`h-premium text-3xl tabular-nums ${m.color}`}>{m.value}</span>
                    </div>
                    <div className="h-0.5 w-full bg-storeos-border/20 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: typeof m.value === 'string' ? m.value : '50%' }}
                         className={`h-full ${m.color.replace('text-', 'bg-')}`} 
                       />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-12 pt-10 border-t border-storeos-border/30">
                <button className="w-full h-16 bg-white text-[#020617] h-premium text-sm uppercase tracking-[0.3em] rounded-3xl hover:bg-amber-500 hover:text-white transition-all duration-500 shadow-2xl active:scale-95 group">
                  {t('EMBEDDED_AGENT')}
                  <span className="block text-[8px] opacity-50 group-hover:opacity-100 transition-opacity">PROMPT HANDOVER INITIATED</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
