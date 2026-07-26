import { useState, useRef, useCallback, useEffect } from 'react'
import { Mic, Square, Loader2, Volume2, AlertCircle } from 'lucide-react'

export default function VoiceRecorder({ onRecordingComplete }) {
  const [recording, setRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [supported, setSupported] = useState(true)
  const [duration, setDuration] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  const mediaRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animFrameRef = useRef(null)

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setSupported(false)
    }
    return () => {
      cleanupAudioContext()
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const cleanupAudioContext = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close() } catch (e) {}
      audioContextRef.current = null
    }
    analyserRef.current = null
    setAudioLevel(0)
  }

  const getBestSupportedMimeType = () => {
    if (typeof MediaRecorder === 'undefined') return ''
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav'
    ]
    for (const t of types) {
      if (MediaRecorder.isTypeSupported(t)) return t
    }
    return ''
  }

  const startRecording = useCallback(async () => {
    setErrorMsg('')
    try {
      // 1. Hardware Echo Cancellation & Noise Suppression
      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100,
            channelCount: 1
          }
        })
      } catch (err) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      }

      streamRef.current = stream

      // 2. Real-time Web Audio API Analyser for Soundwave Level
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
        const source = audioCtx.createMediaStreamSource(stream)
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 64
        source.connect(analyser)
        
        audioContextRef.current = audioCtx
        analyserRef.current = analyser

        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        const updateLevel = () => {
          if (!analyserRef.current) return
          analyserRef.current.getByteFrequencyData(dataArray)
          let sum = 0
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i]
          const average = sum / dataArray.length
          const normalized = Math.min(100, Math.round((average / 128) * 100))
          setAudioLevel(normalized)
          animFrameRef.current = requestAnimationFrame(updateLevel)
        }
        updateLevel()
      } catch (e) {
        console.warn('Web Audio API Analyser init failed:', e)
      }

      // 3. MediaRecorder setup with optimal codec
      const mimeType = getBestSupportedMimeType()
      const media = new MediaRecorder(stream, mimeType ? { mimeType } : {})
      chunksRef.current = []

      media.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      media.onstop = async () => {
        cleanupAudioContext()
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop())
        }

        if (chunksRef.current.length === 0) return

        const blobMime = mimeType || 'audio/webm'
        const audioBlob = new Blob(chunksRef.current, { type: blobMime })

        // Check if recording size is sufficient (> 800 bytes)
        if (audioBlob.size < 800) {
          setErrorMsg('التسجيل قصير جداً، أعد المحاولة')
          setTranscribing(false)
          return
        }

        setTranscribing(true)
        try {
          await onRecordingComplete(audioBlob)
        } catch (err) {
          console.error('STT upload error:', err)
          setErrorMsg('خطأ في إرسال الصوت')
        } finally {
          setTranscribing(false)
        }
      }

      mediaRef.current = media
      media.start(250) // Capture audio chunks every 250ms for maximum reliability
      setRecording(true)
      setDuration(0)
      
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000)
    } catch (err) {
      console.error('Microphone access error:', err)
      setErrorMsg('تعذر الوصول إلى الميكروفون')
    }
  }, [onRecordingComplete])

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      mediaRef.current.stop()
    }
    setRecording(false)
  }, [])

  const toggleRecording = useCallback(() => {
    if (recording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [recording, startRecording, stopRecording])

  if (!supported) {
    return (
      <button 
        className="w-11 h-11 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center cursor-not-allowed" 
        disabled 
        title="الميكروفون غير مدعوم في هذا المتصفح"
      >
        <Mic className="w-5 h-5 opacity-40" />
      </button>
    )
  }

  return (
    <div className="relative flex items-center gap-2">
      {/* Live Audio Visualizer Popup */}
      {(transcribing || recording) && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0F1F17] text-[#4ADE80] rounded-2xl text-xs font-bold shadow-lg border border-[#34D399]/30 animate-in fade-in zoom-in duration-200">
          {transcribing ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4ADE80]" />
              <span>جاري تحليل الصوت بالدارجة...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Dynamic Soundwave Equalizer Bars */}
              <div className="flex items-end gap-1 h-4">
                <span 
                  className="w-1 bg-[#4ADE80] rounded-full transition-all duration-75" 
                  style={{ height: `${Math.max(20, audioLevel * 0.9)}%` }} 
                />
                <span 
                  className="w-1 bg-[#34D399] rounded-full transition-all duration-75" 
                  style={{ height: `${Math.max(30, audioLevel * 1.2)}%` }} 
                />
                <span 
                  className="w-1 bg-[#4ADE80] rounded-full transition-all duration-75" 
                  style={{ height: `${Math.max(15, audioLevel * 0.7)}%` }} 
                />
                <span 
                  className="w-1 bg-[#34D399] rounded-full transition-all duration-75" 
                  style={{ height: `${Math.max(25, audioLevel * 1.0)}%` }} 
                />
              </div>

              {/* Timer */}
              <span className="font-mono text-white">
                {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
              </span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            </div>
          )}
        </div>
      )}

      {/* Error Feedback Tooltip */}
      {errorMsg && !recording && !transcribing && (
        <div className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-xl flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Solid Mic Button */}
      <button
        onClick={toggleRecording}
        disabled={transcribing}
        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 shrink-0 shadow-md ${
          recording 
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse ring-4 ring-red-500/30' 
            : transcribing 
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
            : 'bg-[#059669] hover:bg-[#047857] text-white hover:scale-105 active:scale-95'
        }`}
        title={recording ? 'إيقاف التسجيل' : transcribing ? 'جاري المعالجة...' : 'انقر للتحدث بالدارجة (Microphone)'}
      >
        {transcribing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : recording ? (
          <Square className="w-4 h-4 fill-white" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>
    </div>
  )
}
