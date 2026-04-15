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
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-inter selection:bg-amber-500/30">
      {/* Immersive Background System */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-amber-500/10 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-500/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-flex items-center gap-4 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8"
          >
            <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
            System Stable — Ready
          </motion.div>
          
          <h1 className="h-premium text-7xl md:text-8xl lg:text-9xl tracking-tighter-premium text-white mb-4 leading-none italic">
            Store<span className="text-amber-500">OS</span>
          </h1>
          <p className="text-sm md:text-base text-slate-400 font-bold tracking-[0.4em] uppercase opacity-60">
            Decision Intelligence Engine
          </p>
        </div>

        <div className="glass-strong p-1 p-px rounded-[3rem] overflow-hidden">
          <div className="bg-[#0f172a]/90 backdrop-blur-3xl rounded-[3rem] p-10 md:px-16 md:py-14">
            <div className="flex mb-12 bg-white/5 rounded-2xl p-1.5 border border-white/5">
              <button
                onClick={() => setIsSignup(false)}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${!isSignup ? 'bg-amber-500 text-white shadow-2xl shadow-amber-500/20' : 'text-slate-500 hover:text-white'}`}
              >
                {t('ACCESS')}
              </button>
              <button
                onClick={() => setIsSignup(true)}
                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${isSignup ? 'bg-amber-500 text-white shadow-2xl shadow-amber-500/20' : 'text-slate-500 hover:text-white'}`}
              >
                {t('PROVISION')}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {isSignup && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block">{t('COMMANDER_NAME')}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isSignup}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-white placeholder-slate-700 focus:border-amber-500/50 focus:bg-white/10 focus:outline-none transition-all duration-300"
                    placeholder="Enter Operational ID"
                  />
                </motion.div>
              )}
              
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block">{t('SECURE_IDENTITY')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-white placeholder-slate-700 focus:border-amber-500/50 focus:bg-white/10 focus:outline-none transition-all duration-300"
                  placeholder="manager@storeos.ai"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('AUTH_TOKEN')}</label>
                  {!isSignup && <button type="button" className="text-[9px] font-black text-amber-500/50 uppercase tracking-widest hover:text-amber-500 transition-colors">FORGOT KEY?</button>}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-white placeholder-slate-700 focus:border-amber-500/50 focus:bg-white/10 focus:outline-none transition-all duration-300"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[11px] font-black text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5"
                >
                  <span className="mr-2">⚠ ERROR:</span> {error.toUpperCase()}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-white text-[#020617] h-premium text-lg uppercase tracking-widest rounded-3xl hover:bg-amber-500 hover:text-white transition-all duration-500 disabled:opacity-50 shadow-2xl active:scale-[0.98] group"
              >
                {loading ? '...' : isSignup ? t('PROVISION_ID') : t('INITIATE_SESSION')}
              </button>
            </form>

            <div className="mt-10 pt-10 border-t border-white/5">
              <button
                onClick={handleDemo}
                disabled={loading}
                className="w-full py-6 border-2 border-dashed border-white/10 text-slate-500 h-premium text-sm uppercase tracking-[0.3em] rounded-3xl hover:border-amber-500/50 hover:text-amber-500 hover:bg-amber-500/5 transition-all duration-500 disabled:opacity-50 flex items-center justify-center gap-4 group"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all">
                  🚀
                </div>
                Launch Demo Environment
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-12 space-y-4">
          <div className="flex justify-center gap-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] opacity-40">
            <span>SECURE LINK</span>
            <span>•</span>
            <span>ENCRYPTED NODE</span>
            <span>•</span>
            <span>ALGORAND VERIFIED</span>
          </div>
          <p className="text-[9px] font-bold text-slate-600 opacity-30">
            © 2026 STOREOS INTELLIGENCE 
          </p>
        </div>
      </motion.div>
    </div>
  )
}
