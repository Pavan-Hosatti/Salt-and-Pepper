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
      className={`bg-storeos-bg rounded-xl border ${borderColor} p-5 ${resolved ? 'opacity-50' : ''} shadow-sm transition-colors duration-300`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border ${badgeBg}`}>
            {typeLabel}
          </span>
          <span className="text-xs text-storeos-muted">
            {alert.storeName} · {alert.shelfSlot}
          </span>
        </div>
        <CountdownTimer hours={alert.timeRemaining || 1} />
      </div>

      <p className="text-sm text-storeos-text mb-3 leading-relaxed">
        {alert.message}
      </p>

      {isConflict && (
        <div className="bg-storeos-amber/5 rounded-xl border border-storeos-amber/10 p-4 mb-3">
          <div className="text-[10px] font-semibold text-storeos-amber mb-2 uppercase tracking-wide">{t('recommendation')}</div>
          <p className="text-xs text-storeos-text mb-3">{alert.recommendation}</p>
          <div className="flex flex-wrap gap-4 text-xs">
            <span className="text-storeos-green font-semibold">✓ {t('saved_if_followed')}: ₹{alert.savedIfFollowed}</span>
            <span className="text-storeos-red font-semibold">✗ {t('lost_if_ignored')}: ₹{alert.lostIfIgnored}</span>
          </div>
        </div>
      )}

      {alert.lossPerHour > 0 && (
        <div className="text-xs font-semibold text-storeos-red mb-3">
          {t('loss_per_hour')}: ₹{alert.lossPerHour?.toFixed(2)}
        </div>
      )}

      <div className="flex items-center gap-3">
        {onResolve && !resolved && (
          <button
            onClick={() => onResolve(alert)}
            className="text-xs font-semibold px-5 py-2.5 bg-storeos-green/10 text-storeos-green border border-storeos-green/20 rounded-lg hover:bg-storeos-green/20 transition-all focus:ring-2 focus:ring-storeos-green/20 outline-none"
          >
            {t('resolve')}
          </button>
        )}
        {resolved && (
          <span className="text-xs font-semibold px-5 py-2.5 bg-storeos-green/10 text-storeos-green opacity-60 rounded-lg border border-storeos-green/20">
            {t('resolved')} ✓
          </span>
        )}
      </div>
    </motion.div>
  )
}
