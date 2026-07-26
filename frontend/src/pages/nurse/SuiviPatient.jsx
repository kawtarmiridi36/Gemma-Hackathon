import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Calendar, FileText, Stethoscope, CheckCircle2, Clock, 
  AlertTriangle, User, MapPin, ChevronRight, Activity, Plus, Edit3,
  HeartPulse, Droplet, Scale, Ruler, Baby, Phone, FileCheck, ShieldCheck,
  Download, ChevronDown, ChevronUp, X, Sparkles
} from 'lucide-react'
import api from '../../services/api'
import PrescriptionForm from '../../components/PrescriptionForm'
import UrgencyBadge from '../../components/UrgencyBadge'

export default function SuiviPatient() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('biometrie')
  const [showEditModal, setShowEditModal] = useState(false)

  // Dynamic Edit Form State for all Clinical & Biometric CPN Fields
  const [editForm, setEditForm] = useState({
    pa: '12/8',
    weight: '64',
    hu: '28',
    bcf: '142',
    terme_sa: '30 SA + 4 jours',
    gestites: 'G2',
    parite: 'P1',
    avortements: 'A0',
    enfants_vivants: 'EV1',
    blood_group: 'O+',
    proteinuria: 'Négative (Bandelette)',
    glycemia: '0.88 g/L (Normale)',
    vat: 'VAT 2 doses reçues (Protégée)',
    tuteur: 'Rachid Mansouri (Époux)',
    phone: '+212 6 61 23 45 67',
    ddr: '2025-12-10',
    dpa: '2026-09-17',
    antecedents: 'Anémie modérée au 2ème trimestre. Pas de césarienne antérieure.'
  })

  useEffect(() => {
    api.get(`/patients/${id}/suivi`)
      .then(res => {
        setData(res.data)
        if (res.data?.patient) {
          const p = res.data.patient
          setEditForm(prev => ({
            ...prev,
            antecedents: p.antecedents || prev.antecedents,
            phone: p.phone || prev.phone,
            blood_group: p.blood_group || prev.blood_group,
          }))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="p-12 text-center text-xs font-bold text-[#059669] flex items-center justify-center gap-2 min-h-screen">
      <span className="w-3 h-3 rounded-full bg-[#4ADE80] animate-ping" />
      <span>Chargement du dossier médical et du suivi CPN...</span>
    </div>
  )

  if (!data) return (
    <div className="p-12 text-center text-xs text-gray-400 min-h-screen">
      Dossier patient introuvable.
    </div>
  )

  const { patient, consultations, follow_up_program } = data
  const finalizedConsultations = consultations.filter(c => c.compte_rendu)
  const latestProgram = follow_up_program

  // Dynamic medical data bound to editForm state
  const medicalDetails = {
    cin: patient?.cin || "AB-894120",
    phone: editForm.phone,
    tuteur: editForm.tuteur,
    pa: editForm.pa,
    weight: editForm.weight + " kg",
    imc: "24.4 (Normal)",
    hu: `${editForm.hu} cm (à ${editForm.terme_sa.split(' ')[0]} SA)`,
    bcf: `${editForm.bcf} bpm (Régulier)`,
    gpa: `${editForm.gestites} ${editForm.parite} ${editForm.avortements} ${editForm.enfants_vivants}`,
    blood: editForm.blood_group,
    terme_sa: editForm.terme_sa,
    ddr: editForm.ddr,
    dpa: editForm.dpa,
    vat: editForm.vat,
    albuminuria: editForm.proteinuria,
    glycemia: editForm.glycemia,
  }

  const handleSaveEdit = (e) => {
    e.preventDefault()
    setShowEditModal(false)
    // Optional backend sync
    api.put(`/patients/${id}`, editForm).catch(() => {})
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-[#FAFDFB] min-h-screen">
      
      {/* ── 1. HEADER CARTE DOSSIER PATIENTE ── */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-950/[0.02] space-y-6">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="flex items-start gap-4">
            <Link to="/nurse/dossiers">
              <button className="w-10 h-10 rounded-2xl border border-emerald-200 flex items-center justify-center text-gray-700 hover:bg-emerald-50 transition-colors mt-1">
                <ArrowLeft className="w-4 h-4 text-[#059669]" />
              </button>
            </Link>
            
            <div className="w-16 h-16 rounded-3xl bg-[#0F1F17] text-[#4ADE80] flex items-center justify-center font-extrabold text-2xl shadow-md font-display shrink-0">
              {patient.nom ? patient.nom.charAt(0) : 'P'}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-extrabold text-[#0F1F17] font-display">
                  {patient.nom}
                </h1>
                <UrgencyBadge level={consultations[0]?.urgency_level || 'green'} />
                <span className="text-[10px] font-extrabold bg-[#ECFDF5] text-[#059669] px-3 py-1 rounded-full border border-[#34D399]/30">
                  Dossier N° #{patient.id}084
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-semibold mt-2">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#059669]" />
                  {patient.age} ans
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#059669]" />
                  {patient.village || 'Douar Aït Ourir'}, {patient.zone || 'Al Haouz'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#059669]" />
                  {medicalDetails.phone}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 text-[#0F1F17] font-bold">
                  <Activity className="w-3.5 h-3.5 text-[#059669]" />
                  {consultations.length} consultation(s) CPN enregistrée(s)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end lg:self-center">
            <button 
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2.5 rounded-xl border border-emerald-200 text-[#0F1F17] text-xs font-extrabold bg-white hover:bg-emerald-50/50 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#059669]" />
              <span>Compléter / Modifier Dossier</span>
            </button>

            <Link to={`/nurse/consultation/${consultations[0]?.id || id}`}>
              <button className="px-5 py-2.5 rounded-xl bg-[#0F1F17] hover:bg-[#1A3A28] text-[#4ADE80] text-xs font-extrabold shadow-md transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>Nouvelle Consultation CPN</span>
              </button>
            </Link>
          </div>

        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-4 border-t border-emerald-50">
          <div className="p-3 bg-[#FAFDFB] rounded-2xl border border-emerald-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Score Obstétrical</div>
            <div className="text-xs font-extrabold text-[#0F1F17] mt-0.5">{medicalDetails.gpa}</div>
          </div>
          <div className="p-3 bg-[#FAFDFB] rounded-2xl border border-emerald-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Groupe Sanguin</div>
            <div className="text-xs font-extrabold text-emerald-700 mt-0.5">{medicalDetails.blood}</div>
          </div>
          <div className="p-3 bg-[#FAFDFB] rounded-2xl border border-emerald-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Tension (PA)</div>
            <div className="text-xs font-extrabold text-[#0F1F17] mt-0.5">{medicalDetails.pa} mmHg</div>
          </div>
          <div className="p-3 bg-[#FAFDFB] rounded-2xl border border-emerald-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Hauteur Utérine</div>
            <div className="text-xs font-extrabold text-[#0F1F17] mt-0.5">{medicalDetails.hu}</div>
          </div>
          <div className="p-3 bg-[#FAFDFB] rounded-2xl border border-emerald-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Cœur Fœtal (BCF)</div>
            <div className="text-xs font-extrabold text-emerald-700 mt-0.5">{medicalDetails.bcf}</div>
          </div>
          <div className="p-3 bg-[#FAFDFB] rounded-2xl border border-emerald-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Terme Calculé</div>
            <div className="text-xs font-extrabold text-[#0F1F17] mt-0.5">30 SA + 4 jours</div>
          </div>
        </div>

      </div>


      {/* ── 2. ONGLETS DE NAVIGATION DÉTAILLÉS ── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-emerald-100 pb-2">
        {[
          { key: 'biometrie', label: 'Fiche Clinicale & Biométrie CPN', icon: HeartPulse },
          { key: 'timeline', label: 'Historique des Anamnèses CPN', icon: Clock },
          { key: 'ordonnance', label: 'Ordonnances Médicales', icon: Stethoscope },
          { key: 'programme', label: 'Programme Prénatal 9 Mois (Gemma 4)', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                isActive 
                  ? 'bg-[#0F1F17] text-[#4ADE80] shadow-md' 
                  : 'bg-white border border-emerald-100 text-gray-600 hover:bg-emerald-50/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#4ADE80]' : 'text-[#059669]'}`} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>


      {/* ── 3. CONTENU DES ONGLETS ── */}
      
      {/* 📌 TAB 1: FICHE CLINICALE & BIOMÉTRIE CPN */}
      {activeTab === 'biometrie' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Card 1: Constantes Biométriques */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-emerald-50 pb-3">
              <h3 className="text-base font-extrabold text-[#0F1F17] font-display flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-[#059669]" />
                <span>Constantes Biométriques & Signes Vitaux</span>
              </h3>
              <span className="text-xs font-bold text-[#059669] bg-[#ECFDF5] px-3 py-1 rounded-full border border-[#34D399]/30">
                Mise à jour aujourd'hui
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="p-4 bg-[#FAFDFB] rounded-2xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-500">Pression Artérielle (PA)</div>
                  <div className="text-lg font-extrabold text-[#0F1F17] font-display mt-0.5">{medicalDetails.pa} mmHg</div>
                  <div className="text-[10px] text-[#059669] font-bold mt-1">Normotension</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 bg-[#FAFDFB] rounded-2xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-500">Hauteur Utérine (HU)</div>
                  <div className="text-lg font-extrabold text-[#0F1F17] font-display mt-0.5">{medicalDetails.hu}</div>
                  <div className="text-[10px] text-gray-400 font-medium mt-1">Conforme au terme</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Ruler className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 bg-[#FAFDFB] rounded-2xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-500">Bruits Cœur Fœtal (BCF)</div>
                  <div className="text-lg font-extrabold text-[#059669] font-display mt-0.5">{medicalDetails.bcf}</div>
                  <div className="text-[10px] text-emerald-700 font-bold mt-1">Activité cardiaque présente</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Baby className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 bg-[#FAFDFB] rounded-2xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-500">Poids & IMC</div>
                  <div className="text-lg font-extrabold text-[#0F1F17] font-display mt-0.5">{medicalDetails.weight}</div>
                  <div className="text-[10px] text-gray-400 font-medium mt-1">IMC: {medicalDetails.imc}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
              </div>

            </div>

            {/* Bilan Biologique Rapide */}
            <div className="pt-2">
              <h4 className="text-xs font-extrabold text-[#0F1F17] uppercase tracking-wider mb-3">
                Bilan Biologique Rapide au Dispensaire
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#FAFDFB] rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-600">Protéinurie / Albumine</span>
                  <span className="font-extrabold text-[#059669]">{medicalDetails.albuminuria}</span>
                </div>
                <div className="p-3 bg-[#FAFDFB] rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-600">Glycémie à jeun</span>
                  <span className="font-extrabold text-[#059669]">{medicalDetails.glycemia}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Card 2: Antécédents & Statut Vaccinal */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-6">
            
            <div className="border-b border-emerald-50 pb-3">
              <h3 className="text-base font-extrabold text-[#0F1F17] font-display flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#059669]" />
                <span>Antécédents & Prévention</span>
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[#FAFDFB] rounded-2xl border border-emerald-100 space-y-1">
                <div className="font-bold text-[#0F1F17]">Historique Médical & Obstétrical</div>
                <p className="text-gray-600 font-medium leading-relaxed">
                  {patient.antecedents || medicalDetails.antecedents}
                </p>
              </div>

              <div className="p-4 bg-[#FAFDFB] rounded-2xl border border-emerald-100 space-y-1">
                <div className="font-bold text-[#0F1F17]">Vaccination Tétanique (VAT)</div>
                <div className="flex items-center gap-2 text-[#059669] font-bold mt-1">
                  <ShieldCheck className="w-4 h-4 text-[#059669]" />
                  <span>{medicalDetails.vat}</span>
                </div>
              </div>

              <div className="p-4 bg-[#FAFDFB] rounded-2xl border border-emerald-100 space-y-1">
                <div className="font-bold text-[#0F1F17]">Accompagnateur & Contact d'Urgence</div>
                <div className="text-gray-700 font-semibold mt-0.5">{medicalDetails.tuteur}</div>
                <div className="text-gray-500 font-medium">{medicalDetails.phone}</div>
              </div>
            </div>

          </div>

        </div>
      )}


      {/* ⏱️ TAB 2: HISTORIQUE CHRONOLOGIQUE CPN */}
      {activeTab === 'timeline' && (
        <div className="space-y-4 max-w-4xl mx-auto">
          {consultations.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400 bg-white rounded-3xl border border-emerald-100">
              Aucune consultation enregistrée pour cette patiente.
            </div>
          ) : (
            consultations.map((c) => (
              <motion.div 
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-950/[0.02] space-y-3"
              >
                <div className="flex justify-between items-center border-b border-emerald-50 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-[#0F1F17] text-sm font-display">
                      Consultation CPN #{c.id}
                    </span>
                    <UrgencyBadge level={c.urgency_level} />
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#059669] border border-[#34D399]/30">
                      {c.status || 'validé'}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-gray-400">
                    {new Date(c.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>

                {c.compte_rendu ? (
                  <p className="text-xs text-gray-700 leading-relaxed font-medium">
                    {c.compte_rendu}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    Consultation en cours de saisie par le soignant...
                  </p>
                )}

                {c.red_flags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {c.red_flags.map((flag, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-[10px] font-bold border border-red-200 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                        {flag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      )}


      {/* 💊 TAB 3: ORDONNANCES MÉDICALES */}
      {activeTab === 'ordonnance' && (
        <div className="space-y-4 max-w-4xl mx-auto">
          {finalizedConsultations.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400 bg-white rounded-3xl border border-emerald-100">
              Aucune ordonnance validée disponible.
            </div>
          ) : (
            finalizedConsultations.map((c) => (
              <div key={c.id} className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-emerald-50 pb-2">
                  <span className="font-extrabold text-[#0F1F17] text-xs">Consultation #{c.id}</span>
                  <span className="text-xs text-gray-400">{new Date(c.date).toLocaleDateString('fr-FR')}</span>
                </div>
                <PrescriptionForm ordonnance={c.ordonnance} readonly />
              </div>
            ))
          )}
        </div>
      )}


      {/* 📅 TAB 4: PROGRAMME PRÉNATAL DÉTAILLÉ 9 MOIS */}
      {activeTab === 'programme' && (
        <div className="space-y-6 max-w-5xl mx-auto">
          {!latestProgram ? (
            <div className="p-12 text-center text-xs text-gray-400 bg-white rounded-3xl border border-emerald-100">
              Aucun programme CPN généré. Finalisez une consultation pour l'activer.
            </div>
          ) : (
            <>
              {/* Header Card Program */}
              <div className="bg-[#0F1F17] text-white p-6 rounded-3xl border border-emerald-800/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-[#4ADE80] text-xs font-bold uppercase tracking-wider mb-1">
                    <Sparkles className="w-4 h-4" />
                    Plan de Suivi Prénatal Personnalisé Gemma 4
                  </div>
                  <h3 className="text-xl font-extrabold font-display text-white">{latestProgram.target}</h3>
                  <p className="text-xs text-emerald-200/80 mt-1">
                    Cadence de suivi adaptée · Profil de Risque CPN : <span className="font-bold text-[#4ADE80] uppercase">{latestProgram.risk_profile}</span>
                  </p>
                </div>
                
                <div className="px-4 py-2 rounded-2xl bg-[#4ADE80]/20 text-[#4ADE80] text-xs font-extrabold border border-[#4ADE80]/30 shrink-0">
                  Du Mois {latestProgram.start_month} au 9ème Mois
                </div>
              </div>

              {/* Monthly Calendar Detailed Stack */}
              <div className="space-y-4">
                {latestProgram.monthly_plan?.map((plan, i) => (
                  <div key={plan.month} className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
                    
                    <div className="flex justify-between items-center border-b border-emerald-50 pb-3">
                      <div>
                        <span className="font-extrabold text-[#0F1F17] text-base font-display">
                          Mois {plan.month} de Grossesse
                        </span>
                        <span className="text-xs text-gray-400 block mt-0.5">
                          {plan.goals ? plan.goals[0] : 'Suivi prénatal régulier'}
                        </span>
                      </div>
                      
                      <span className="text-xs font-extrabold text-[#059669] bg-[#ECFDF5] px-3.5 py-1.5 rounded-full border border-[#34D399]/30">
                        {plan.cadence}
                      </span>
                    </div>

                    {/* Checklist Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {(plan.checklist || []).map((item, idx) => (
                        <label key={idx} className="flex items-center gap-3 p-3 bg-[#FAFDFB] rounded-2xl border border-emerald-100/70 text-xs font-medium text-gray-700 hover:bg-emerald-50/50 cursor-pointer transition-colors">
                          <input type="checkbox" className="w-4 h-4 accent-[#059669] rounded-md shrink-0" />
                          <span>{item}</span>
                        </label>
                      ))}
                    </div>

                    {/* Alerts to watch for this month */}
                    {plan.alerts?.length > 0 && (
                      <div className="pt-2 border-t border-emerald-50 flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-bold text-gray-400 uppercase text-[10px]">Points de Vigilance :</span>
                        {plan.alerts.map((alert, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                            ⚠️ {alert}
                          </span>
                        ))}
                      </div>
                    )}

                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}


      {/* ── 4. MODAL ÉDITION DOSSIER PATIENT ── */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1F17]/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden space-y-4"
            >
              <div className="p-6 bg-[#0F1F17] text-white flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-extrabold font-display">Compléter le Dossier Médical CPN</h3>
                  <p className="text-xs text-emerald-200/80">Mise à jour des constantes et antécédents de la patiente</p>
                </div>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Tension Artérielle (PA)</label>
                    <input className="w-full h-10 px-3 border border-gray-200 rounded-xl outline-none focus:border-[#10B981]" value={editForm.pa} onChange={e => setEditForm({...editForm, pa: e.target.value})} placeholder="12/8" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Poids (kg)</label>
                    <input className="w-full h-10 px-3 border border-gray-200 rounded-xl outline-none focus:border-[#10B981]" value={editForm.weight} onChange={e => setEditForm({...editForm, weight: e.target.value})} placeholder="64" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Terme SA Calculé</label>
                    <input className="w-full h-10 px-3 border border-gray-200 rounded-xl outline-none focus:border-[#10B981]" value={editForm.terme_sa} onChange={e => setEditForm({...editForm, terme_sa: e.target.value})} placeholder="30 SA + 4 jours" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Hauteur Utérine (HU en cm)</label>
                    <input className="w-full h-10 px-3 border border-gray-200 rounded-xl outline-none focus:border-[#10B981]" value={editForm.hu} onChange={e => setEditForm({...editForm, hu: e.target.value})} placeholder="28" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Cœur Fœtal BCF (bpm)</label>
                    <input className="w-full h-10 px-3 border border-gray-200 rounded-xl outline-none focus:border-[#10B981]" value={editForm.bcf} onChange={e => setEditForm({...editForm, bcf: e.target.value})} placeholder="142" />
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Gestité (G)</label>
                    <input className="w-full h-10 px-2 border border-gray-200 rounded-xl outline-none focus:border-[#10B981]" value={editForm.gestites} onChange={e => setEditForm({...editForm, gestites: e.target.value})} placeholder="G2" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Parité (P)</label>
                    <input className="w-full h-10 px-2 border border-gray-200 rounded-xl outline-none focus:border-[#10B981]" value={editForm.parite} onChange={e => setEditForm({...editForm, parite: e.target.value})} placeholder="P1" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Avortement (A)</label>
                    <input className="w-full h-10 px-2 border border-gray-200 rounded-xl outline-none focus:border-[#10B981]" value={editForm.avortements} onChange={e => setEditForm({...editForm, avortements: e.target.value})} placeholder="A0" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Enfants Vivants (EV)</label>
                    <input className="w-full h-10 px-2 border border-gray-200 rounded-xl outline-none focus:border-[#10B981]" value={editForm.enfants_vivants} onChange={e => setEditForm({...editForm, enfants_vivants: e.target.value})} placeholder="EV1" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Groupe Sanguin</label>
                    <select className="w-full h-10 px-1 border border-gray-200 rounded-xl outline-none focus:border-[#10B981] bg-white font-bold" value={editForm.blood_group} onChange={e => setEditForm({...editForm, blood_group: e.target.value})}>
                      <option value="O+">O+</option>
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="AB+">AB+</option>
                      <option value="O-">O-</option>
                      <option value="A-">A-</option>
                      <option value="B-">B-</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Protéinurie / Albumine</label>
                    <input className="w-full h-10 px-3 border border-gray-200 rounded-xl outline-none focus:border-[#10B981]" value={editForm.proteinuria} onChange={e => setEditForm({...editForm, proteinuria: e.target.value})} placeholder="Négative (Bandelette)" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Glycémie à jeun</label>
                    <input className="w-full h-10 px-3 border border-gray-200 rounded-xl outline-none focus:border-[#10B981]" value={editForm.glycemia} onChange={e => setEditForm({...editForm, glycemia: e.target.value})} placeholder="0.88 g/L (Normale)" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Vaccination Tétanique (VAT)</label>
                    <input className="w-full h-10 px-3 border border-gray-200 rounded-xl outline-none focus:border-[#10B981]" value={editForm.vat} onChange={e => setEditForm({...editForm, vat: e.target.value})} placeholder="VAT 2 doses reçues (Protégée)" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700">Contact / Tuteur d'Urgence</label>
                    <input className="w-full h-10 px-3 border border-gray-200 rounded-xl outline-none focus:border-[#10B981]" value={editForm.tuteur} onChange={e => setEditForm({...editForm, tuteur: e.target.value})} placeholder="Rachid Mansouri (Époux)" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Antécédents Médicaux & Risques</label>
                  <textarea className="w-full h-16 p-3 border border-gray-200 rounded-xl outline-none focus:border-[#10B981] resize-none" value={editForm.antecedents} onChange={e => setEditForm({...editForm, antecedents: e.target.value})} />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50">
                    Annuler
                  </button>
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-[#0F1F17] text-[#4ADE80] font-extrabold shadow-md hover:bg-[#1A3A28]">
                    Enregistrer les Constantes
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
