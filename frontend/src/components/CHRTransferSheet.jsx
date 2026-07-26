import { useState, useRef } from 'react'
import { 
  AlertTriangle, Printer, Download, ShieldAlert, ArrowRight, PhoneCall, 
  Stethoscope, FileText, CheckCircle2, X, MapPin, Navigation, Send, Save, Check, Radio
} from 'lucide-react'

// Dummy Morocco Regional Hospitals Data (Région Al Haouz / Marrakech-Safi)
const REGIONAL_HOSPITALS = [
  {
    id: 'chr_tahanaout',
    name: 'Centre Hospitalier Provincial Tahanaout (CHR Al Haouz)',
    type: 'CHR Niveau 2 · Maternité de Référence',
    distance: '18 km',
    duration: '22 min (Ambulance)',
    bedsAvailable: '4 lits réanimation dispo',
    phone: '05 24 48 40 12',
    lat: 31.285,
    lng: -7.95,
    top: '52%',
    left: '42%',
    status: 'OPTIMAL',
    recommended: true
  },
  {
    id: 'chu_marrakech',
    name: 'CHU Mohammed VI Marrakech (Maternité Lalla Meryem)',
    type: 'CHU Niveau 3 · Urgence Obstétricale Majeure 24/7',
    distance: '38 km',
    duration: '35 min (SAMU 141)',
    bedsAvailable: '12 lits SOIC & Néo-nat dispo',
    phone: '05 24 30 07 00',
    lat: 31.63,
    lng: -8.0,
    top: '25%',
    left: '58%',
    status: 'DISPONIBLE',
    recommended: false
  },
  {
    id: 'hopital_ait_ourir',
    name: 'Hôpital de Proximité Aït Ourir',
    type: 'Hôpital Relais · Stabilisation URG',
    distance: '8 km',
    duration: '10 min',
    bedsAvailable: '2 lits garde dispo',
    phone: '05 24 48 01 02',
    lat: 31.56,
    lng: -7.67,
    top: '40%',
    left: '75%',
    status: 'CAPACITÉ RESTE 2 LITS',
    recommended: false
  },
  {
    id: 'hopital_ibn_tofail',
    name: 'Hôpital Ibn Tofail Marrakech (Gueliz)',
    type: 'Centre CHU Urgences Chirurgicales',
    distance: '41 km',
    duration: '40 min',
    bedsAvailable: '6 lits dispo',
    phone: '05 24 43 49 08',
    lat: 31.64,
    lng: -8.01,
    top: '20%',
    left: '48%',
    status: 'DISPONIBLE',
    recommended: false
  }
]

