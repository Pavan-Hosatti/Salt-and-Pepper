import { useTranslation } from 'react-i18next'

export default function SKUTable({ skus }) {
  const { t } = useTranslation()

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100 text-left">
            <th className="py-3 px-3 text-gray-400 font-semibold">{t('sku_name')}</th>
            <th className="py-3 px-3 text-gray-400 font-semibold">{t('stock')}</th>
            <th className="py-3 px-3 text-gray-400 font-semibold">{t('expiry_hours')}</th>
            <th className="py-3 px-3 text-gray-400 font-semibold">{t('daily_sales')}</th>
            <th className="py-3 px-3 text-gray-400 font-semibold">{t('cost_price')}</th>
            <th className="py-3 px-3 text-gray-400 font-semibold">{t('shelf_slot')}</th>
            <th className="py-3 px-3 text-gray-400 font-semibold">{t('loss_contribution')}</th>
          </tr>
        </thead>
        <tbody>
          {skus.map((sku, idx) => {
            const isExpiring = sku.expiryHoursLeft <= 6
            const isLoss = sku.lossContribution > 0
            return (
              <tr
                key={idx}
                className={`border-b border-gray-50 transition-colors hover:bg-gray-50 ${isLoss ? 'bg-red-50/50' : ''}`}
              >
                <td className="py-3 px-3 text-gray-900 font-semibold">{sku.name}</td>
                <td className={`py-3 px-3 font-mono ${sku.stock <= 5 ? 'text-red-500 font-bold' : 'text-gray-700'}`}>{sku.stock}</td>
                <td className={`py-3 px-3 font-mono ${isExpiring ? 'text-red-500 font-bold' : sku.expiryHoursLeft <= 12 ? 'text-amber-500' : 'text-gray-700'}`}>
                  {sku.expiryHoursLeft}h
                </td>
                <td className="py-3 px-3 text-gray-700 font-mono">{sku.dailySales}</td>
                <td className="py-3 px-3 text-gray-700 font-mono">₹{sku.costPrice}</td>
                <td className="py-3 px-3 text-blue-500 font-mono font-semibold">{sku.shelfSlot}</td>
                <td className={`py-3 px-3 font-mono font-bold ${isLoss ? 'text-red-500' : 'text-emerald-500'}`}>
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
