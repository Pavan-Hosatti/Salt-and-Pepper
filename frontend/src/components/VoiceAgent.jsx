import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, X, Activity, CheckCircle, AlertTriangle, Radio } from 'lucide-react'
import api from '../api'

export default function VoiceAgent() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  
  // Voice States: 'idle', 'listening', 'processing', 'speaking', 'success', 'error'
  const [voiceState, setVoiceState] = useState('idle')
  const [transcript, setTranscript] = useState('')
  const [systemResponse, setSystemResponse] = useState('')
  const [agentOpen, setAgentOpen] = useState(false)
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
    recognitionRef.current.interimResults = true
    recognitionRef.current.lang = 'en-IN'

    recognitionRef.current.onstart = () => {
      setVoiceState('listening')
      setTranscript('')
      setSystemResponse('')
    }
    
    recognitionRef.current.onend = () => {
      if (voiceState === 'listening') {
        setVoiceState('processing')
      }
    }
    
    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event.error)
      setVoiceState('error')
      setSystemResponse('COMMUNICATION_FAILURE // RE-INITIALIZE')
      setTimeout(() => setVoiceState('idle'), 3000)
    }

    recognitionRef.current.onresult = (event) => {
      const currentTranscript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('')
      
      setTranscript(currentTranscript)

      if (event.results[0].isFinal) {
        setVoiceState('processing')
        handleCommand(currentTranscript.toLowerCase())
      }
    }
  }, [voiceState])

  const speak = (text, lang) => {
    if (!window.speechSynthesis) return
    setVoiceState('speaking')
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.onend = () => {
      setVoiceState('idle')
      setTimeout(() => setAgentOpen(false), 1500)
    }
    window.speechSynthesis.speak(utterance)
  }

  const handleCommand = async (command) => {
    const kannadaKeywords = ["tegey", "thumbi", "bidisu", "maadu", "chalu", "kelasa", "aagtha", "store", "maatadu", "idhe", "yaava"]
    const isKannada = kannadaKeywords.some(word => command.includes(word))
    let spokenResponse = ''
    let uiResponse = ''
    let lang = isKannada ? 'kn-IN' : 'en-IN'

    await new Promise(r => setTimeout(r, 600)) // Fake processing delay

    if (command.includes('mumbai') || command.includes('indiranagar')) {
      uiResponse = 'NODE_INDIRANAGAR // ACCESS_GRANTED'
      spokenResponse = 'Accessing Indiranagar node telemetry.'
      navigate('/store/store_02')
      setVoiceState('success')
    } else if (command.includes('bangalore') || command.includes('bengaluru') || command.includes('koramangala')) {
      uiResponse = 'NODE_KORAMANGALA // ACCESS_GRANTED'
      spokenResponse = 'Accessing Koramangala node telemetry.'
      navigate('/store/store_01')
      setVoiceState('success')
    } else if (command.includes('delhi') || command.includes('hsr') || command.includes('layout')) {
      uiResponse = 'NODE_HSR // ACCESS_GRANTED'
      spokenResponse = 'Accessing HSR Layout node telemetry.'
      navigate('/store/store_03')
      setVoiceState('success')
    } else if (command.includes('whitefield')) {
      uiResponse = 'NODE_WHITEFIELD // ACCESS_GRANTED'
      spokenResponse = 'Accessing Whitefield node telemetry.'
      navigate('/store/store_04')
      setVoiceState('success')
    } else if (command.includes('jp nagar') || command.includes('jp') || command.includes('nagar')) {
      uiResponse = 'NODE_JPNAGAR // ACCESS_GRANTED'
      spokenResponse = 'Accessing JP Nagar node telemetry.'
      navigate('/store/store_05')
      setVoiceState('success')
    } else if (command.includes('fix everything') || command.includes('resolve all') || command.includes('fix all')) {
      uiResponse = 'GLOBAL_MITIGATION // ENGAGED'
      spokenResponse = 'Initiating global mitigation protocols. All active conflicts resolved.'
      setVoiceState('success')
      // Navigate to alerts with resolved state after a delay
      setTimeout(() => navigate('/alerts'), 1500)
    } else if (command.includes('critical alerts') || command.includes('show me') || command.includes('alerts') || command.includes('mukhya alerts')) {
      uiResponse = 'CRITICAL_ALERTS // FETCHED'
      spokenResponse = 'Displaying critical network alerts.'
      navigate('/alerts')
      setVoiceState('success')
    } else if (command.includes('dashboard') || command.includes('home') || command.includes('overview') || command.includes('network')) {
      uiResponse = 'NETWORK_OVERVIEW // LOADED'
      spokenResponse = 'Returning to network overview.'
      navigate('/')
      setVoiceState('success')
    } else {
      setVoiceState('error')
      uiResponse = 'COMMAND_UNRECOGNIZED // AWAITING_INPUT'
      spokenResponse = "I didn't catch that. Please repeat your command."
      setTimeout(() => setVoiceState('idle'), 3000)
      return speak(spokenResponse, lang)
    }

    setSystemResponse(uiResponse)
    speak(spokenResponse, lang)
  }

  const toggleAgent = () => {
    if (!supported) return
    if (!agentOpen) {
      setAgentOpen(true)
      setVoiceState('idle')
    } else {
      if (recognitionRef.current) recognitionRef.current.stop()
      setAgentOpen(false)
      setVoiceState('idle')
    }
  }

  const startListening = () => {
    if (!recognitionRef.current) return
    recognitionRef.current.lang = i18n.language === 'kn' ? 'kn-IN' : i18n.language === 'hi' ? 'hi-IN' : 'en-IN'
    try {
      recognitionRef.current.start()
    } catch (e) {
      console.error('Audio capture error', e)
    }
  }

  if (!supported) return null

  return (
    <>
      {/* Floating Entry Button */}
      {!agentOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={toggleAgent}
          className="fixed bottom-8 right-8 w-16 h-16 bg-[#020617] border border-white/10 flex items-center justify-center rounded-full shadow-[0_0_30px_rgba(251,191,36,0.15)] hover:border-amber-500/50 hover:shadow-[0_0_40px_rgba(251,191,36,0.3)] transition-all z-50 group"
        >
          <div className="absolute inset-0 rounded-full bg-amber-500/5 scale-0 group-hover:scale-100 transition-transform duration-500" />
          <Radio className="w-6 h-6 text-amber-500" />
        </motion.button>
      )}

      {/* Full Screen Conversational Overlay */}
      <AnimatePresence>
        {agentOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#020617]/95 backdrop-blur-xl flex flex-col items-center justify-between py-12 px-6"
          >
            {/* 1. TOP SECTION (STATUS BAR) */}
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="w-full max-w-4xl flex items-center justify-between border-b border-white/10 pb-4"
            >
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${
                  voiceState === 'listening' ? 'bg-amber-500 animate-pulse' : 
                  voiceState === 'success' ? 'bg-emerald-500' : 
                  voiceState === 'error' ? 'bg-red-500' : 'bg-blue-500'
                }`} />
                <span className="font-mono text-xs font-black uppercase tracking-[0.3em] text-white/50">
                  {voiceState === 'idle' ? 'SYSTEM_STANDBY' : 
                   voiceState === 'listening' ? 'AWAITING_VOCAL_INPUT' : 
                   voiceState === 'processing' ? 'SEMANTIC_ANALYSIS' : 
                   voiceState === 'speaking' ? 'TRANSMITTING' : 
                   voiceState === 'error' ? 'SYSTEM_FAULT' : 'SECURE_LINK_ACTIVE'}
                </span>
              </div>
              <button onClick={toggleAgent} className="text-white/40 hover:text-white transition-colors p-2">
                <X className="w-6 h-6" />
              </button>
            </motion.div>

            {/* 2. CENTER AREA (CORE INTERACTION ZONE) */}
            <div className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center relative">
              
              {/* Voice Indicator Ring */}
              <div className="relative w-64 h-64 flex items-center justify-center mb-12">
                {/* Background Pulsing Rings */}
                {voiceState === 'listening' && (
                  <>
                    <motion.div animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border border-amber-500/40" />
                    <motion.div animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.6 }} className="absolute inset-0 rounded-full border border-amber-500/30" />
                    <motion.div animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1.2 }} className="absolute inset-0 rounded-full border border-amber-500/20" />
                  </>
                )}
                
                {voiceState === 'speaking' && (
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5, repeat: Infinity }} className="absolute inset-0 rounded-full bg-blue-500/10 blur-xl" />
                )}

                {/* Core Circle */}
                <div className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
                  voiceState === 'listening' ? 'bg-amber-500 shadow-[0_0_80px_rgba(251,191,36,0.4)]' :
                  voiceState === 'processing' ? 'bg-blue-500/20 border-2 border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.3)] animate-spin' :
                  voiceState === 'speaking' ? 'bg-blue-500 shadow-[0_0_80px_rgba(59,130,246,0.4)]' :
                  voiceState === 'success' ? 'bg-emerald-500 shadow-[0_0_60px_rgba(16,185,129,0.4)]' :
                  voiceState === 'error' ? 'bg-red-500 shadow-[0_0_60px_rgba(239,68,68,0.4)]' :
                  'bg-[#0f172a] border border-white/20'
                }`}>
                  {voiceState === 'idle' && <Mic className="w-10 h-10 text-white/50" />}
                  {voiceState === 'listening' && <Mic className="w-10 h-10 text-[#020617]" />}
                  {voiceState === 'processing' && <Activity className="w-10 h-10 text-blue-500" />}
                  {voiceState === 'speaking' && <Radio className="w-10 h-10 text-white" />}
                  {voiceState === 'success' && <CheckCircle className="w-10 h-10 text-white" />}
                  {voiceState === 'error' && <AlertTriangle className="w-10 h-10 text-white" />}
                </div>
              </div>

              {/* Status & Transcript Text */}
              <div className="text-center space-y-6 max-w-2xl">
                <AnimatePresence mode="wait">
                  {transcript && (
                    <motion.div 
                      key="transcript"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-white/60 font-mono text-lg tracking-widest uppercase break-words"
                    >
                      &gt; {transcript}
                    </motion.div>
                  )}
                  {systemResponse && (
                    <motion.div 
                      key="response"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`font-mono text-xl md:text-2xl font-black uppercase tracking-[0.2em] ${
                        voiceState === 'error' ? 'text-red-400' : 'text-amber-400'
                      }`}
                    >
                      {systemResponse}
                    </motion.div>
                  )}
                  {voiceState === 'idle' && !transcript && !systemResponse && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-white/30 font-mono text-sm uppercase tracking-[0.4em]"
                    >
                      TAP MICROPHONE TO INITIATE
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* 3. ACTION AREA */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="w-full flex justify-center pb-8"
            >
              <button
                onClick={voiceState === 'listening' ? () => recognitionRef.current?.stop() : startListening}
                className={`flex items-center justify-center p-6 rounded-full transition-all ${
                  voiceState === 'listening' ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/5 text-white hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                }`}
              >
                {voiceState === 'listening' ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
