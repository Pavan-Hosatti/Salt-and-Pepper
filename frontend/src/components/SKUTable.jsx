import { useTranslation } from 'react-i18next'

export default function SKUTable({ skus }) {
  const { t } = useTranslation()

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full text-xs min-w-[600px]">
        <thead>
          <tr className="border-b border-storeos-border text-left">
            <th className="py-3 px-3 text-storeos-muted font-semibold">{t('sku_name')}</th>
            <th className="py-3 px-3 text-storeos-muted font-semibold">{t('stock')}</th>
            <th className="py-3 px-3 text-storeos-muted font-semibold">{t('expiry_hours')}</th>
            <th className="py-3 px-3 text-storeos-muted font-semibold">{t('daily_sales')}</th>
            <th className="py-3 px-3 text-storeos-muted font-semibold">{t('cost_price')}</th>
            <th className="py-3 px-3 text-storeos-muted font-semibold">{t('shelf_slot')}</th>
            <th className="py-3 px-3 text-storeos-muted font-semibold">{t('loss_contribution')}</th>
          </tr>
        </thead>
        <tbody>
          {skus.map((sku, idx) => {
            const isExpiring = sku.expiryHoursLeft <= 6
            const isLoss = sku.lossContribution > 0
            return (
              <tr
                key={idx}
                className={`border-b border-storeos-border/50 transition-colors hover:bg-storeos-surface ${isLoss ? 'bg-storeos-red/5' : ''}`}
              >
                <td className="py-3 px-3 text-storeos-text font-semibold">{sku.name}</td>
                <td className={`py-3 px-3 font-mono ${sku.stock <= 5 ? 'text-storeos-red font-bold' : 'text-storeos-text'}`}>{sku.stock}</td>
                <td className={`py-3 px-3 font-mono ${isExpiring ? 'text-storeos-red font-bold' : sku.expiryHoursLeft <= 12 ? 'text-storeos-amber' : 'text-storeos-text'}`}>
                  {sku.expiryHoursLeft}h
                </td>
                <td className="py-3 px-3 text-storeos-text font-mono">{sku.dailySales}</td>
                <td className="py-3 px-3 text-storeos-text font-mono">₹{sku.costPrice}</td>
                <td className="py-3 px-3 text-storeos-cold font-mono font-semibold">{sku.shelfSlot}</td>
                <td className={`py-3 px-3 font-mono font-bold ${isLoss ? 'text-storeos-red' : 'text-storeos-green'}`}>
                  {isLoss ? `₹${sku.lossContribution.toFixed(2)}` : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
