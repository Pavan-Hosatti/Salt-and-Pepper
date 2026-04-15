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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-amber-500/20">S</div>
          </div>
          <h1 className="font-sans font-extrabold text-4xl tracking-tight text-gray-900 mb-2">
            Store<span className="text-amber-500">OS</span>
          </h1>
          <p className="text-sm text-gray-500">
            Dark Store Decision Intelligence
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setIsSignup(false)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${!isSignup ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t('login')}
            </button>
            <button
              onClick={() => setIsSignup(true)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${isSignup ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t('signup')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">{t('name')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isSignup}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition-all"
                  placeholder="Manager Name"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition-all"
                placeholder="demo@storeos.ai"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1.5">{t('password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 focus:outline-none transition-all"
                placeholder="demo123"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold text-sm rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 shadow-lg shadow-amber-500/20"
            >
              {loading ? '...' : isSignup ? t('signup') : t('login')}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={handleDemo}
              disabled={loading}
              className="w-full py-3.5 border-2 border-dashed border-gray-200 text-gray-500 font-medium text-sm rounded-xl hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 transition-all disabled:opacity-50"
            >
              🚀 {t('demo_account')}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          10-Minute Delivery Infrastructure Intelligence
        </p>
      </motion.div>
    </div>
  )
}
