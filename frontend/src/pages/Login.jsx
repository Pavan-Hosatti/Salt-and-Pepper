import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import api from '../api'

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isSignup, setIsSignup] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login'
      const payload = isSignup ? { name, email, password } : { email, password }
      const res = await api.post(endpoint, payload)
      localStorage.setItem('storeos_token', res.data.token)
      localStorage.setItem('storeos_user', JSON.stringify(res.data.user))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Connection failed. Check if backend is running.')
    }
    setLoading(false)
  }

  const handleDemo = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await api.get('/api/auth/demo')
      localStorage.setItem('storeos_token', res.data.token)
      localStorage.setItem('storeos_user', JSON.stringify(res.data.user))
      navigate('/')
    } catch (err) {
      setError('Could not load demo. Check if backend is running.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-storeos-surface flex items-center justify-center p-4 transition-colors duration-500 overflow-hidden relative">
      {/* Background blobs for premium feel */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-storeos-amber/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-storeos-red/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-3 mb-6"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-amber-500/20">S</div>
          </motion.div>
          <h1 className="font-sans font-extrabold text-5xl tracking-tighter text-storeos-text mb-3">
            Store<span className="text-storeos-amber">OS</span>
          </h1>
          <p className="text-sm text-storeos-muted font-medium tracking-wide uppercase">
            OPERATIONAL DECISION INTELLIGENCE
          </p>
        </div>

        <div className="bg-storeos-bg rounded-[2rem] shadow-2xl shadow-black/5 border border-storeos-border p-8 md:p-10 backdrop-blur-sm">
          <div className="flex mb-8 bg-storeos-surface rounded-2xl p-1.5 border border-storeos-border">
            <button
              onClick={() => setIsSignup(false)}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${!isSignup ? 'bg-storeos-bg text-storeos-text shadow-md' : 'text-storeos-muted hover:text-storeos-text'}`}
            >
              {t('login')}
            </button>
            <button
              onClick={() => setIsSignup(true)}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${isSignup ? 'bg-storeos-bg text-storeos-text shadow-md' : 'text-storeos-muted hover:text-storeos-text'}`}
            >
              {t('signup')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <label className="text-[10px] font-bold text-storeos-muted uppercase tracking-widest pl-1 mb-2 block">{t('name')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isSignup}
                  className="w-full bg-storeos-surface border border-storeos-border rounded-xl px-4 py-4 text-sm text-storeos-text placeholder-storeos-muted/50 focus:border-storeos-amber focus:ring-4 focus:ring-storeos-amber/10 focus:outline-none transition-all"
                  placeholder="Operational Manager Name"
                />
              </motion.div>
            )}
            <div>
              <label className="text-[10px] font-bold text-storeos-muted uppercase tracking-widest pl-1 mb-2 block">{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-storeos-surface border border-storeos-border rounded-xl px-4 py-4 text-sm text-storeos-text placeholder-storeos-muted/50 focus:border-storeos-amber focus:ring-4 focus:ring-storeos-amber/10 focus:outline-none transition-all"
                placeholder="manager@storeos.ai"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-storeos-muted uppercase tracking-widest pl-1 mb-2 block">{t('password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-storeos-surface border border-storeos-border rounded-xl px-4 py-4 text-sm text-storeos-text placeholder-storeos-muted/50 focus:border-storeos-amber focus:ring-4 focus:ring-storeos-amber/10 focus:outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs font-bold text-storeos-red bg-storeos-red/5 border border-storeos-red/10 rounded-xl p-4"
              >
                ⚠ {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 shadow-xl shadow-amber-500/25 active:scale-[0.98]"
            >
              {loading ? '...' : isSignup ? t('signup').toUpperCase() : t('login').toUpperCase()}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-storeos-border">
            <button
              onClick={handleDemo}
              disabled={loading}
              className="w-full py-4 border-2 border-dashed border-storeos-border text-storeos-muted font-bold text-xs rounded-xl hover:border-storeos-amber hover:text-storeos-amber hover:bg-storeos-amber/5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              🚀 {t('demo_account').toUpperCase()}
            </button>
          </div>
        </div>

        <div className="text-center mt-8 space-y-2">
          <p className="text-[10px] font-bold text-storeos-muted tracking-widest uppercase opacity-60">
            Powered by StoreOS Operational Intelligence
          </p>
          <div className="flex justify-center gap-4 text-[10px] font-medium text-storeos-muted/40">
            <span>V 2.1.0</span>
            <span>•</span>
            <span>SECURE ENCRYPTED CHANNEL</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
