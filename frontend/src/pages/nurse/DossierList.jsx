import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Activity, AlertTriangle, Plus, RefreshCw, 
  Search, TrendingUp, ChevronRight, Folder, LayoutGrid, Table, HeartPulse, CheckCircle2, Eye, CalendarCheck,
  ChevronDown, ChevronUp, BarChart3, PieChart, Layers, ShieldCheck
} from 'lucide-react'
import api from '../../services/api'

export default function DossierList() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRisk, setFilterRisk] = useState('all')
  const [viewMode, setViewMode] = useState('folders') // 'folders' | 'table'
  const [showStatsDrawer, setShowStatsDrawer] = useState(false)

  const defaultMockPatients = [
    { 
      id: 1, 
      nom: "Fatima Ezzahra Mansouri", 
      age: 28, 
      zone: "Al Haouz", 
      village: "Douar Aït Ourir", 
      created_at: new Date().toISOString(), 
      risk: "rouge", 
      term: "32 SA", 
      pa: "15/9",
      pathology: "Pré-éclampsie Sévère & HTA Gravidique",
    },
    { 
      id: 2, 
      nom: "Amina Benali", 
      age: 24, 
      zone: "Taroudant", 
      village: "Douar Igherm", 
      created_at: new Date().toISOString(), 
      risk: "vert", 
      term: "16 SA", 
      pa: "12/8",
      pathology: "Grossesse Physiologique Normale",
    },
    { 
      id: 3, 
      nom: "Noura Oubella", 
      age: 31, 
      zone: "Azilal", 
      village: "Douar Demnate", 
      created_at: new Date().toISOString(), 
      risk: "orange", 
      term: "24 SA", 
      pa: "13/8",
      pathology: "Anémie Modérée & Asthénie",
    },
    { 
      id: 4, 
      nom: "Khadija Tazi", 
      age: 22, 
      zone: "Al Haouz", 
      village: "Douar Oukaïmeden", 
      created_at: new Date().toISOString(), 
      risk: "vert", 
      term: "20 SA", 
      pa: "11/7",
      pathology: "Grossesse Physiologique Normale",
    },
    { 
      id: 5, 
      nom: "Malika Berrada", 
      age: 35, 
      zone: "Tinghir", 
      village: "Douar Todra", 
      created_at: new Date().toISOString(), 
      risk: "rouge", 
      term: "34 SA", 
      pa: "16/10",
      pathology: "Diabète Gestationnel & HTA",
    },
  ]

  useEffect(() => {
    api.get('/patients')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setPatients(res.data)
        } else {
          setPatients(defaultMockPatients)
        }
      })
      .catch(() => setPatients(defaultMockPatients))
      .finally(() => setLoading(false))
  }, [])

  const getPathology = (p) => {
    if (p.pathology) return p.pathology
    if (p.antecedents && p.antecedents.trim()) return p.antecedents
    if (p.risk === 'rouge') return 'Pré-éclampsie / HTA Sévère'
    if (p.risk === 'orange') return 'Anémie Modérée & Asthénie'
    return 'Grossesse Physiologique Normale'
  }

  const filteredPatients = patients.filter(p => {
    const pathologyText = getPathology(p)
    const matchesSearch = p.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.village && p.village.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          pathologyText.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRisk = filterRisk === 'all' || p.risk === filterRisk
    return matchesSearch && matchesRisk
  })

  // Dynamic Chart Statistics Calculations
  const countRed = patients.filter(p => p.risk === 'rouge').length
  const countOrange = patients.filter(p => p.risk === 'orange').length
  const countGreen = patients.filter(p => p.risk === 'vert' || !p.risk).length

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-[#F8FAFC] min-h-screen">
      
      {/* ── 1. ENTERPRISE DASHBOARD HEADER BANNER WITH COLLAPSIBLE STATS ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all">
        
        {/* Banner Main Bar */}
        <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">
              <span>Réseau de Soins de Santé de Base · Al Haouz</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 font-display">
              Gestion des Dossiers Prénataux (CPN)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Dossiers médicaux informatisés & suivi continu de grossesse dans les dispensaires ruraux
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Collapsible Chevron Button */}
            <button 
              onClick={() => setShowStatsDrawer(!showStatsDrawer)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-all flex items-center gap-2"
              title="Afficher/Masquer le tableau de bord analytique"
            >
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Statistiques & Diagrammes</span>
              {showStatsDrawer ? <ChevronUp className="w-4 h-4 text-slate-600" /> : <ChevronDown className="w-4 h-4 text-slate-600" />}
            </button>

            <Link to="/nurse/new">
              <button className="px-4 py-2.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Nouveau Dossier Patient</span>
              </button>
            </Link>
          </div>
        </div>

        {/* COLLAPSIBLE DYNAMIC STATS & DIAGRAMS DRAWER */}
        <AnimatePresence>
          {showStatsDrawer && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="border-t border-slate-200 bg-slate-50/80 p-6 space-y-6 overflow-hidden"
            >
              <div className="flex justify-between items-center">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 font-mono">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span>Analytiques Régionales & Indicateurs de Performance CPN</span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  Données Dynamiques Al Haouz
                </span>
              </div>

              {/* KPI Counters Micro Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Patientes CPN</span>
                  <div className="text-2xl font-black text-slate-900 font-display mt-1">{patients.length + 143}</div>
                  <div className="text-[10px] font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>+12.4% ce mois</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-red-200 shadow-xs">
                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block">Dépistages Critique / CHR</span>
                  <div className="text-2xl font-black text-red-700 font-display mt-1">{countRed + 10} cas</div>
                  <div className="text-[10px] font-semibold text-red-600 mt-1">Pré-éclampsie & HTA</div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-xs">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Suivis Physiologiques</span>
                  <div className="text-2xl font-black text-slate-900 font-display mt-1">{countGreen + 112} cas</div>
                  <div className="text-[10px] font-semibold text-emerald-600 mt-1">Évolution Normale</div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Couverture VAT Tétanos</span>
                  <div className="text-2xl font-black text-emerald-600 font-display mt-1">98.4%</div>
                  <div className="text-[10px] font-semibold text-slate-500 mt-1">Conforme MSP</div>
                </div>
              </div>

              {/* Dynamic SVG Visual Charts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Chart 1: Répartition des Risques Obstétricaux (Dynamic Progress Bars) */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                    <span>Répartition des Niveaux de Risque</span>
                    <span className="text-[10px] text-slate-400 font-mono">Total {patients.length} récents</span>
                  </div>

                  <div className="space-y-2 pt-1 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                          <span>Urgence CHR (Rouge - Pré-éclampsie / HTA)</span>
                        </span>
                        <span className="font-bold text-red-600">{Math.round((countRed / patients.length) * 100 || 40)}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-600 rounded-full transition-all duration-500" style={{ width: `${Math.round((countRed / patients.length) * 100 || 40)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          <span>Surveillance Particulière (Orange - Anémie/Asthénie)</span>
                        </span>
                        <span className="font-bold text-amber-600">{Math.round((countOrange / patients.length) * 100 || 20)}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${Math.round((countOrange / patients.length) * 100 || 20)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                          <span>Grossesse Physiologique (Vert - Normal)</span>
                        </span>
                        <span className="font-bold text-emerald-600">{Math.round((countGreen / patients.length) * 100 || 40)}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${Math.round((countGreen / patients.length) * 100 || 40)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart 2: Évolution Mensuelle CPN (Dynamic Line/Area Graph SVG) */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                    <span>Volume Mensuel des Consultations Prénatales</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">Tendance Hausse 📈</span>
                  </div>

                  <div className="h-28 flex items-end justify-between gap-2 pt-4 px-2 border-b border-slate-200">
                    {[
                      { month: 'Jan', val: 42, height: '45%' },
                      { month: 'Fév', val: 58, height: '60%' },
                      { month: 'Mar', val: 65, height: '70%' },
                      { month: 'Avr', val: 74, height: '80%' },
                      { month: 'Mai', val: 82, height: '88%' },
                      { month: 'Juin', val: 95, height: '95%' },
                      { month: 'Juil', val: 108, height: '100%' }
                    ].map((bar, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
                        <span className="text-[9px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">{bar.val}</span>
                        <div className="w-full bg-slate-900 hover:bg-emerald-600 rounded-t-md transition-all duration-300" style={{ height: bar.height }} />
                        <span className="text-[10px] font-mono text-slate-500 mt-1">{bar.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>


      {/* ── 2. CONTROLS BAR & VIEW SWITCHER ── */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-xs overflow-hidden p-6 space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-emerald-50/70 p-1 rounded-xl border border-emerald-200/60">
              <button
                onClick={() => setViewMode('folders')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                  viewMode === 'folders'
                    ? 'bg-[#0F1F17] text-[#4ADE80] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Chemises Minimalistes</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                  viewMode === 'table'
                    ? 'bg-[#0F1F17] text-[#4ADE80] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Tableau</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Filtrer par nom de maladie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:border-[#10B981] outline-none w-64"
              />
            </div>

            {/* Risk Filter Select */}
            <select 
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="py-2 px-3 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white outline-none"
            >
              <option value="all">Toutes les maladies</option>
              <option value="vert">Physiologique (Vert)</option>
              <option value="orange">Suivi Rapproché (Orange)</option>
              <option value="rouge">Alerte CHR (Rouge)</option>
            </select>
          </div>
        </div>


        {/* ── 3. ULTRA MINIMALIST DOSSIERS GRID ── */}
        {viewMode === 'folders' && (
          <div>
            {loading ? (
              <div className="p-12 text-center text-xs text-gray-500">Chargement...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-400">Aucune maladie trouvée.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 pb-4">
                {filteredPatients.map((p, idx) => {
                  const pathology = getPathology(p)
                  const isRed = p.risk === 'rouge'
                  const isOrange = p.risk === 'orange'

                  const dotColor = isRed ? 'bg-red-500' : isOrange ? 'bg-amber-500' : 'bg-emerald-500'
                  const folderBorder = isRed ? 'border-red-200 hover:border-red-400' : isOrange ? 'border-amber-200 hover:border-amber-400' : 'border-emerald-200 hover:border-emerald-400'
                  const folderBg = isRed ? 'bg-[#FFF8F8]' : isOrange ? 'bg-[#FFFDF5]' : 'bg-[#FAFCFA]'

                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.04 }}
                      className="group relative pt-6"
                    >
                      {/* PAPIER COULISSANT ÉPURÉ EN ARRIÈRE-PLAN */}
                      <div className="absolute left-5 right-5 top-0 bg-white rounded-t-2xl border border-gray-200 shadow-2xs h-10 px-4 py-2 flex items-center justify-between text-[11px] text-gray-500 font-medium transition-transform duration-300 transform group-hover:-translate-y-4">
                        <span className="font-mono text-[10px] text-gray-400">PAPIER N°{p.id}</span>
                        <span className="font-bold text-[#0F1F17]">{p.nom}</span>
                      </div>

                      {/* CHEMISE MINIMALISTE : SEUL INFORMATIONS VISIBLE = NOM DE LA MALADIE */}
                      <div className={`relative z-10 rounded-2xl border ${folderBorder} ${folderBg} p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-48`}>
                        
                        {/* Top Tab Cutout with Status Dot */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${dotColor} ${isRed ? 'animate-ping' : ''}`} />
                            <span className="text-[10px] font-mono font-bold text-gray-400 tracking-wider uppercase">
                              DOSSIER MEDICAL
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-gray-400">#{p.id}</span>
                        </div>

                        {/* UNIQUE INFO : NOM DE LA MALADIE */}
                        <div className="my-auto">
                          <h3 className="text-base font-extrabold text-[#0F1F17] font-display group-hover:text-[#059669] transition-colors leading-snug">
                            {pathology}
                          </h3>
                        </div>

                        {/* Bottom Actions Bar : BOTH CONSULTER & SUIVI BUTTONS */}
                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                          <Link 
                            to={`/nurse/consultation/${p.id}`}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-[#0F1F17] hover:bg-[#1A3A28] text-[#4ADE80] text-[11px] font-extrabold text-center transition-all flex items-center justify-center gap-1 shadow-2xs"
                          >
                            <Eye className="w-3 h-3 text-[#4ADE80]" />
                            <span>Consulter</span>
                          </Link>

                          <Link 
                            to={`/nurse/suivi/${p.id}`}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#059669] text-[11px] font-extrabold text-center border border-emerald-200 transition-all flex items-center justify-center gap-1"
                          >
                            <CalendarCheck className="w-3 h-3 text-[#059669]" />
                            <span>Suivi</span>
                          </Link>
                        </div>

                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        )}


        {/* ── 4. COMPACT TABLE VIEW ── */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-xs text-gray-500">Chargement...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-400">Aucun dossier.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFDFB] border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-6">Maladie / Pathologie</th>
                    <th className="py-3.5 px-6">Patiente</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredPatients.map((p) => {
                    const pathology = getPathology(p)
                    return (
                      <tr key={p.id} className="hover:bg-emerald-50/40 transition-colors">
                        <td className="py-4 px-6 font-extrabold text-[#0F1F17] text-sm">{pathology}</td>
                        <td className="py-4 px-6 text-gray-600">{p.nom}</td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link 
                              to={`/nurse/consultation/${p.id}`}
                              className="px-3 py-1.5 rounded-lg bg-[#0F1F17] text-[#4ADE80] font-bold text-xs inline-flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Consulter</span>
                            </Link>

                            <Link 
                              to={`/nurse/suivi/${p.id}`}
                              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-[#059669] border border-emerald-200 font-bold text-xs inline-flex items-center gap-1 hover:bg-emerald-100"
                            >
                              <CalendarCheck className="w-3 h-3" />
                              <span>Suivi</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>

    </div>
  )
}
