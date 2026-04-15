import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import api from '../api'
import TopBar from '../components/TopBar'
import LossTicker from '../components/LossTicker'
import StoreCard from '../components/StoreCard'
import Footer from '../components/Footer'

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
    <div className="min-h-screen bg-storeos-bg transition-colors duration-300">
      <TopBar demoMode={demoMode} />
      <LossTicker baseAmount={totalLoss} />

      {worstStore && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 md:mx-6 mt-4 p-4 bg-storeos-red/5 border border-storeos-red/10 rounded-xl"
        >
          <p className="text-xs font-semibold text-storeos-red flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-storeos-red animate-ping" />
            {t('predictive_banner', { store: worstStore.name, amount: (worstStore.lossPerHour * 2).toFixed(0) })}
          </p>
        </motion.div>
      )}

      {/* Main Grid */}
      <div className="p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-sans font-extrabold text-2xl lg:text-3xl text-storeos-text tracking-tight">
              {t('all_stores')}
            </h2>
            <p className="text-sm text-storeos-muted mt-1">Real-time node monitoring across the Bangalore cluster</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium px-4 py-2 bg-storeos-surface border border-storeos-border rounded-xl">
            <span className="text-storeos-text">{stores.length} Nodes Online</span>
            <div className="w-px h-3 bg-storeos-border" />
            <span className="text-storeos-red">{stores.reduce((t, s) => t + s.activeAlerts, 0)} Active Alerts</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store, index) => (
            <StoreCard key={store._id} store={store} index={index} />
          ))}
        </div>
      </div>

      {/* Landing Section: What we do? */}
      <section className="py-20 px-6 md:px-12 bg-storeos-surface border-y border-storeos-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-sans font-extrabold text-3xl md:text-4xl text-storeos-text mb-4 tracking-tight">
              Predict. Detect. Resolve.
            </h2>
            <p className="text-lg text-storeos-muted">
              StoreOS is the invisible brain behind dark stores, turning warehouse chaos into precision logistics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: "Silent Loss Detection", 
                desc: "Our ML models detect waste and shrinkage before they appear on the balance sheet.",
                icon: "🔍"
              },
              { 
                title: "Conflict Management", 
                desc: "Instantly resolve pricing vs. inventory vs. expiry conflicts with AI-driven recommendations.",
                icon: "⚖️"
              },
              { 
                title: "Cold Chain Guards", 
                desc: "Advanced IoT monitoring for sub-zero storage stability to protect perishables.",
                icon: "❄️"
              }
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 bg-storeos-bg border border-storeos-border rounded-2xl shadow-sm"
              >
                <div className="text-4xl mb-6">{f.icon}</div>
                <h3 className="font-bold text-xl text-storeos-text mb-3">{f.title}</h3>
                <p className="text-sm text-storeos-muted leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Landing Section: How are we different? */}
      <section className="py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2">
              <h2 className="font-sans font-extrabold text-3xl md:text-4xl text-storeos-text mb-6 tracking-tight">
                Designed for Performance, Built for Managers.
              </h2>
              <div className="space-y-6">
                {[
                  { q: "Simplified UX", a: "No complex dashboards. Every alert shows exactly how much money is at stake right now." },
                  { q: "Multilingual Voice Control", a: "Manage your floor hands-free in Kannada, Hindi, or English using our agentic layer." },
                  { q: "Immediate Action", a: "Don't just see the problem. StoreOS gives you 2-hour action windows to stop the bleed." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0 text-xs font-bold">✓</div>
                    <div>
                      <h4 className="font-bold text-storeos-text">{item.q}</h4>
                      <p className="text-sm text-storeos-muted mt-1">{item.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="relative aspect-video bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-3xl border border-storeos-border flex items-center justify-center p-8 overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-30" />
                <div className="relative z-10 text-center">
                  <div className="font-bold text-storeos-amber text-[10px] tracking-[0.2em] uppercase mb-2">Live Agent Interface</div>
                  <div className="text-storeos-text font-mono text-sm bg-storeos-bg/80 backdrop-blur rounded-xl p-4 border border-storeos-border shadow-2xl">
                    "Hey StoreOS, what is the bleeding most in Koramangala?"
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
