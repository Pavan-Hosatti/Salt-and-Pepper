import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-storeos-bg border-t border-white/5 py-24 px-8 md:px-16 mt-20 relative overflow-hidden">
      {/* Footer Ambient Aura */}
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 relative z-10">
        <div className="col-span-1 md:col-span-12 lg:col-span-5">
           <div className="flex items-center gap-4 mb-8">
            <div className="h-premium text-4xl tracking-tighter text-white italic">
               Store<span className="text-amber-500">OS</span>
            </div>
            <div className="px-3 py-1 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2">
              GLOBAL NODE 2.1
            </div>
          </div>
          <p className="text-lg font-bold text-slate-400 max-w-lg leading-relaxed mb-10">
            The intelligent operating system for critical dark-store infrastructure. 
            Real-time loss detection, decision conflict resolution, and 
            operational intelligence at the edge.
          </p>
        </div>
        
        <div className="col-span-1 md:col-span-4 lg:col-span-2">
          <h4 className="text-[11px] font-black text-white mb-8 uppercase tracking-[0.3em]">{t('PLATFORM')}</h4>
          <ul className="space-y-4 text-sm font-bold text-slate-500">
            <li className="hover:text-amber-500 cursor-pointer transition-colors uppercase tracking-widest">{t('NETWORK_STATUS')}</li>
            <li className="hover:text-amber-500 cursor-pointer transition-colors uppercase tracking-widest">{t('LOSS_MODELS')}</li>
            <li className="hover:text-amber-500 cursor-pointer transition-colors uppercase tracking-widest">{t('TELEMETRY')}</li>
            <li className="hover:text-amber-500 cursor-pointer transition-colors uppercase tracking-widest">{t('INTELLIGENCE')}</li>
          </ul>
        </div>

        <div className="col-span-1 md:col-span-4 lg:col-span-2">
          <h4 className="text-[11px] font-black text-white mb-8 uppercase tracking-[0.3em]">{t('COGNITIVE')}</h4>
          <ul className="space-y-4 text-sm font-bold text-slate-500">
            <li className="hover:text-amber-500 cursor-pointer transition-colors uppercase tracking-widest">{t('VOICE_AGENT')}</li>
            <li className="hover:text-amber-500 cursor-pointer transition-colors uppercase tracking-widest">{t('HANDOVER_REPORTS')}</li>
            <li className="hover:text-amber-500 cursor-pointer transition-colors uppercase tracking-widest">{t('CONFLICT_RESOLVER')}</li>
            <li className="hover:text-amber-500 cursor-pointer transition-colors uppercase tracking-widest">{t('EDGE_PROTOCOLS')}</li>
          </ul>
        </div>

        <div className="col-span-1 md:col-span-4 lg:col-span-3">
           <div className="glass p-8 rounded-[2rem] border-white/10 group hover:border-amber-500/30 transition-all">
              <h4 className="text-[10px] font-black text-white mb-4 uppercase tracking-[0.2em]">{t('SYSTEM_HEALTH')}</h4>
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                 <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-widest">ALL REGIONS OPERATIONAL</span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-loose tabular-nums">
                 Uptime: 99.98% // Latency: 12ms <br/>
                 Security: Verified Encrypted
              </p>
           </div>
        </div>
      </div>
      
      <div className="max-w-[1600px] mx-auto pt-16 mt-24 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-10 relative z-10">
        <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">
          © {currentYear} STOREOS INTELLIGENCE PLATFORM. SECURED ENVIRONMENT.
        </div>
        <div className="flex flex-wrap justify-center gap-10 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
          <span className="hover:text-white cursor-pointer transition-colors">{t('PRIVACY')}</span>
          <span className="hover:text-white cursor-pointer transition-colors">{t('TERMS')}</span>
          <span className="hover:text-white cursor-pointer transition-colors">{t('GOVERNANCE')}</span>
          <span className="flex items-center gap-2 text-amber-500/50">
             <span className="w-1 h-1 rounded-full bg-amber-500/50" />
             VER v2.1.08
          </span>
        </div>
      </div>
    </footer>
  )
}
