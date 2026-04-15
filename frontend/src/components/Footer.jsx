import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-storeos-surface border-t border-storeos-border py-12 px-8 mt-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center font-extrabold text-white text-sm shadow-sm">S</div>
            <div className="font-sans font-extrabold text-xl tracking-tight text-storeos-text text-storeos-text transition-colors">
              Store<span className="text-storeos-amber">OS</span>
            </div>
          </div>
          <p className="text-sm text-storeos-muted max-w-sm leading-relaxed">
            The intelligent operating system for dark store infrastructure. 
            Real-time loss detection, decision conflict resolution, and 
            operational intelligence at the edge.
          </p>
        </div>
        
        <div>
          <h4 className="font-bold text-sm text-storeos-text mb-4 uppercase tracking-wider">{t('platform')}</h4>
          <ul className="space-y-3 text-sm text-storeos-muted">
            <li className="hover:text-storeos-amber cursor-pointer transition-colors">{t('network_overview')}</li>
            <li className="hover:text-storeos-amber cursor-pointer transition-colors">{t('alerts_control')}</li>
            <li className="hover:text-storeos-amber cursor-pointer transition-colors">{t('predictive_analytics')}</li>
            <li className="hover:text-storeos-amber cursor-pointer transition-colors">{t('ml_insights')}</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-sm text-storeos-text mb-4 uppercase tracking-wider">{t('support')}</h4>
          <ul className="space-y-3 text-sm text-storeos-muted">
            <li className="hover:text-storeos-amber cursor-pointer transition-colors">{t('documentation')}</li>
            <li className="hover:text-storeos-amber cursor-pointer transition-colors">{t('help_center')}</li>
            <li className="hover:text-storeos-amber cursor-pointer transition-colors">{t('system_status')}</li>
            <li className="hover:text-storeos-amber cursor-pointer transition-colors">{t('api_docs')}</li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-storeos-border flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-xs text-storeos-muted">
          © {currentYear} StoreOS Intelligence Platform. All rights reserved.
        </div>
        <div className="flex items-center gap-8 text-xs text-storeos-muted">
          <span className="hover:text-storeos-text cursor-pointer transition-colors">{t('privacy_policy')}</span>
          <span className="hover:text-storeos-text cursor-pointer transition-colors">{t('terms_of_service')}</span>
          <span className="hover:text-storeos-text cursor-pointer transition-colors">{t('cookie_settings')}</span>
        </div>
      </div>
    </footer>
  )
}
