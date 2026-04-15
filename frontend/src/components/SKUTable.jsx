import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

export default function SKUTable({ skus }) {
  const { t } = useTranslation()

  return (
    <div className="overflow-x-auto -mx-8 px-8 custom-scrollbar">
      <table className="w-full text-left min-w-[700px] border-separate border-spacing-y-2">
        <thead>
          <tr className="text-[10px] font-black text-storeos-muted uppercase tracking-[0.3em]">
            <th className="pb-6 pl-4">{t('sku_name')}</th>
            <th className="pb-6 px-4">{t('stock')}</th>
            <th className="pb-6 px-4">{t('expiry')} / {t('ttl')}</th>
            <th className="pb-6 px-4">{t('velocity')}</th>
            <th className="pb-6 px-4">{t('valuation')}</th>
            <th className="pb-6 px-4">{t('node_slot')}</th>
            <th className="pb-6 pr-4 text-right">{t('leakage_impulse')}</th>
          </tr>
        </thead>
        <tbody>
          {skus.map((sku, idx) => {
            const isExpiring = sku.expiryHoursLeft <= 6
            const isLoss = sku.lossContribution > 0
            const isLowStock = sku.stock <= 5

            return (
              <motion.tr
                key={idx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className={`group transition-all duration-300 hover:bg-white/5 cursor-default ${isLoss ? 'bg-storeos-red/5' : ''}`}
              >
                <td className="py-5 pl-4 rounded-l-2xl border-y border-l border-storeos-border/50 group-hover:border-storeos-amber/30">
                  <span className="text-sm font-black text-storeos-text group-hover:text-storeos-amber transition-colors">{sku.name}</span>
                </td>
                
                <td className="py-5 px-4 border-y border-storeos-border/50 group-hover:border-storeos-amber/30">
                  <div className="flex items-center gap-2">
                    <span className={`h-premium text-base ${isLowStock ? 'text-storeos-red' : 'text-storeos-text'}`}>{sku.stock}</span>
                    {isLowStock && <span className="text-[8px] font-black text-storeos-red uppercase tracking-widest bg-storeos-red/10 px-1.5 py-0.5 rounded">LOW</span>}
                  </div>
                </td>

                <td className="py-5 px-4 border-y border-storeos-border/50 group-hover:border-storeos-amber/30">
                  <div className={`flex flex-col`}>
                    <span className={`h-premium text-base ${isExpiring ? 'text-storeos-red' : sku.expiryHoursLeft <= 12 ? 'text-storeos-amber' : 'text-storeos-text'}`}>
                      {sku.expiryHoursLeft}h
                    </span>
                    <div className="h-1 w-12 bg-storeos-border/30 rounded-full mt-1.5 overflow-hidden">
                       <div className={`h-full ${isExpiring ? 'bg-storeos-red' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (sku.expiryHoursLeft / 72) * 100)}%` }} />
                    </div>
                  </div>
                </td>

                <td className="py-5 px-4 border-y border-storeos-border/50 group-hover:border-storeos-amber/30">
                  <div className="flex items-center gap-1">
                    <span className="h-premium text-base text-storeos-text">{sku.dailySales}</span>
                    <span className="text-[9px] font-black text-storeos-muted opacity-40 italic">U/D</span>
                  </div>
                </td>

                <td className="py-5 px-4 border-y border-storeos-border/50 group-hover:border-storeos-amber/30">
                  <span className="h-premium text-base text-storeos-text opacity-70">₹{sku.costPrice}</span>
                </td>

                <td className="py-5 px-4 border-y border-storeos-border/50 group-hover:border-storeos-amber/30">
                  <span className="px-3 py-1 bg-storeos-surface/50 border border-storeos-border rounded-xl text-[10px] font-black text-storeos-cold tracking-widest uppercase">{sku.shelfSlot}</span>
                </td>

                <td className="py-5 pr-4 text-right rounded-r-2xl border-y border-r border-storeos-border/50 group-hover:border-storeos-amber/30">
                  <span className={`h-premium text-lg ${isLoss ? 'text-storeos-red text-glow-red' : 'text-emerald-500/30'}`}>
                    {isLoss ? `₹${sku.lossContribution.toFixed(0)}` : '—'}
                  </span>
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
