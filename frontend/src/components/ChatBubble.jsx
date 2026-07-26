import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Volume2, VolumeX, Play, Pause, Mic } from 'lucide-react'

export default function ChatBubble({ message }) {
  const isNurse = message.role === 'infirmier'
  const isVoice = message.type === 'voice' || message.isInitialVoice
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices()
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices()
      }
    }
  }, [])

  const normalizeForArabicTTS = (text) => {
    if (!text) return ''
    
    // Clean out symbols, markdown, slashes
    let clean = text
      .replace(/\*\*/g, '')
      .replace(/[\/\\#_\-\*\~\[\]\(\)]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    // If text is already Arabic script, keep clean
    if (/[\u0600-\u06FF]/.test(clean)) {
      return clean
    }

    // Convert Arabizi phonetic numbers for Arabic TTS engine
    return clean
      .replace(/3/g, 'ع')
      .replace(/7/g, 'ح')
      .replace(/9/g, 'ق')
      .replace(/5/g, 'خ')
      .replace(/kh/gi, 'خ')
      .replace(/gh/gi, 'غ')
      .replace(/ch/gi, 'ش')
  }

  const audioRef = useRef(null)

  const fallbackBrowserSpeech = (cleanText) => {
    if (!('speechSynthesis' in window)) {
      setIsPlaying(false)
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(cleanText)
    const voices = window.speechSynthesis.getVoices()
    const arabicVoice = voices.find(v => v.lang.startsWith('ar-MA')) ||
                        voices.find(v => v.lang.startsWith('ar')) ||
                        voices.find(v => v.name.toLowerCase().includes('arabic') || 
                                         v.name.toLowerCase().includes('naayf') || 
                                         v.name.toLowerCase().includes('hoda') ||
                                         v.name.toLowerCase().includes('tarik'))

    if (arabicVoice) {
      utterance.voice = arabicVoice
      utterance.lang = arabicVoice.lang
    } else {
      utterance.lang = 'ar-MA'
    }

    utterance.rate = 0.90
    utterance.pitch = 1.0

    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)

    window.speechSynthesis.speak(utterance)
  }

  const speakText = async (text) => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      setIsPlaying(false)
      return
    }

    let rawText = message.speechContent || text || ''
    let cleanText = normalizeForArabicTTS(rawText)

    setIsPlaying(true)

    try {
      const encodedText = encodeURIComponent(cleanText)
      const audioUrl = `http://localhost:8000/api/consultations/voice/synthesize?text=${encodedText}`
      
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onended = () => setIsPlaying(false)
      audio.onerror = (e) => {
        console.warn('Backend Moroccan TTS error, falling back to browser speech', e)
        fallbackBrowserSpeech(cleanText)
      }

      await audio.play()
    } catch (err) {
      console.warn('Playback error, falling back to browser speech', err)
      fallbackBrowserSpeech(cleanText)
    }
  }

  const DARIJA_RED_FLAGS = [
    { pattern: /sda3 f[ -]?ras|صداع في الراس|صداع/gi, label: 'Céphalée pré-éclamptique', color: 'bg-amber-100 border-amber-300 text-amber-900' },
    { pattern: /zglagh f[ -]?3aynayn|زغلاغ في عينين|زغلاغ|flou visuel/gi, label: 'Trouble Visuel Sévère', color: 'bg-[#FEF3C7] border-amber-400 text-amber-900' },
    { pattern: /hri9 f[ -]?kerch|wja3 f l-karch|حريق في الكرش|وجع/gi, label: 'Contractions / Douleur Épigastrique', color: 'bg-red-100 border-red-300 text-red-900' },
    { pattern: /tansion t3lat|tansion|طنسيون|ضغط مرتفع/gi, label: 'HTA Gravidique Sévère', color: 'bg-red-100 border-red-300 text-red-900' },
    { pattern: /pré-éclampsie|pre-eclampsia|hta sévère/gi, label: 'Patologia Crítico (Urgence CHR)', color: 'bg-red-200 border-red-400 text-red-950 font-black' }
  ]

  const renderContent = (text) => {
    if (!text) return null
    const lines = text.split('\n')
    return lines.map((line, i) => {
      const trimmed = line.trim()
      if (!trimmed) return <div key={i} className="h-1.5" />
      
      // Parse basic bold markdown & highlight dialectal red flag terms
      const parts = trimmed.split(/(\*\*.*?\*\*)/g)
      const formattedLine = parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index} className="font-extrabold text-[#0F1F17]">{part.slice(2, -2)}</strong>
        }

        // Check if part contains any dialectal terms for explainability highlighting
        let element = [part]
        DARIJA_RED_FLAGS.forEach(({ pattern, label, color }) => {
          const nextElements = []
          element.forEach((subPart) => {
            if (typeof subPart !== 'string') {
              nextElements.push(subPart)
              return
            }
            const subMatches = subPart.split(pattern)
            const matches = subPart.match(pattern)
            if (matches) {
              subMatches.forEach((piece, mIdx) => {
                nextElements.push(piece)
                if (mIdx < matches.length) {
                  nextElements.push(
                    <span 
                      key={`hl-${index}-${mIdx}`} 
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[11px] font-bold mx-0.5 ${color}`}
                      title={`Terme clinique motivant le score de risque: ${label}`}
                    >
                      <span>🔍</span>
                      <span>{matches[mIdx]}</span>
                      <span className="text-[9px] opacity-75 uppercase tracking-tighter font-mono font-extrabold">({label})</span>
                    </span>
                  )
                }
              })
            } else {
              nextElements.push(subPart)
            }
          })
          element = nextElements
        })

        return <span key={index}>{element}</span>
      })

      if (line.startsWith('  ') || line.startsWith('\t')) {
        return <div key={i} className="pl-3 text-xs mb-1">{formattedLine}</div>
      }
      return <div key={i} className="text-xs leading-relaxed mb-1">{formattedLine}</div>
    })
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`p-4 rounded-3xl max-w-[82%] text-xs ${
        isNurse 
          ? 'self-end bg-white border border-emerald-100 shadow-sm text-gray-800 rounded-br-none' 
          : 'self-start bg-[#ECFDF5] border border-[#34D399]/40 shadow-md shadow-emerald-950/[0.03] text-[#0F1F17] rounded-bl-none'
      }`}
    >
      {/* Voice Audio Player Box if message is voice */}
      {isVoice && (
        <div className="mb-3 p-3 bg-white rounded-2xl border border-emerald-100 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => speakText(message.content)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                isPlaying 
                  ? 'bg-red-500 text-white animate-pulse shadow-md' 
                  : 'bg-[#0F1F17] text-[#4ADE80] hover:bg-[#1A3A28]'
              }`}
              title={isPlaying ? "Mettre en pause" : "Écouter le vocal en Darija"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <div>
              <div className="text-[11px] font-extrabold text-[#0F1F17]">
                {isPlaying ? "Lecture vocale IA en cours..." : "Message vocal Darija"}
              </div>
              <div className="text-[9px] font-bold text-[#059669] flex items-center gap-1 mt-0.5">
                <Volume2 className="w-3 h-3 text-[#059669]" />
                <span>Assistant Médical Dar Al Oumouma</span>
              </div>
            </div>
          </div>

          {/* Equalizer Soundwaves Animation */}
          <div className="flex items-center gap-1 h-5 px-2">
            <span className={`w-1 rounded-full bg-[#4ADE80] transition-all ${isPlaying ? 'h-5 animate-bounce' : 'h-2'}`} />
            <span className={`w-1 rounded-full bg-[#059669] transition-all ${isPlaying ? 'h-3 animate-pulse' : 'h-1.5'}`} />
            <span className={`w-1 rounded-full bg-[#4ADE80] transition-all ${isPlaying ? 'h-4 animate-bounce' : 'h-3'}`} />
            <span className={`w-1 rounded-full bg-[#059669] transition-all ${isPlaying ? 'h-2 animate-pulse' : 'h-1'}`} />
          </div>
        </div>
      )}

      <div>{renderContent(message.content)}</div>

      <div className="mt-2 pt-1 border-t border-emerald-100/50 flex items-center justify-between text-[10px] text-gray-400 font-medium">
        <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
          isNurse ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-[#059669]'
        }`}>
          {isVoice ? '🎙️ Message Vocal Darija' : message.role === 'infirmier' ? 'Soignant' : 'IA Gemma 4'}
        </span>
        
        {message.timestamp && (
          <span>
            {new Date(message.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </motion.div>
  )
}
