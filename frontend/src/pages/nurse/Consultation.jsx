import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Send, Sparkles, AlertTriangle, ShieldCheck, FileText, 
  Stethoscope, Calendar, CheckCircle2, ChevronRight, Mic, RefreshCw,
  Volume2, Share2, PhoneCall, Wifi, WifiOff, Play, Pause
} from 'lucide-react'
import api from '../../services/api'
import ChatBubble from '../../components/ChatBubble'
import VoiceRecorder from '../../components/VoiceRecorder'
import PrescriptionForm from '../../components/PrescriptionForm'
import UrgencyBadge from '../../components/UrgencyBadge'
import CHRTransferSheet from '../../components/CHRTransferSheet'
import { saveOfflineConsultation, saveOfflineVoice, syncPendingItems } from '../../services/offlineSync'

export default function Consultation() {
  const { id } = useParams()
  const [messages, setMessages] = useState([])
  const [urgency, setUrgency] = useState('green')
  const [textInput, setTextInput] = useState('')
  const [pendingVoiceText, setPendingVoiceText] = useState('')
  const [voiceDebugMode, setVoiceDebugMode] = useState(true)
  const [loading, setLoading] = useState(false)
  const [voiceLoading, setVoiceLoading] = useState(false)
  const [finalized, setFinalized] = useState(false)
  const [finalResult, setFinalResult] = useState(null)
  const [showCHRModal, setShowCHRModal] = useState(false)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [isPlayingMotherAudio, setIsPlayingMotherAudio] = useState(false)
  const chatRef = useRef(null)

  const textIsArabic = (text) => /[\u0600-\u06FF]/.test(text || '')

  const convertArabiziToArabic = (text) => {
    if (!text) return ''
    if (textIsArabic(text)) return text

    return text
      .replace(/\bsalam\b/gi, 'سلام')
      .replace(/\b3likom\b|\b3laykom\b/gi, 'عليكم')
      .replace(/\bsmiti\b/gi, 'سميتي')
      .replace(/\bmriwda\b|\bmrioda\b|\bmarida\b/gi, 'مريضة')
      .replace(/\bdiali\b|\bdialha\b/gi, 'ديالي')
      .replace(/\bhamla\b/gi, 'حاملة')
      .replace(/\bcheher\b|\bchhar\b/gi, 'شهر')
      .replace(/\brab3\b|\braba3\b/gi, 'الرابع')
      .replace(/\b3ndha\b/gi, 'عندها')
      .replace(/\bsda3\b/gi, 'صداع')
      .replace(/\bras\b/gi, 'رأس')
      .replace(/\btansion\b/gi, 'طنسيون')
      .replace(/\bwja3\b/gi, 'وجع')
      .replace(/\bkerch\b|\bkarch\b/gi, 'كرش')
      .replace(/3/g, 'ع')
      .replace(/7/g, 'ح')
      .replace(/9/g, 'ق')
      .replace(/5/g, 'خ')
      .replace(/kh/gi, 'خ')
      .replace(/gh/gi, 'غ')
      .replace(/ch/gi, 'ش')
  }

  const INITIAL_AI_DARIJA_VOICE = {
    role: 'assistant',
    type: 'voice',
    isInitialVoice: true,
    content: "Sbah l-khir / Salam 3likom. Ana l-moussa3id l-tibbi dyal Dar Al Oumouma. Kif 3amla l-yoma? Wash 3ndk chi sda3 f ras, tansion t3lat, awla wja3 f l-karch?",
    speechContent: "صباح الخير، السلام عليكم. أنا المساعد الطبي ديال دار الأمومة. كيف عاملة اليوم؟ واش عندك شي صداع في الراس، طنسيون طالعة، أولا وجع في الكرش؟",
    timestamp: new Date().toISOString()
  }

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      syncPendingItems(api)
    }
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    api.get(`/consultations/${id}`).then(res => {
      const transcript = res.data.transcript || []
      if (transcript.length === 0) {
        setMessages([INITIAL_AI_DARIJA_VOICE])
      } else {
        setMessages(transcript)
      }
      const uLvl = res.data.urgency_level || 'green'
      setUrgency(uLvl)
      if (uLvl === 'red') setShowCHRModal(true)
    }).catch(() => {
      setMessages([INITIAL_AI_DARIJA_VOICE])
    })
  }, [id])

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages])

  const sendMessageToAI = async (content) => {
    if (!content?.trim()) return
    setLoading(true)
    try {
      if (!navigator.onLine) {
        await saveOfflineConsultation(id, { content })
        const userMsg = { role: 'infirmier', content, timestamp: new Date().toISOString() }
        setMessages(prev => [...prev, userMsg])
        return
      }

      const res = await api.post(`/consultations/${id}/message`, { content })
      setMessages(prev => [...prev, ...res.data.new_messages])
      const newUrg = res.data.urgency_level || 'green'
      setUrgency(newUrg)
      if (newUrg === 'red') setShowCHRModal(true)
    } catch (err) {
      console.error('Erreur message IA:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleVoiceInput = async (audioBlob) => {
    setVoiceLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', audioBlob, 'voice.webm')
      const res = await api.post('/consultations/voice/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      })
      const transcriptText = (res.data?.text || '').trim()
      if (!transcriptText || transcriptText.startsWith('[')) return

      if (voiceDebugMode) {
        setPendingVoiceText(transcriptText)
        return
      }
      await sendMessageToAI(transcriptText)
    } catch (err) {
      console.error('Erreur transcription vocale:', err)
    } finally {
      setVoiceLoading(false)
    }
  }

  const handleTextSubmit = async () => {
    if (!textInput.trim() || loading) return
    await sendMessageToAI(textInput)
    setTextInput('')
  }

  const handleSendPendingVoice = async () => {
    if (!pendingVoiceText.trim() || loading) return
    await sendMessageToAI(pendingVoiceText)
    setPendingVoiceText('')
  }

  const handleFinalize = async () => {
    setLoading(true)
    try {
      const res = await api.post(`/consultations/${id}/finalize`)
      setFinalResult(res.data)
      setFinalized(true)
      setUrgency(res.data.urgency_level || 'green')
    } catch (err) {
      console.error('Erreur finalisation:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-[#FAFDFB] overflow-hidden">
      
      {/* Main Consultation Panel */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-emerald-100">
        
        {/* Header Bar */}
        <div className="p-4 bg-white border-b border-emerald-100 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
            <Link to="/nurse/dossiers">
              <button className="w-9 h-9 rounded-xl border border-emerald-200 flex items-center justify-center text-gray-700 hover:bg-emerald-50 transition-colors">
                <ArrowLeft className="w-4 h-4 text-[#059669]" />
              </button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 font-display">
                  Consultation Prénatale CPN · Dossier #${id}
                </h1>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  Système CPN Informatisé
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Saisie Vocale & Dialectale Darija · Dispensaire Rural Al Haouz · {messages.length} échange(s)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Offline-First Resilience Status */}
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1.5 border ${
              isOffline 
                ? 'bg-amber-50 text-amber-800 border-amber-300' 
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              {isOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> : <Wifi className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{isOffline ? 'Mode Hors-Ligne (IndexedDB)' : 'En Ligne (Haut-Atlas Sync)'}</span>
            </div>

            {/* CHR Transfer Sheet Trigger Button */}
            <button 
              onClick={() => setShowCHRModal(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs ${
                urgency === 'red' || finalResult?.urgency_level === 'red'
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-bounce shadow-md'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-white" />
              <span>Fiche Transfert CHR</span>
            </button>

            <UrgencyBadge level={urgency} />
          </div>
        </div>

        {/* 6-Step Voice Consultation Flow Tracker */}
        <div className="px-4 py-2 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between text-[11px] font-medium overflow-x-auto gap-2">
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-5 h-5 rounded-full bg-[#0F1F17] text-[#4ADE80] flex items-center justify-center text-[10px] font-extrabold">1</span>
            <span className="text-gray-700 font-bold">Présentation</span>
          </div>
          <span className="text-gray-300">→</span>
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-extrabold">2</span>
            <span className="text-gray-700 font-bold">Motif</span>
          </div>
          <span className="text-gray-300">→</span>
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-extrabold">3</span>
            <span className="text-gray-700 font-bold">Symptômes</span>
          </div>
          <span className="text-gray-300">→</span>
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-extrabold">4</span>
            <span className="text-gray-700 font-bold">Raisonnement</span>
          </div>
          <span className="text-gray-300">→</span>
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-extrabold">5</span>
            <span className="text-gray-700 font-bold">Urgence</span>
          </div>
          <span className="text-gray-300">→</span>
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-extrabold">6</span>
            <span className="text-gray-700 font-bold">Conseil</span>
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FAFDFB]" ref={chatRef}>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[350px] text-center p-8 bg-white rounded-3xl border border-emerald-100 shadow-sm max-w-md mx-auto my-auto"
            >
              <div className="w-16 h-16 rounded-3xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center mb-4 shadow-sm">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-[#0F1F17] font-display mb-1">
                Assistant Médical IA Vocal
              </h3>
              <p className="text-xs text-gray-500 max-w-xs leading-relaxed mb-4">
                Enregistrez le vocal du patient (Darija, Français, العربية, English) ou saisissez les symptômes. L'assistant posera une seule question ciblée à la fois.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                  🎙️ Consultation Vocale Optimisée (&lt;80 mots)
                </span>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                  🩺 Évaluation Urgence LOW/MED/HIGH/CRITICAL
                </span>
              </div>
            </motion.div>
          )}

          {messages.map((msg, i) => (
            <ChatBubble key={i} message={msg} />
          ))}

          {loading && (
            <div className="bg-white border border-emerald-100 p-4 rounded-3xl max-w-xs shadow-sm flex items-center gap-2 text-xs font-bold text-[#059669]">
              <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-ping" />
              <span>Gemma 4 rédigera l'analyse médicale...</span>
            </div>
          )}
        </div>

        {/* Voice Debug Mode Box */}
        <div className="px-4 py-2 bg-white border-t border-emerald-100 flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-gray-600 font-medium">
            <input 
              type="checkbox" 
              checked={voiceDebugMode} 
              onChange={(e) => setVoiceDebugMode(e.target.checked)} 
              className="accent-[#059669] rounded"
            />
            <span>Vérifier le texte Darija transcrit avant envoi</span>
          </label>
          {voiceLoading && (
            <span className="text-xs font-bold text-[#059669] animate-pulse">
              Transcription vocale en cours...
            </span>
          )}
        </div>

        {/* Pending Voice Box Preview (Darija Arabic Script Debug) */}
        {pendingVoiceText && (
          <div className="p-4 bg-[#ECFDF5] border-t border-[#34D399]/40 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-[#059669]">
              <span>النص المنطوق بالدارجة (الخط العربي) / Texte Darija Capturé :</span>
              <button
                type="button"
                onClick={() => {
                  const arabicText = textIsArabic(pendingVoiceText) 
                    ? pendingVoiceText 
                    : convertArabiziToArabic(pendingVoiceText)
                  setPendingVoiceText(arabicText)
                }}
                className="text-[10px] bg-white border border-emerald-300 px-2.5 py-0.5 rounded-full text-[#059669] font-bold hover:bg-emerald-50"
              >
                ✨ تحويل للأحرف العربية
              </button>
            </div>
            <textarea 
              dir="auto"
              rows={2}
              className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-sm font-medium text-gray-800 outline-none focus:border-[#10B981] shadow-inner font-sans" 
              value={pendingVoiceText} 
              onChange={(e) => setPendingVoiceText(e.target.value)} 
              placeholder="النص المنطوق بالدارجة سيظهر هنا..."
            />
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setPendingVoiceText('')} 
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold bg-white text-gray-600 hover:bg-gray-50"
              >
                Annuler / إلغاء
              </button>
              <button 
                onClick={handleSendPendingVoice} 
                disabled={loading || !pendingVoiceText.trim()}
                className="px-4 py-1.5 rounded-lg bg-[#0F1F17] text-[#4ADE80] text-xs font-extrabold shadow-sm hover:bg-[#1A3A28] flex items-center gap-1.5"
              >
                <span>إرسال للمساعد الطبي</span>
                <span className="text-[10px] text-gray-400">(Envoyer à l'IA)</span>
              </button>
            </div>
          </div>
        )}

        {/* Input Controls Bar */}
        <div className="p-4 bg-white border-t border-emerald-100 flex items-center gap-3">
          <VoiceRecorder onRecordingComplete={handleVoiceInput} />
          
          <input
            className="flex-1 h-11 px-4 border border-gray-200 rounded-2xl text-xs font-medium outline-none focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 bg-[#FAFDFB]"
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleTextSubmit()}
            placeholder="Saisissez les observations cliniques ou plaintes en Darija..."
            disabled={loading}
          />
          
          <button 
            onClick={handleTextSubmit} 
            disabled={loading || !textInput.trim()}
            className="w-11 h-11 rounded-2xl bg-[#0F1F17] text-[#4ADE80] flex items-center justify-center hover:bg-[#1A3A28] disabled:opacity-40 shadow-sm transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Finalize Banner Bar */}
        <div className="p-3 bg-[#FAFDFB] border-t border-emerald-100">
          <button 
            onClick={handleFinalize} 
            disabled={loading || messages.length < 2 || finalized}
            className="w-full py-3 rounded-2xl bg-[#0F1F17] hover:bg-[#1A3A28] text-[#4ADE80] text-xs font-extrabold shadow-md flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
          >
            <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
            <span>{finalized ? 'Compte-Rendu & Ordonnance Générés' : 'Finaliser la Consultation Prénatale (Générer Synthèse & Ordonnance)'}</span>
          </button>
        </div>

      </div>


      {/* Right Side AI Final Report Panel */}
      <AnimatePresence>
        {finalized && finalResult && (
          <motion.div 
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-[420px] bg-white overflow-y-auto p-6 space-y-6 shadow-2xl border-l border-emerald-100 z-20"
          >
            <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-[#059669] uppercase tracking-wider">Synthèse Automatisée</span>
                <h2 className="text-lg font-extrabold text-[#0F1F17] font-display">Rapport Médical CPN</h2>
              </div>
              <UrgencyBadge level={finalResult.urgency_level} />
            </div>
            
            {/* Compte Rendu Card */}
            <div className="bg-[#FAFDFB] p-5 rounded-3xl border border-emerald-100 space-y-2">
              <div className="text-xs font-extrabold text-[#0F1F17] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#059669]" />
                <span>Compte-Rendu Obstétrical</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                {finalResult.compte_rendu}
              </p>
            </div>

            {/* Red Flags Alert & CHR Transfer trigger */}
            {finalResult.red_flags?.length > 0 && (
              <div className="bg-red-50 p-5 rounded-3xl border border-red-200 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-xs font-extrabold text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 animate-bounce" />
                    <span>Signes de Gravité (Red Flags CHR)</span>
                  </div>
                  <button 
                    onClick={() => setShowCHRModal(true)}
                    className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-extrabold flex items-center gap-1 shadow-sm"
                  >
                    <span>🚨 Imprimer Fiche CHR</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {finalResult.red_flags.map((f, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-red-200 text-red-700 text-[10px] font-bold shadow-sm">
                      ⚠️ {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Pillar 1: Total Vocal Inclusion in Darija for Illiterate Mothers */}
            <div className="bg-[#ECFDF5] p-5 rounded-3xl border border-[#34D399]/40 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-xs font-extrabold text-[#0F1F17] flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#059669]" />
                  <span>🎙️ Note Vocale Darija (Maman)</span>
                </div>
                <span className="text-[9px] font-bold bg-white text-[#059669] px-2 py-0.5 rounded-full border border-emerald-200">
                  SMS / WhatsApp Vocal
                </span>
              </div>
              <p className="text-xs font-arabic text-gray-800 bg-white p-3 rounded-2xl border border-emerald-100 leading-relaxed font-bold" dir="rtl">
                "صباح الخير اختي. ما تنسايش تاخدي دواك في الوقت. و إيلا حسيتي ب شي صداع قاصح في الراس أولا ضبابة في العينين، أجي فورا للمستوصف."
              </p>
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => {
                    if ('speechSynthesis' in window) {
                      if (isPlayingMotherAudio) {
                        window.speechSynthesis.cancel()
                        setIsPlayingMotherAudio(false)
                      } else {
                        const utt = new SpeechSynthesisUtterance("صباح الخير اختي. ما تنسايش تاخدي دواك في الوقت. و إيلا حسيتي ب شي صداع قاصح في الراس أولا ضبابة في العينين، أجي فورا للمستوصف.")
                        utt.lang = 'ar-MA'
                        utt.onend = () => setIsPlayingMotherAudio(false)
                        utt.onerror = () => setIsPlayingMotherAudio(false)
                        setIsPlayingMotherAudio(true)
                        window.speechSynthesis.speak(utt)
                      }
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0F1F17] hover:bg-[#1A3A28] text-[#4ADE80] text-xs font-extrabold flex items-center gap-2 shadow-xs"
                >
                  {isPlayingMotherAudio ? <Pause className="w-3.5 h-3.5 text-red-400 animate-pulse" /> : <Play className="w-3.5 h-3.5 text-[#4ADE80]" />}
                  <span>{isPlayingMotherAudio ? 'En cours...' : 'Écouter Consigne Vocale'}</span>
                </button>
                
                <button 
                  onClick={() => alert("Note vocale transmise par SMS/WhatsApp au numéro de la patiente.")}
                  className="px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-gray-700 hover:bg-emerald-50 text-xs font-bold flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Envoyer SMS</span>
                </button>
              </div>
            </div>

            {/* Ordonnance Card */}
            <div className="bg-[#FAFDFB] p-5 rounded-3xl border border-emerald-100 space-y-3">
              <div className="text-xs font-extrabold text-[#0F1F17] flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-[#059669]" />
                <span>Ordonnance Médicale Proposée</span>
              </div>
              <PrescriptionForm ordonnance={finalResult.ordonnance} readonly />
            </div>

            {/* Programme de Suivi */}
            {finalResult.follow_up_program?.monthly_plan?.length > 0 && (
              <div className="bg-[#FAFDFB] p-5 rounded-3xl border border-emerald-100 space-y-3">
                <div className="text-xs font-extrabold text-[#0F1F17] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#059669]" />
                  <span>Programme de Suivi Mensuel</span>
                </div>
                <div className="space-y-3 pt-1">
                  {finalResult.follow_up_program.monthly_plan.map((plan) => (
                    <div key={plan.month} className="p-3 bg-white rounded-2xl border border-emerald-100 space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold text-[#0F1F17]">
                        <span>Mois {plan.month}</span>
                        <span className="text-[10px] text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-full font-bold">
                          {plan.cadence}
                        </span>
                      </div>
                      <ul className="text-[11px] text-gray-600 space-y-1 pl-2">
                        {(plan.checklist || []).map((item, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

      {/* CHR Transfer Sheet Modal */}
      {showCHRModal && (
        <CHRTransferSheet
          consultation={{ id }}
          redFlags={finalResult?.red_flags || []}
          compteRendu={finalResult?.compte_rendu}
          ordonnance={finalResult?.ordonnance}
          onClose={() => setShowCHRModal(false)}
        />
      )}

    </div>
  )
}
