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
    <div className="w-full glass fixed top-0 left-0 right-0 z-[100] px-6 md:px-12 py-4 flex items-center justify-between transition-all duration-300">
      <div className="flex items-center gap-12">
        <div
          className="cursor-pointer group flex items-center gap-3"
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-2xl shadow-amber-500/40 group-hover:rotate-12 transition-transform duration-500 h-premium">S</div>
          <div className="h-premium text-2xl tracking-tighter-premium text-storeos-text group-hover:text-storeos-amber transition-all duration-300">
            Store<span className="text-storeos-amber">OS</span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-4">
          {[
            { path: '/', label: t('network_overview') },
            { path: '/alerts', label: t('alerts_control') },
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] font-black rounded-2xl transition-all duration-300 ${
                location.pathname === item.path 
                ? 'text-storeos-text bg-storeos-amber/10 border border-storeos-amber/20' 
                : 'text-storeos-muted hover:text-storeos-text hover:bg-storeos-surface/50'
              }`}
            >
              {item.label}
              {location.pathname === item.path && (
                <motion.div layoutId="nav-active" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-storeos-amber rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        {/* Status Cluster */}
        <div className="hidden md:flex items-center gap-6 border-r border-storeos-border pr-8">
          <div className="flex items-center gap-2.5">
            <div className={`relative flex h-2 w-2`}>
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 bg-emerald-500`} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-storeos-muted opacity-70">
              Real-time Active
            </span>
          </div>
          
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${mlOnline === false ? 'bg-red-400' : 'bg-emerald-400'}`} />
            <span className="text-[9px] font-black uppercase tracking-widest text-storeos-muted opacity-70">ML Nodes Online</span>
          </div>
        </div>

        {/* Action Cluster */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-3 rounded-2xl bg-storeos-surface/50 border border-storeos-border text-storeos-text hover:border-storeos-amber hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300"
            title="Switch Environment"
          >
            {theme === 'light' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
              <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h1M4 12H3m15.364-6.364l.707-.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
            )}
          </button>

          <div className="hidden sm:flex items-center bg-storeos-surface/40 p-1 rounded-2xl border border-storeos-border">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
                className={`px-4 py-2 text-[10px] font-black tracking-widest rounded-xl transition-all duration-300 ${
                  i18n.language === lang.code 
                  ? 'bg-storeos-bg text-storeos-text shadow-xl border border-storeos-border' 
                  : 'text-storeos-muted hover:text-storeos-text'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleLogout}
            className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-storeos-red/80 hover:text-white hover:bg-storeos-red rounded-2xl transition-all duration-300"
          >
            {t('logout')}
          </button>
        </div>
      </div>
    </div>
  )
}
