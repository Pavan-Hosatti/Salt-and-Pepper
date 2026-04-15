import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api'
import TopBar from '../components/TopBar'
import LossTicker from '../components/LossTicker'
import StoreCard from '../components/StoreCard'
import Footer from '../components/Footer'

export default function NetworkOverview() {
  const navigate = useNavigate()
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
      <div className="min-h-screen bg-storeos-bg flex items-center justify-center">
        <div className="text-sm text-storeos-amber animate-pulse font-medium">Loading network data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-storeos-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm text-storeos-red mb-4">{error}</div>
          <button onClick={() => window.location.reload()} className="text-xs px-5 py-2.5 bg-storeos-amber/10 text-storeos-amber border border-storeos-amber/20 rounded-xl font-semibold hover:bg-storeos-amber/20 transition-all">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-storeos-bg transition-all duration-500">
      <TopBar demoMode={demoMode} />
      <div className="h-[90px] w-full" /> {/* Bulletproof Header Spacer */}
      
      {/* Live Operational Ticker */}
      <div className="relative z-20">
        <LossTicker baseAmount={totalLoss} />
      </div>

      <main className="max-w-[1440px] mx-auto px-8 md:px-16 lg:px-20 py-10 relative">
        {/* Dynamic Background Blur */}
        <div className="fixed top-0 right-0 w-[50%] h-[50%] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="fixed bottom-0 left-0 w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Priority Intervention Banner */}
        {worstStore && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12 glass p-4 md:p-6 border-l-4 border-l-storeos-red animate-spring"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-storeos-red/10 flex items-center justify-center">
                  <span className="flex h-3 w-3 rounded-full bg-storeos-red animate-ping" />
                </div>
                <div>
                  <h3 className="h-premium text-lg tracking-tight text-storeos-red uppercase font-black">{t('intervention_required')}</h3>
                  <p className="text-sm font-bold text-storeos-muted mt-0.5">
                    {t('predictive_banner', { store: worstStore.name, amount: (worstStore.lossPerHour * 2).toFixed(0) })}
                  </p>
                </div>
              </div>
              <button onClick={() => navigate(`/store/${worstStore._id}`)} className="px-6 py-3 bg-storeos-red text-white h-premium text-xs uppercase tracking-widest rounded-2xl hover:bg-storeos-red/90 transition-all shadow-xl shadow-storeos-red/20">
                {t('deploy_ai_mitigation')}
              </button>
            </div>
          </motion.div>
        )}

        {/* Header Stats Zone */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 mb-20">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-storeos-amber/10 border border-storeos-amber/20 text-storeos-amber text-[10px] font-black uppercase tracking-[0.2em] mb-6"
            >
              <span className="w-1 h-1 rounded-full bg-storeos-amber animate-pulse" />
              {t('network_pulse_active')}
            </motion.div>
            <h1 className="h-premium text-4xl md:text-5xl lg:text-6xl tracking-tighter-premium mb-6 leading-[0.85]">
              {t('OPERATIONAL')}<br />
              <span className="italic bg-gradient-to-r from-storeos-amber via-orange-500 to-rose-500 bg-clip-text text-transparent">{t('INTELLIGENCE')}</span>
            </h1>
            <p className="text-sm md:text-base text-storeos-muted font-bold leading-relaxed max-w-2xl mt-4">
              {t('real_time_node_desc') === 'real_time_node_desc' ? 'Live telemetry and high-frequency sync node overview. Autonomous routing active.' : t('real_time_node_desc')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-strong p-8 min-w-[200px] flex flex-col justify-center items-center text-center">
              <span className="text-[10px] font-black uppercase text-storeos-muted tracking-widest mb-2">{t('active_nodes')}</span>
              <span className="h-premium text-5xl text-storeos-text">{stores.length}</span>
            </div>
            <div className="glass-strong p-8 min-w-[200px] flex flex-col justify-center items-center text-center border-b-4 border-b-storeos-red/30">
              <span className="text-[10px] font-black uppercase text-storeos-muted tracking-widest mb-2">{t('crit_alerts')}</span>
              <span className="h-premium text-5xl text-storeos-red">{stores.reduce((t, s) => t + s.activeAlerts, 0)}</span>
            </div>
          </div>
        </div>

        {/* Store Node Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-32">
          {stores.map((store, index) => (
            <StoreCard key={store._id} store={store} index={index} />
          ))}
        </div>

        {/* High-Fidelity Landing: WHAT WE DO */}
        <section className="py-32 mb-32 relative">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col items-center text-center mb-24 px-4">
              <span className="h-premium text-amber-500 text-sm uppercase tracking-[0.4em] font-black mb-8 border-b-2 border-amber-500/20 pb-2">{t('CAPABILITIES')}</span>
              <h2 className="h-premium text-4xl md:text-6xl tracking-tight leading-tight max-w-4xl italic text-storeos-text">
                "{t('what_we_do_desc')}"
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { icon: '🤖', title: t('ai_ops_title'), desc: t('ai_ops_desc'), color: 'from-amber-500/10 to-transparent', glow: 'shadow-amber-500/10' },
                { icon: '❄️', title: t('cold_storage_title'), desc: t('cold_storage_desc'), color: 'from-blue-500/10 to-transparent', glow: 'shadow-blue-500/10' },
                { icon: '📦', title: t('inventory_title'), desc: t('inventory_desc'), color: 'from-green-500/10 to-transparent', glow: 'shadow-green-500/10' }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className={`glass p-10 group hover:border-storeos-amber transition-all duration-500 cursor-default ${feature.glow} h-full flex flex-col`}
                >
                  <div className="w-16 h-16 rounded-3xl bg-storeos-surface mb-8 flex items-center justify-center text-4xl group-hover:rotate-12 transition-transform duration-500 shadow-inner">
                    {feature.icon}
                  </div>
                  <h4 className="h-premium text-2xl mb-4 text-storeos-text">{feature.title}</h4>
                  <p className="text-sm font-bold text-storeos-muted leading-relaxed flex-1">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Dashboard: HOW WE ARE DIFFERENT */}
        <section className="py-32 mb-32 glass-strong relative overflow-hidden rounded-[4rem]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 blur-[80px] -mr-48 -mt-48" />
          <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div>
                <span className="h-premium text-storeos-red text-sm uppercase tracking-[0.4em] font-black mb-6 block">{t('COMPARATIVE')}</span>
                <h2 className="h-premium text-4xl md:text-6xl tracking-tighter-premium mb-10 leading-[0.9]">
                  TRADITIONAL<br />
                  <span className="text-storeos-muted opacity-40 italic">{t('LOSS_PREVENTION')}</span><br />
                  <span className="text-storeos-amber">IS ANALOG.</span>
                </h2>
                <div className="space-y-6">
                  {[t('why_storeos_1'), t('why_storeos_2'), t('why_storeos_3')].map((point, i) => (
                    <motion.div 
                      key={i} 
                      whileInView={{ x: [0, 10, 0] }}
                      transition={{ delay: 1 + i * 0.2 }}
                      className="flex items-center gap-4 group"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-[10px] font-black group-hover:scale-125 transition-all">✓</div>
                      <span className="text-sm font-black text-storeos-text tracking-wide">{point}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="bg-storeos-bg/40 backdrop-blur-2xl rounded-[3rem] border border-storeos-border/50 p-12 shadow-3xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <div className="pb-4 border-b border-storeos-border/30">
                        <span className="text-[10px] font-black text-storeos-muted uppercase tracking-[0.3em]">{t('traditional')}</span>
                        <div className="h-1 w-8 bg-storeos-muted mt-2 opacity-30" />
                      </div>
                      <div className="space-y-6">
                        {[t('why_traditional_1'), t('why_traditional_2'), t('why_traditional_3')].map((p, i) => (
                          <div key={i} className="text-xs font-bold text-storeos-muted/40 line-through tracking-wide italic">{p}</div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-8 pt-0 lg:pt-0">
                      <div className="pb-4 border-b border-storeos-amber/30">
                        <span className="text-[10px] font-black text-storeos-amber uppercase tracking-[0.3em]">{t('storeos_edge')}</span>
                        <div className="h-1 w-12 bg-storeos-amber mt-2" />
                      </div>
                      <div className="space-y-6">
                        {[t('why_storeos_1'), t('why_storeos_2'), t('why_storeos_3')].map((p, i) => (
                          <div key={i} className="text-xs font-black text-storeos-text flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-storeos-amber shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                            {p}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Visual Artifact */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 blur-[60px] rounded-full animate-float" />
              </div>
            </div>
          </div>
        </section>

        {/* Striking Mission Section */}
        <section className="py-40 text-center relative">
          <div className="max-w-4xl mx-auto relative z-10 px-6">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1 }}
              className="w-24 h-1.5 bg-gradient-to-r from-transparent via-storeos-amber to-transparent mx-auto mb-16"
            />
            <h2 className="h-premium text-5xl md:text-8xl tracking-tighter-premium mb-12 italic">
              {t('our_mission')}
            </h2>
            <p className="text-xl md:text-3xl text-storeos-muted font-black leading-tight tracking-tight max-w-3xl mx-auto opacity-70">
              {t('mission_desc')}
            </p>
          </div>
          {/* Background Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-storeos-amber/5 via-transparent to-transparent pointer-events-none" />
        </section>
      </main>

      <Footer />
    </div>
  )
}
