import { motion } from 'framer-motion'

export default function VoiceToast({ visible, heardTitle, actionTitle }) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl border border-gray-100 p-5 min-w-[320px] shadow-2xl shadow-gray-300/30"
    >
      <div className="flex flex-col gap-2 text-sm">
        <div className="text-amber-600">
          <span className="opacity-60 mr-2">🎙️ Heard:</span>
          <span className="font-semibold">"{heardTitle}"</span>
        </div>
        <div className="text-gray-900">
          <span className="text-emerald-500 mr-2">⚡ Action:</span>
          <span className="font-semibold">{actionTitle}</span>
        </div>
      </div>
    </motion.div>
  )
}
