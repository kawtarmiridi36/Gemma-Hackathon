import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, CheckCircle2, Edit3, XCircle, AlertTriangle, FileText, Stethoscope, MessageSquare
} from 'lucide-react'
import api from '../../services/api'
import ChatBubble from '../../components/ChatBubble'
import PrescriptionForm from '../../components/PrescriptionForm'
import UrgencyBadge from '../../components/UrgencyBadge'

export default function ConsultationReview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [notes, setNotes] = useState('')

  const mockDetail = {
    id: id,
    urgency_level: 'red',
    red_flags: ['Hypertension artérielle sévère (16/10)', 'Céphalées intenses avec troubles visuels'],
    transcript: [
      { role: 'infirmier', content: 'Patiente présente une forte douleur à la tête et vertiges depuis ce matin (Sda3 f ras).', type: 'voice' },
      { role: 'ai', content: 'Alerte pré-éclampsie potentielle. Tension PA mesurée à 16/10. Recommandation immédiate : Transfert URGENT au CHR Al Haouz.', type: 'text' }
    ],
    compte_rendu: 'Patiente primipare à 34 SA présentant une suspicion élevée de pré-éclampsie sévère. Protocole d urgence engagé.',
    ordonnance: [
      { medication: 'Sulfate de Magnésium (IV)', dosage: '4g en bolus lent sur 15 min', duration: 'Protocol Urgence' },
      { medication: 'Nifédipine LP', dosage: '10mg par voie orale', duration: 'Pression artérielle' }
    ]
  }

  useEffect(() => {
    api.get(`/validation/${id}`)
      .then(res => setDetail(res.data))
      .catch(() => setDetail(mockDetail))
      .finally(() => setLoading(false))
  }, [id])

  const handleAction = async (action) => {
    setActionLoading(true)
    try {
      await api.post(`/validation/${id}`, { action, notes: notes || null })
      navigate('/doctor/queue')
    } catch (err) {
      console.error(err)
      navigate('/doctor/queue')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return (
    <div className="p-12 text-center text-xs font-bold text-[#059669] flex items-center justify-center gap-2">
      <span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80] animate-ping" />
      <span>Chargement de la consultation pour révision...</span>
    </div>
  )

  if (!detail) return (
    <div className="p-12 text-center text-xs text-gray-400">
      Consultation non trouvée.
    </div>
  )

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 bg-[#FAFDFB] min-h-screen">
      
      {/* ── 1. HEADER BAR ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/doctor/queue">
            <button className="w-10 h-10 rounded-2xl border border-emerald-200 flex items-center justify-center text-gray-700 hover:bg-emerald-50 transition-colors">
              <ArrowLeft className="w-4 h-4 text-[#059669]" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-[#0F1F17] font-display">
                Examen Médical · Consultation #{id}
              </h1>
              <UrgencyBadge level={detail.urgency_level} />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Révision clinique du médecin référent avant validation officielle et impression
            </p>
          </div>
        </div>
      </div>


      {/* ── 2. RED FLAGS ALERT BANNER ── */}
      {detail.red_flags?.length > 0 && (
        <div className="bg-red-50 p-5 rounded-3xl border border-red-200 space-y-2">
          <div className="text-xs font-extrabold text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 animate-bounce shrink-0" />
            <span>Alertes Médicales & Signes de Gravité Détectés</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {detail.red_flags.map((flag, idx) => (
              <span key={idx} className="px-3 py-1.5 rounded-xl bg-white border border-red-200 text-red-800 text-xs font-bold shadow-sm">
                🚨 {flag}
              </span>
            ))}
          </div>
        </div>
      )}


      {/* ── 3. MAIN CARDS STACK ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Transcript & AI Summary */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Transcript Box */}
          <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-50 pb-3">
              <div className="text-xs font-extrabold text-[#0F1F17] font-display flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#059669]" />
                <span>Transcript de l'Anamnèse Vocale / Texte</span>
              </div>
              <span className="text-[10px] font-bold text-gray-400">
                {(detail.transcript || []).length} message(s)
              </span>
            </div>

            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {(detail.transcript || []).map((msg, i) => (
                <ChatBubble key={i} message={msg} />
              ))}
            </div>
          </div>

          {/* AI Compte Rendu */}
          <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
            <div className="text-xs font-extrabold text-[#0F1F17] font-display flex items-center gap-2 border-b border-emerald-50 pb-3">
              <FileText className="w-4 h-4 text-[#059669]" />
              <span>Synthèse du Compte-Rendu IA (Gemma 4)</span>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed font-medium">
              {detail.compte_rendu || 'Aucun compte-rendu disponible.'}
            </p>
          </div>

        </div>

        {/* Right Column: Ordonnance & Doctor Validation */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Ordonnance Card */}
          <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
            <div className="text-xs font-extrabold text-[#0F1F17] font-display flex items-center gap-2 border-b border-emerald-50 pb-3">
              <Stethoscope className="w-4 h-4 text-[#059669]" />
              <span>Ordonnance Médicale Proposée</span>
            </div>
            <PrescriptionForm ordonnance={detail.ordonnance} readonly={false} />
          </div>

          {/* Doctor Notes & Action Box */}
          <div className="bg-[#0F1F17] text-white p-6 rounded-3xl border border-emerald-800/40 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-extrabold font-display text-white">
                Décision Médicale du Référent CHR
              </h3>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Ajoutez vos instructions ou motifs avant signature électronique
              </p>
            </div>

            <textarea 
              className="w-full h-24 p-3 bg-white/10 border border-emerald-500/30 rounded-2xl text-xs text-white placeholder-emerald-200/40 outline-none focus:border-[#4ADE80] transition-all resize-none" 
              placeholder="Remarques médicales, posologies complémentaires ou motifs de modification..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />

            <div className="flex flex-col gap-2 pt-1">
              <button 
                onClick={() => handleAction('validated')}
                disabled={actionLoading}
                className="w-full py-3 rounded-xl bg-[#4ADE80] hover:bg-[#34D399] text-[#0F1F17] font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Valider & Signer Officiellement</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleAction('modified')}
                  disabled={actionLoading}
                  className="py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Demander Modif.</span>
                </button>

                <button 
                  onClick={() => handleAction('rejected')}
                  disabled={actionLoading}
                  className="py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Rejeter Dossier</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}
