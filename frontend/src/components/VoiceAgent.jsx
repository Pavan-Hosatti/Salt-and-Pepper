import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import VoiceToast from './VoiceToast'
import api from '../api'

export default function VoiceAgent() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [isListening, setIsListening] = useState(false)
  const [toastData, setToastData] = useState({ visible: false, heardTitle: '', actionTitle: '' })
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [supported, setSupported] = useState(true)

  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
      return
    }
    
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = false
    recognitionRef.current.lang = 'en-IN'

    recognitionRef.current.onstart = () => setIsListening(true)
    recognitionRef.current.onend = () => setIsListening(false)
    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event.error)
      setIsListening(false)
    }

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase()
      handleCommand(transcript)
    }
  }, [])

  const speak = (text, lang) => {
    if (!window.speechSynthesis) return
    setIsSpeaking(true)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.onend = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  const showToast = (heard, action) => {
    setToastData({ visible: true, heardTitle: heard, actionTitle: action })
    setTimeout(() => {
      setToastData(prev => ({ ...prev, visible: false }))
    }, 3000)
  }

  const handleCommand = async (transcript) => {
    const kannadaKeywords = [
      "tegey", "thumbi", "bidisu", "maadu",
      "chalu", "kelasa", "aagtha", "store",
      "maatadu", "idhe", "yaava"
    ]

    const isKannada = kannadaKeywords.some(word => transcript.includes(word))
    let actionTitle = t('voice.actionTriggered') || 'Action triggered'
    let spokenResponse = ''
    let lang = isKannada ? 'kn-IN' : 'en-IN'

    if (transcript.includes('critical alerts') || transcript.includes('mukhya alerts')) {
      actionTitle = 'Showing critical alerts'
      spokenResponse = isKannada ? 'Mukhya alerts thumbtha idhe' : 'Showing critical alerts'
      navigate('/alerts')
    } else if (transcript.includes('koramangala')) {
      actionTitle = 'Opening Koramangala store'
      spokenResponse = isKannada ? 'Koramangala store teretha idhe' : 'Opening Koramangala store'
      navigate('/store/store_01')
    } else if (transcript.includes('whitefield')) {
      actionTitle = 'Opening Whitefield store'
      spokenResponse = isKannada ? 'Whitefield store teretha idhe' : 'Opening Whitefield store'
      navigate('/store/store_04')
    } else if (transcript.includes('hsr')) {
      actionTitle = 'Opening HSR store'
      spokenResponse = isKannada ? 'HSR store teretha idhe' : 'Opening HSR store'
      navigate('/store/store_03')
    } else if (transcript.includes('indiranagar')) {
      actionTitle = 'Opening Indiranagar store'
      spokenResponse = isKannada ? 'Indiranagar store teretha idhe' : 'Opening Indiranagar store'
      navigate('/store/store_02')
    } else if (transcript.includes('jp nagar') || transcript.includes('jp')) {
      actionTitle = 'Opening JP Nagar store'
      spokenResponse = isKannada ? 'JP Nagar store teretha idhe' : 'Opening JP Nagar store'
      navigate('/store/store_05')
    } else if (transcript.includes('network loss') || transcript.includes('losses')) {
      actionTitle = 'Showing network losses'
      spokenResponse = isKannada ? 'Network loss thumbtha idhe' : 'Showing network losses'
      navigate('/')
    } else if (transcript.includes('resolve') || transcript.includes('bidisu')) {
      actionTitle = 'Resolving conflict'
      spokenResponse = isKannada ? 'Samasye bidithu' : 'Conflict resolved'
      try {
        await api.post('/api/actions/resolve', {
          storeId: 'store_01',
          sku: 'Amul Milk 500ml',
          action: 'Flash discount (voice triggered)',
          savings: 100,
        })
      } catch (e) {
        console.error('Failed voice resolve trigger')
      }
    } else if (transcript.includes('kannada alli maatadu') || transcript.includes('switch to kannada')) {
      actionTitle = 'Switching to Kannada'
      spokenResponse = 'Bhasha Kannadakke badalaayitu'
      lang = 'kn-IN'
      i18n.changeLanguage('kn')
    } else if (transcript.includes('english alli maatadu') || transcript.includes('switch to english')) {
      actionTitle = 'Switching to English'
      spokenResponse = 'Language switched to English'
      lang = 'en-IN'
      i18n.changeLanguage('en')
    } else if (transcript.includes('hindi') || transcript.includes('switch to hindi')) {
      actionTitle = 'Switching to Hindi'
      spokenResponse = 'भाषा हिंदी में बदल गई'
      lang = 'hi-IN'
      i18n.changeLanguage('hi')
    } else if (transcript.includes('agent') || transcript.includes('agent chalu')) {
      actionTitle = 'Agent triggered'
      spokenResponse = isKannada ? 'Agent chalu aagide' : 'Agent triggered successfully'
    } else if (transcript.includes('bleeding most') || transcript.includes('yaava store loss')) {
      actionTitle = 'Highlighting worst store'
      spokenResponse = isKannada ? 'Athi hechu loss aaguva store thumbtha idhe' : 'Showing highest loss store'
      navigate('/')
    } else {
      actionTitle = 'Command not recognized'
      spokenResponse = isKannada ? 'Gottaagalilla, matte heliri' : "Sorry, I didn't understand"
    }

    showToast(transcript, actionTitle)
    speak(spokenResponse, lang)
  }

  const toggleListen = () => {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
    } else {
      if (i18n.language === 'kn') {
        recognitionRef.current.lang = 'kn-IN'
      } else if (i18n.language === 'hi') {
        recognitionRef.current.lang = 'hi-IN'
      } else {
        recognitionRef.current.lang = 'en-IN'
      }
      try {
        recognitionRef.current.start()
      } catch (e) {
        console.error('Audio capture error', e)
      }
    }
  }

  if (!supported) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-100 text-gray-500 text-xs font-medium px-3 py-2 rounded-xl z-50 shadow-sm">
        Voice not supported on this browser
      </div>
    )
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2">
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-amber-600 text-xs font-medium bg-white px-3 py-1.5 rounded-xl shadow-lg border border-amber-100"
          >
            {t('voice.listening') || "Listening..."}
          </motion.div>
        )}
        <button
          onClick={toggleListen}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
            isListening
              ? 'bg-amber-500 shadow-amber-500/30 scale-110'
              : 'bg-white border border-gray-200 hover:border-amber-300 hover:shadow-amber-500/10'
          }`}
        >
          {isSpeaking ? (
            <span className="text-2xl">🔊</span>
          ) : (
            <span className={`text-2xl ${isListening ? '' : 'opacity-60'}`}>🎙️</span>
          )}
        </button>
      </div>
      <VoiceToast visible={toastData.visible} heardTitle={toastData.heardTitle} actionTitle={toastData.actionTitle} />
    </>
  )
}
