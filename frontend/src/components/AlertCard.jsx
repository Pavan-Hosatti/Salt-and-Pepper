import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import CountdownTimer from './CountdownTimer'

export default function AlertCard({ alert, onResolve, resolved }) {
  const { t } = useTranslation()

  const isConflict = alert.type === 'conflict'
  const isCritical = alert.severity === 'critical'
  const typeLabel = alert.type === 'silent_loss' ? t('silent_loss') : alert.type === 'conflict' ? t('conflict_detected') : 'EXPIRY'

  const borderColor = isCritical ? 'border-red-200' : 'border-amber-200'
  const badgeBg = isCritical ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-600 border-amber-200'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-white rounded-xl border ${borderColor} p-5 ${resolved ? 'opacity-50' : ''} shadow-sm`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border ${badgeBg}`}>
            {typeLabel}
          </span>
          <span className="text-xs text-gray-400">
            {alert.storeName} · {alert.shelfSlot}
          </span>
        </div>
        <CountdownTimer hours={alert.timeRemaining || 1} />
      </div>

      <p className="text-sm text-gray-700 mb-3 leading-relaxed">
        {alert.message}
      </p>

      {isConflict && (
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-4 mb-3">
          <div className="text-[10px] font-semibold text-amber-600 mb-2">{t('recommendation')}</div>
          <p className="text-xs text-gray-700 mb-3">{alert.recommendation}</p>
          <div className="flex gap-4 text-xs">
            <span className="text-emerald-600 font-semibold">✓ {t('saved_if_followed')}: ₹{alert.savedIfFollowed}</span>
            <span className="text-red-500 font-semibold">✗ {t('lost_if_ignored')}: ₹{alert.lostIfIgnored}</span>
          </div>
        </div>
      )}

      {alert.lossPerHour > 0 && (
        <div className="text-xs font-semibold text-red-500 mb-3">
          {t('loss_per_hour')}: ₹{alert.lossPerHour?.toFixed(2)}
        </div>
      )}

      {onResolve && !resolved && (
        <button
          onClick={() => onResolve(alert)}
          className="text-xs font-semibold px-5 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-all"
        >
          {t('resolve')}
        </button>
      )}
      {resolved && (
        <span className="text-xs font-semibold px-5 py-2.5 bg-emerald-50 text-emerald-400 rounded-lg border border-emerald-100">
          {t('resolved')} ✓
        </span>
      )}
    </motion.div>
  )
}
