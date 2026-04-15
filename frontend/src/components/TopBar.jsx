import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function TopBar({ demoMode, mlOnline }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    localStorage.removeItem('storeos_token')
    localStorage.removeItem('storeos_user')
    navigate('/login')
  }

  const languages = [
    { code: 'en', label: 'ENG' },
    { code: 'hi', label: 'HIN' },
    { code: 'kn', label: 'KAN' },
  ]

  return (
    <div className="w-full bg-white/80 backdrop-blur-xl border-b border-gray-200 px-8 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-10">
        <div
          className="cursor-pointer group flex items-center gap-2.5"
          onClick={() => navigate('/')}
        >
          <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center font-extrabold text-white text-base shadow-md shadow-amber-500/20">S</div>
          <div className="font-sans font-extrabold text-xl tracking-tight text-gray-900 group-hover:text-amber-600 transition-colors">
            Store<span className="text-amber-500">OS</span>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          {[
            { path: '/', label: t('network_overview') },
            { path: '/alerts', label: t('alerts_control') },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                location.pathname === item.path 
                ? 'text-amber-600 bg-amber-50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 border-r border-gray-200 pr-4">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${demoMode ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span className="text-xs font-medium text-gray-500">{demoMode ? 'Demo' : 'Live'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${mlOnline === false ? 'bg-red-400' : 'bg-emerald-400'}`} />
            <span className="text-xs font-medium text-gray-500">ML</span>
          </div>
        </div>

        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => i18n.changeLanguage(lang.code)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                i18n.language === lang.code 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          {t('logout')}
        </button>
      </div>
    </div>
  )
}
