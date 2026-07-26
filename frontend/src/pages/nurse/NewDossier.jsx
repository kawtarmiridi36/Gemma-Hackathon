import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent } from '@heroui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, MapPin, Stethoscope, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import api from '../../services/api'

export default function NewDossier() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ nom: '', age: '', sexe: 'F', zone: '', village: '', antecedents: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleNext = () => setStep((s) => Math.min(s + 1, 3))
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (step < 3) {
      handleNext()
      return
    }
    setLoading(true)
    setError('')
    try {
      const patientRes = await api.post('/patients', { ...form, age: parseInt(form.age) })
      const patientDetail = await api.get(`/patients/${patientRes.data.id}`)
      const dossierId = patientDetail.data.dossier?.id
      if (!dossierId) throw new Error('Dossier non trouvé')
      const dossierRes = await api.post('/consultations', { dossier_id: dossierId })
      navigate(`/nurse/consultation/${dossierRes.data.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de la création du dossier')
    } finally {
      setLoading(false)
    }
  }

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  const variants = {
    enter: (direction) => ({ x: direction > 0 ? 30 : -30, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction) => ({ zIndex: 0, x: direction < 0 ? 30 : -30, opacity: 0 }),
  }

  const isNextDisabled = () => {
    if (step === 1) return !form.nom || !form.age
    if (step === 2) return !form.zone || !form.village
    return false
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-[#FAFDFB] min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#059669] uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-ping" />
            Espace Infirmier · Nouveau Dossier Prénatal
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F1F17] font-display">
            Enregistrement d'une Patiente
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Création du dossier médical pour le suivi CPN et dépistage IA Darija
          </p>
        </div>
        
        <Link to="/nurse/dossiers">
          <button className="px-4 py-2.5 rounded-xl border border-emerald-200 text-[#0F1F17] text-xs font-bold bg-white hover:bg-emerald-50/50 transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4 text-[#059669]" />
            <span>Retour aux dossiers</span>
          </button>
        </Link>
      </div>

      {/* Progress Steps Card */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-950/[0.02]">
        
        <div className="flex justify-between items-center max-w-xl mx-auto mb-8 px-4 relative">
          {/* Background Bar */}
          <div className="absolute top-1/2 left-8 right-8 h-1 bg-emerald-50 -z-0 -translate-y-1/2 rounded-full" />
          <div 
            className="absolute top-1/2 left-8 h-1 bg-[#4ADE80] -z-0 -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out shadow-sm" 
            style={{ width: `${((step - 1) / 2) * 85}%` }} 
          />
          
          {[
            { num: 1, label: 'Identité', icon: User },
            { num: 2, label: 'Localisation', icon: MapPin },
            { num: 3, label: 'Antécédents', icon: Stethoscope },
          ].map((item) => {
            const Icon = item.icon
            const isDone = step > item.num
            const isCurrent = step === item.num

            return (
              <div key={item.num} className="flex flex-col items-center gap-2 relative z-10">
                <div 
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-extrabold transition-all duration-300 ${
                    isCurrent
                      ? 'bg-[#0F1F17] text-[#4ADE80] ring-4 ring-[#ECFDF5] shadow-md'
                      : isDone
                      ? 'bg-[#4ADE80] text-[#0F1F17] shadow-sm'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-[11px] font-bold ${isCurrent ? 'text-[#0F1F17]' : 'text-gray-400'}`}>
                  {item.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
          <div className="min-h-[260px] relative">
            <AnimatePresence mode="wait" custom={1}>
              
              {/* STEP 1 */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={1}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-4"
                >
                  <div className="border-b border-emerald-50 pb-3 mb-4">
                    <h2 className="text-base font-extrabold text-[#0F1F17] font-display">
                      Informations Personnelles de la Patiente
                    </h2>
                    <p className="text-xs text-gray-500">Saisissez l'identité principale pour l'ouverture du dossier.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Nom complet de la patiente *</label>
                    <input 
                      className="w-full h-11 px-3.5 border border-gray-200 rounded-xl text-xs font-medium focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all outline-none bg-white" 
                      placeholder="Ex: Fatima Zohra Mansouri" 
                      value={form.nom} 
                      onChange={set('nom')} 
                      required 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Âge (Ans) *</label>
                      <input 
                        className="w-full h-11 px-3.5 border border-gray-200 rounded-xl text-xs font-medium focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all outline-none bg-white" 
                        type="number" 
                        value={form.age} 
                        onChange={set('age')} 
                        required 
                        placeholder="Ex: 26" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700">Sexe</label>
                      <select 
                        className="w-full h-11 px-3.5 border border-gray-200 rounded-xl text-xs font-semibold focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all outline-none bg-white" 
                        value={form.sexe} 
                        onChange={set('sexe')}
                      >
                        <option value="F">Féminin (Suivi Maternité)</option>
                        <option value="M">Masculin</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={1}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-4"
                >
                  <div className="border-b border-emerald-50 pb-3 mb-4">
                    <h2 className="text-base font-extrabold text-[#0F1F17] font-display">
                      Localisation Rurale & Douar
                    </h2>
                    <p className="text-xs text-gray-500">Permet le suivi géographique et la cartographie des risques.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Zone / Commune Rurale *</label>
                    <input 
                      className="w-full h-11 px-3.5 border border-gray-200 rounded-xl text-xs font-medium focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all outline-none bg-white" 
                      placeholder="Ex: Al Haouz / Asni" 
                      value={form.zone} 
                      onChange={set('zone')} 
                      required 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Village / Douar d'Origine *</label>
                    <input 
                      className="w-full h-11 px-3.5 border border-gray-200 rounded-xl text-xs font-medium focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all outline-none bg-white" 
                      placeholder="Ex: Douar Aït Ourir" 
                      value={form.village} 
                      onChange={set('village')} 
                      required 
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={1}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="space-y-4"
                >
                  <div className="border-b border-emerald-50 pb-3 mb-4">
                    <h2 className="text-base font-extrabold text-[#0F1F17] font-display">
                      Antécédents Médicaux & Risques CPN
                    </h2>
                    <p className="text-xs text-gray-500">Mentionnez l'historique obstétrical, pathologies chroniques ou pré-éclampsie antérieure.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Antécédents Médicaux / Obstétricaux</label>
                    <textarea 
                      className="w-full h-32 p-3.5 border border-gray-200 rounded-xl text-xs font-medium focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all outline-none bg-white resize-none" 
                      placeholder="Ex: 2ème grossesse, antécédent d'anémie modérée, pas de diabète connu..." 
                      value={form.antecedents} 
                      onChange={set('antecedents')} 
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-8 pt-4 border-t border-emerald-100">
            <button 
              type="button" 
              onClick={step === 1 ? () => navigate('/nurse/dossiers') : handlePrev}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{step === 1 ? 'Annuler' : 'Étape précédente'}</span>
            </button>
            
            <button 
              type="submit" 
              disabled={isNextDisabled() || loading}
              className="px-6 py-2.5 rounded-xl bg-[#0F1F17] hover:bg-[#1A3A28] text-[#4ADE80] text-xs font-extrabold shadow-md transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span>Création en cours...</span>
              ) : step === 3 ? (
                <>
                  <span>Créer le Dossier & Démarrer CPN</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Suivant</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  )
}