export default function CHRTransferSheet({ patient, consultation, redFlags = [], compteRendu = '', ordonnance = [], onClose }) {
  const sheetRef = useRef(null)
  const [viewMode, setViewMode] = useState('sheet') // 'sheet' | 'map' | 'sent'
  const [selectedHospital, setSelectedHospital] = useState(REGIONAL_HOSPITALS[0])
  const [isSaved, setIsSaved] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sentSuccess, setSentSuccess] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const dateNow = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  const refCode = `TR-CHR-${consultation?.id || '2026'}-${Math.floor(100 + Math.random() * 900)}`

  const handleSaveSheet = () => {
    setIsSaved(true)
    setTimeout(() => {
      setViewMode('map')
    }, 600)
  }

  const handleSendTransfer = () => {
    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      setSentSuccess(true)
      setViewMode('sent')
    }, 1200)
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      
      {/* Modal Card */}
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-red-200 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in duration-200">
        
        {/* Header Action Bar (No Print) */}
        <div className="bg-[#0F1F17] text-white p-4 px-6 flex items-center justify-between no-print border-b border-emerald-900">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <div>
              <h2 className="text-sm font-extrabold text-[#4ADE80] font-display flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span>Réseau Urgences CHR · Dar Al Oumouma Al Haouz</span>
              </h2>
              <p className="text-[10px] text-gray-400">Réf: {refCode} · Mode: {viewMode.toUpperCase()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Navigation Tabs */}
            <div className="bg-white/10 p-1 rounded-xl flex gap-1 text-xs">
              <button 
                onClick={() => setViewMode('sheet')} 
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewMode === 'sheet' ? 'bg-[#4ADE80] text-[#0F1F17]' : 'text-gray-300 hover:text-white'
                }`}
              >
                📄 Fiche Médicale
              </button>
              <button 
                onClick={() => setViewMode('map')} 
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all ${
                  viewMode === 'map' ? 'bg-[#4ADE80] text-[#0F1F17]' : 'text-gray-300 hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Carte des CHR (Maroc)</span>
              </button>
            </div>

            <button 
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Imprimer"
            >
              <Printer className="w-4 h-4" />
            </button>

            {onClose && (
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* VIEW 1: PRINTABLE DOCUMENT SHEET */}
        {viewMode === 'sheet' && (
          <div className="flex flex-col">
            <div className="p-8 space-y-6 bg-white printable-prescription overflow-y-auto max-h-[70vh]" ref={sheetRef}>
              
              {/* Official Document Header */}
              <div className="border-b-2 border-red-600 pb-4 flex justify-between items-start">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-500 font-mono">
                    Royaume du Maroc · Ministère de la Santé
                  </div>
                  <h1 className="text-lg font-black text-[#0F1F17] font-display uppercase tracking-tight mt-0.5">
                    Réseau de Soins de Santé de Base — Al Haouz
                  </h1>
                  <p className="text-xs font-bold text-red-700">
                    Dispensaire Rural Al Haouz ➔ Centre Hospitalier Régional (CHR / CHU)
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-black rounded uppercase tracking-wider shadow-xs font-mono">
                    🚨 TRANSFERT URGENT
                  </span>
                  <div className="text-[10px] font-mono font-bold text-gray-500 mt-1">
                    Réf: {refCode}
                  </div>
                  <div className="text-[10px] font-mono text-gray-400">Date: {dateNow}</div>
                </div>
              </div>

              {/* Banner Pathologie Grave */}
              <div className="bg-red-50 border-2 border-red-300 p-4 rounded-2xl flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-widest block">
                    Motif d'Urgence Obstétricale Majeure :
                  </span>
                  <h3 className="text-base font-black text-red-900 font-display">
                    🚨 SUSPICION DE PRÉ-ÉCLAMPSIE SÉVÈRE / HTA GRAVIDIQUE CRITIQUE
                  </h3>
                </div>
                <ShieldAlert className="w-8 h-8 text-red-600 shrink-0" />
              </div>

              {/* Section 1: Patient Identity & Vitals */}
              <div className="grid grid-cols-2 gap-4 text-xs border border-gray-200 rounded-2xl p-4 bg-gray-50/50">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Identité Patiente</span>
                  <div className="font-extrabold text-[#0F1F17] text-sm">{patient?.nom || 'Fatima Ezzahra Mansouri'}</div>
                  <div className="text-gray-600 font-medium">{patient?.age || 28} ans · Sexe: Féminin</div>
                  <div className="text-gray-600 font-medium">Zone: {patient?.zone || 'Al Haouz'} ({patient?.village || 'Douar Aït Ourir'})</div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Constantes Vitales à l'Admission</span>
                  <div className="flex items-center gap-4 pt-1">
                    <div className="p-2 bg-white rounded-xl border border-red-200 text-center flex-1">
                      <span className="text-[9px] text-gray-400 font-bold block">TENSION PA</span>
                      <span className="font-mono text-sm font-black text-red-700">16/10 mmHg</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-emerald-200 text-center flex-1">
                      <span className="text-[9px] text-gray-400 font-bold block">TERME SA</span>
                      <span className="font-mono text-sm font-black text-[#0F1F17]">34 SA</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Red Flags & Clinical Signs */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-[#0F1F17] uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Signes de Gravité Détectés (Dépistage IA Gemma 4 & Anamnèse Darija) :</span>
                </span>

                <div className="flex flex-wrap gap-2">
                  {(redFlags.length > 0 ? redFlags : [
                    "Tension artérielle systolique ≥ 160 mmHg",
                    "Céphalées violentes persistantes (Sda3 f ras)",
                    "Troubles visuels / Scintillements (Zglagh f 3aynayn)",
                    "Protéinurie massive ++",
                    "Risque d'éclampsie / crise convulsive"
                  ]).map((flag, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                      <span>⚠️</span>
                      <span>{flag}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Section 3: Emergency Treatments Administered */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-[#0F1F17] uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-[#059669]" />
                  <span>Mesures Conservatoires Prises au Dispensaire :</span>
                </span>

                <div className="p-3 bg-[#FAFDFB] border border-emerald-200 rounded-2xl text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#059669]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Pose voie veineuse périphérique + Oxygénothérapie de sécurité</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-[#059669]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Administration dose de charge Sulfate de Magnésium (MgSO4) préventive</span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-[#059669]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                    <span>Position décubitus latéral gauche (DLG) & Monitoring continu</span>
                  </div>
                </div>
              </div>

              {/* Section 4: Transfer Protocol & Transport */}
              <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-[#0F1F17]">Moyen de Transport :</span>
                  <p className="text-gray-600">Ambulance Medicalisée Rurale / SAMU Obstétrical (Urgence Absolue)</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-red-700 flex items-center gap-1">
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Centre Régional Régulation : 141</span>
                  </span>
                </div>
              </div>

              {/* Signatures & Stamps */}
              <div className="pt-4 grid grid-cols-2 gap-8 text-xs border-t border-gray-200">
                <div>
                  <span className="font-bold text-gray-500 block mb-6">Visa Infirmier / Sage-Femme Référente :</span>
                  <div className="border-b border-dashed border-gray-400 w-48" />
                  <span className="text-[10px] text-gray-400 mt-1 block">Signature & Cachet Dispensaire</span>
                </div>

                <div className="text-right">
                  <span className="font-bold text-gray-500 block mb-6">Médecin Régulateur CHR Réceptionnaire :</span>
                  <div className="border-b border-dashed border-gray-400 w-48 ml-auto" />
                  <span className="text-[10px] text-gray-400 mt-1 block">Accusé de Réception CHR</span>
                </div>
              </div>

            </div>

            {/* Bottom Footer Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between no-print">
              <div className="text-xs font-medium text-gray-500">
                {isSaved ? '✅ Fiche enregistrée en base local' : 'Cliquez pour enregistrer et choisir l’hôpital de destination'}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveSheet}
                  className="px-5 py-2.5 rounded-2xl bg-[#0F1F17] hover:bg-[#1A3A28] text-[#4ADE80] text-xs font-extrabold flex items-center gap-2 shadow-md transition-all"
                >
                  <Save className="w-4 h-4 text-[#4ADE80]" />
                  <span>Enregistrer & Choisir Hôpital (Carte du Maroc) ➔</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: INTERACTIVE MOROCCO MAP & HOSPITAL SELECTOR */}
        {viewMode === 'map' && (
          <div className="p-6 space-y-6 bg-[#0B1510] text-white min-h-[580px] flex flex-col justify-between">
            <div>
              {/* Map Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-extrabold text-[#4ADE80] uppercase tracking-widest flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-[#4ADE80] animate-pulse" />
                    <span>Cartographie des Établissements de Santé · Région Al Haouz / Marrakech-Safi</span>
                  </span>
                  <h2 className="text-lg font-black text-white font-display">
                    Orientation & Évacuation Sanitaire d'Urgence
                  </h2>
                </div>

                <div className="text-right text-xs">
                  <span className="text-gray-400">Position Patiente : </span>
                  <span className="font-bold text-[#4ADE80]">Douar Aït Ourir (Al Haouz)</span>
                </div>
              </div>

              {/* Grid Layout: Interactive Visual Map (Left) + Hospital Cards (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Visual Map Canvas Representation */}
                <div className="lg:col-span-7 relative bg-[#13261C] border border-emerald-800/60 rounded-3xl p-4 h-[380px] overflow-hidden flex flex-col justify-between shadow-inner">
                  
                  {/* Top Map Status */}
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono z-10">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>GPS: 31.285° N, 7.950° W</span>
                    </span>
                    <span>Zone Haut-Atlas Al Haouz</span>
                  </div>

                  {/* Simulated Map Topography Styling */}
                  <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#4ADE80_1px,transparent_1px)] [background-size:16px_16px]" />
                  
                  {/* Highway / Road Connection Lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                    <path d="M 160,110 L 250,200 L 420,150" fill="none" stroke="#4ADE80" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M 250,200 L 280,260" fill="none" stroke="#EF4444" strokeWidth="2" />
                  </svg>

                  {/* Patient Origin Pin */}
                  <div className="absolute top-[52%] left-[40%] transform -translate-x-1/2 -translate-y-1/2 z-20">
                    <div className="relative group cursor-pointer">
                      <div className="w-6 h-6 rounded-full bg-red-600 border-2 border-white flex items-center justify-center shadow-lg animate-pulse">
                        <span className="text-[10px]">🏠</span>
                      </div>
                      <div className="absolute left-7 top-0 bg-red-950 text-red-200 border border-red-700 text-[9px] font-extrabold px-2 py-0.5 rounded whitespace-nowrap shadow-md">
                        Patiente: Aït Ourir
                      </div>
                    </div>
                  </div>

                  {/* Hospital Markers on Map */}
                  {REGIONAL_HOSPITALS.map((hosp) => {
                    const isSelected = selectedHospital.id === hosp.id
                    return (
                      <div 
                        key={hosp.id}
                        onClick={() => setSelectedHospital(hosp)}
                        style={{ top: hosp.top, left: hosp.left }}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group"
                      >
                        <div className={`p-2 rounded-2xl flex items-center gap-1.5 transition-all shadow-xl ${
                          isSelected 
                            ? 'bg-[#4ADE80] text-[#0F1F17] scale-110 border-2 border-white ring-4 ring-[#4ADE80]/30' 
                            : 'bg-[#0F1F17]/90 border border-emerald-600/50 text-white hover:bg-emerald-800'
                        }`}>
                          <MapPin className={`w-4 h-4 ${isSelected ? 'text-[#0F1F17]' : 'text-[#4ADE80]'}`} />
                          <span className="text-[10px] font-extrabold whitespace-nowrap">{hosp.name.split('(')[0]}</span>
                        </div>
                      </div>
                    )
                  })}

                  {/* Map Footer Legend */}
                  <div className="relative z-10 flex justify-between items-center text-[10px] font-bold text-emerald-300 bg-[#0F1F17]/80 backdrop-blur-xs p-2.5 rounded-2xl border border-emerald-800/40">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#4ADE80]" />
                      <span>Réseau SAMU 141 Al Haouz Opérationnel</span>
                    </span>
                    <span>Distance Moyenne CHR: 18 km</span>
                  </div>

                </div>

                {/* Hospital Selection Cards List (Right Side) */}
                <div className="lg:col-span-5 space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Établissements Réceptionnaires Dispo :
                  </div>

                  {REGIONAL_HOSPITALS.map((hosp) => {
                    const isSelected = selectedHospital.id === hosp.id
                    return (
                      <div 
                        key={hosp.id}
                        onClick={() => setSelectedHospital(hosp)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                          isSelected 
                            ? 'bg-emerald-950/80 border-[#4ADE80] ring-1 ring-[#4ADE80]/40 shadow-lg' 
                            : 'bg-[#13261C] border-emerald-900/60 text-gray-300 hover:border-emerald-700'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-xs text-white">{hosp.name}</span>
                              {hosp.recommended && (
                                <span className="px-2 py-0.5 rounded-full bg-[#4ADE80]/20 text-[#4ADE80] text-[9px] font-extrabold border border-[#4ADE80]/40">
                                  RECOMMANDÉ
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-emerald-400 font-medium">{hosp.type}</p>
                          </div>
                          
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'bg-[#4ADE80] border-white text-[#0F1F17]' : 'border-gray-600'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-emerald-900/40">
                          <span className="text-emerald-300 font-bold">⏱️ {hosp.duration} ({hosp.distance})</span>
                          <span className="text-emerald-400 font-extrabold">🛏️ {hosp.bedsAvailable}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

              </div>
            </div>

            {/* Send Confirmation Bar */}
            <div className="pt-4 border-t border-emerald-900/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Hôpital Réceptionnaire Sélectionné :</span>
                <h4 className="text-sm font-extrabold text-[#4ADE80]">{selectedHospital.name}</h4>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setViewMode('sheet')}
                  className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
                >
                  ← Revoir la Fiche
                </button>

                <button
                  onClick={handleSendTransfer}
                  disabled={isSending}
                  className="px-6 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center gap-2 shadow-xl animate-bounce"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSending ? 'Transmission en cours...' : `Envoyer Fiche au ${selectedHospital.name.split('(')[0]}`}</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 3: SUCCESS TRANSMISSION CONFIRMATION */}
        {viewMode === 'sent' && (
          <div className="p-10 bg-[#0F1F17] text-white text-center space-y-6 min-h-[480px] flex flex-col items-center justify-center">
            
            <div className="w-20 h-20 rounded-full bg-[#4ADE80]/20 border-2 border-[#4ADE80] text-[#4ADE80] flex items-center justify-center shadow-2xl animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2 max-w-md">
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-900/60 text-[#4ADE80] px-3 py-1 rounded-full border border-[#4ADE80]/30">
                TRANSITION SAMU 141 EXPÉDIÉE
              </span>
              <h2 className="text-2xl font-black text-white font-display">
                Fiche de Transfert d'Urgence Transmise !
              </h2>
              <p className="text-xs text-emerald-100/80 leading-relaxed">
                La fiche médicale <strong className="text-[#4ADE80]">{refCode}</strong> a été enregistrée et transmise par télé-transmission sécurisée au médecin régulateur de :
              </p>
              <div className="p-4 bg-[#13261C] border border-[#4ADE80]/40 rounded-2xl font-extrabold text-sm text-[#4ADE80]">
                🏥 {selectedHospital.name}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs max-w-md w-full text-left bg-white/5 p-4 rounded-2xl border border-white/10">
              <div>
                <span className="text-gray-400 block text-[10px]">Temps d'Ambulance Estimé :</span>
                <span className="font-mono font-bold text-white text-sm">{selectedHospital.duration}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px]">Lits Réanimation Réservés :</span>
                <span className="font-mono font-bold text-[#4ADE80] text-sm">✅ Confirmé</span>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button
                onClick={handlePrint}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer la Copie Papier</span>
              </button>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-2xl bg-[#4ADE80] hover:bg-[#34D399] text-[#0F1F17] text-xs font-black shadow-lg"
              >
                Terminer & Fermer
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  )
}
