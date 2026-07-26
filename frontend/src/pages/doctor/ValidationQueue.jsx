import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ShieldCheck, AlertTriangle, Clock, CheckCircle2, Search, Filter, ChevronRight, Stethoscope
} from 'lucide-react'
import api from '../../services/api'
import UrgencyBadge from '../../components/UrgencyBadge'

export default function ValidationQueue() {
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterUrgency, setFilterUrgency] = useState('all')

  const defaultMockQueue = [
    { id: 101, urgency_level: 'red', red_flags: ['Hypertension 16/10', 'Céphalées sévères Darija'], date: new Date().toISOString(), transcript_length: 6, status: 'en_attente' },
    { id: 102, urgency_level: 'orange', red_flags: ['Anémie Hb 9g/dL'], date: new Date().toISOString(), transcript_length: 4, status: 'en_attente' },
    { id: 103, urgency_level: 'green', red_flags: [], date: new Date().toISOString(), transcript_length: 3, status: 'en_attente' },
  ]

  useEffect(() => {
    api.get('/validation/queue')
      .then(res => {
        if (res.data && res.data.length > 0) setQueue(res.data)
        else setQueue(defaultMockQueue)
      })
      .catch(() => setQueue(defaultMockQueue))
      .finally(() => setLoading(false))
  }, [])

  const filteredQueue = queue.filter(q => {
    const matchesSearch = q.id.toString().includes(searchTerm)
    const matchesFilter = filterUrgency === 'all' || q.urgency_level === filterUrgency
    return matchesSearch && matchesFilter
  })

  const redCount = queue.filter(q => q.urgency_level === 'red' || q.urgency_level === 'rouge').length
  const orangeCount = queue.filter(q => q.urgency_level === 'orange').length
  const greenCount = queue.filter(q => q.urgency_level === 'green' || q.urgency_level === 'vert').length

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-[#FAFDFB] min-h-screen">
      
      {/* ── 1. HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#059669] uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-ping" />
            Espace Médecin Référent CHR · Validation des consultations
          </div>
          <h1 className="text-2xl font-extrabold text-[#0F1F17] font-display">
            File d'Attente de Validation Médicale
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Vérifiez et validez les comptes-rendus CPN et ordonnances générés par l'IA Gemma 4
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-[#ECFDF5] border border-[#34D399]/30 rounded-2xl text-xs font-extrabold text-[#059669]">
          <ShieldCheck className="w-4 h-4 text-[#059669]" />
          <span>{queue.length} consultation(s) en attente</span>
        </div>
      </div>


      {/* ── 2. STATS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Total En Attente */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-950/[0.02] flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-1">Total En Attente</div>
            <div className="text-3xl font-extrabold text-[#0F1F17] font-display">{queue.length}</div>
            <div className="text-[11px] text-[#059669] font-medium mt-1">Nécessite avis médical</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Urgences CHR */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-[#0F1F17] text-white p-6 rounded-3xl border border-emerald-800/40 shadow-xl flex items-center justify-between relative overflow-hidden"
        >
          <div>
            <div className="text-xs font-semibold text-emerald-300 mb-1">Avis CHR Urgents (Rouge)</div>
            <div className="text-3xl font-extrabold text-[#4ADE80] font-display">{redCount}</div>
            <div className="text-[11px] text-red-300 font-bold mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Priorité Haute Transfert</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#4ADE80]/20 text-[#4ADE80] flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
        </motion.div>

        {/* Physiologiques */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-950/[0.02] flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-1">Physiologiques & Modérés</div>
            <div className="text-3xl font-extrabold text-[#059669] font-display">{greenCount + orangeCount}</div>
            <div className="text-[11px] text-gray-400 font-medium mt-1">Validation rapide</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </motion.div>

      </div>


      {/* ── 3. TABLE & FILTERS ── */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden space-y-4">
        
        {/* Table Controls */}
        <div className="p-6 border-b border-emerald-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-[#0F1F17] font-display">
              Liste des Demandes de Validation
            </h2>
            <p className="text-xs text-gray-500">Examinez le transcript audio Darija et validez l'ordonnance</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="N° Consultation..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#10B981] w-48"
              />
            </div>

            <select 
              value={filterUrgency}
              onChange={e => setFilterUrgency(e.target.value)}
              className="py-2 px-3 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white focus:border-[#10B981] outline-none"
            >
              <option value="all">Toutes urgences</option>
              <option value="red">Alerte CHR (Rouge)</option>
              <option value="orange">Suivi Rapproché (Orange)</option>
              <option value="green">Physiologique (Vert)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-400">Chargement de la file de validation...</div>
          ) : filteredQueue.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400">Aucune consultation à valider.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAFDFB] border-b border-emerald-50 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Consultation</th>
                  <th className="py-3.5 px-6">Niveau d'Urgence CPN</th>
                  <th className="py-3.5 px-6">Signes de Gravité (Red Flags)</th>
                  <th className="py-3.5 px-6">Échanges Vocaux</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-right">Action Médicale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50 font-medium">
                {filteredQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-emerald-50/40 transition-colors">
                    <td className="py-4 px-6 font-extrabold text-[#0F1F17]">#{item.id}</td>
                    <td className="py-4 px-6">
                      <UrgencyBadge level={item.urgency_level} />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {(item.red_flags || []).length === 0 ? (
                          <span className="text-[10px] text-gray-400 italic">Aucun red flag</span>
                        ) : (
                          item.red_flags.map((flag, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-red-50 text-red-700 text-[10px] font-bold border border-red-200">
                              {flag}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-semibold">{item.transcript_length || 4} message(s)</td>
                    <td className="py-4 px-6 text-gray-400">
                      {new Date(item.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link 
                        to={`/doctor/review/${item.id}`}
                        className="px-4 py-2 rounded-xl bg-[#0F1F17] hover:bg-[#1A3A28] text-[#4ADE80] font-extrabold text-xs inline-flex items-center gap-1 shadow-sm transition-all"
                      >
                        <span>Examiner & Valider</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

    </div>
  )
}
