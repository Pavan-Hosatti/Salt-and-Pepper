import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'

export default function TopBar({ demoMode, mlOnline }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

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
    <div className="w-full bg-storeos-bg/80 backdrop-blur-xl border-b border-storeos-border px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4 md:gap-10">
        <div
          className="cursor-pointer group flex items-center gap-2.5"
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center font-extrabold text-white text-sm md:text-base shadow-md shadow-amber-500/20">S</div>
          <div className="font-sans font-extrabold text-lg md:text-xl tracking-tight text-storeos-text group-hover:text-storeos-amber transition-colors">
            Store<span className="text-storeos-amber">OS</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {[
            { path: '/', label: t('network_overview') },
            { path: '/alerts', label: t('alerts_control') },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                location.pathname === item.path 
                ? 'text-storeos-amber bg-storeos-amber/10' 
                : 'text-storeos-muted hover:text-storeos-text hover:bg-storeos-surface'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Status Indicators - Hidden on small mobile */}
        <div className="hidden sm:flex items-center gap-3 border-r border-storeos-border pr-4">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${demoMode ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span className="text-[10px] font-medium text-storeos-muted">{demoMode ? 'Demo' : 'Live'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${mlOnline === false ? 'bg-red-400' : 'bg-emerald-400'}`} />
            <span className="text-[10px] font-medium text-storeos-muted">ML</span>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-storeos-surface border border-storeos-border text-storeos-text hover:border-storeos-amber transition-all"
          title="Toggle Theme"
        >
          {theme === 'light' ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          ) : (
            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h1M4 12H3m15.364-6.364l.707-.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
          )}
        </button>

        <div className="flex items-center bg-storeos-surface rounded-lg p-0.5">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => i18n.changeLanguage(lang.code)}
              className={`px-2 md:px-3 py-1.5 text-[10px] md:text-xs font-semibold rounded-md transition-all ${
                i18n.language === lang.code 
                ? 'bg-storeos-bg text-storeos-text shadow-sm' 
                : 'text-storeos-muted hover:text-storeos-text'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="px-3 md:px-4 py-2 text-[10px] md:text-xs font-semibold text-storeos-red hover:bg-storeos-red/10 rounded-lg transition-all"
        >
          {t('logout')}
        </button>
      </div>
    </div>
  )
}
