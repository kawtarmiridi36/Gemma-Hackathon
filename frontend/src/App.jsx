import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button, Card, CardContent, Tooltip } from '@heroui/react'
import LandingPage from './pages/LandingPage'
import NewDossier from './pages/nurse/NewDossier'
import Consultation from './pages/nurse/Consultation'
import DossierList from './pages/nurse/DossierList'
import SuiviPatient from './pages/nurse/SuiviPatient'
import ValidationQueue from './pages/doctor/ValidationQueue'
import ConsultationReview from './pages/doctor/ConsultationReview'
import api from './services/api'

const ICONS = {
  patients: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
  logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
}

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('user')
    if (saved) setUser(JSON.parse(saved))
  }, [])

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Public Login Page */}
        <Route 
          path="/login" 
          element={
            user ? (
              <Navigate to={user.role === 'infirmier' ? '/nurse/dossiers' : '/doctor/queue'} replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          } 
        />

        {/* Protected Nurse Routes */}
        <Route 
          path="/nurse/*" 
          element={
            user && user.role === 'infirmier' ? (
              <DashboardLayout user={user} onLogout={handleLogout}>
                <Routes>
                  <Route path="dossiers" element={<DossierList />} />
                  <Route path="new" element={<NewDossier />} />
                  <Route path="consultation/:id" element={<Consultation />} />
                  <Route path="suivi/:id" element={<SuiviPatient />} />
                  <Route path="*" element={<Navigate to="dossiers" replace />} />
                </Routes>
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Protected Doctor Routes */}
        <Route 
          path="/doctor/*" 
          element={
            user && user.role === 'medecin' ? (
              <DashboardLayout user={user} onLogout={handleLogout}>
                <Routes>
                  <Route path="queue" element={<ValidationQueue />} />
                  <Route path="review/:id" element={<ConsultationReview />} />
                  <Route path="*" element={<Navigate to="queue" replace />} />
                </Routes>
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function DashboardLayout({ user, onLogout, children }) {
  return (
    <div className="app-layout bg-[#FAFDFB]">
      <Sidebar user={user} onLogout={onLogout} />
      <main className="main-content bg-[#FAFDFB]">
        {children}
      </main>
    </div>
  )
}

function Sidebar({ user, onLogout }) {
  const location = useLocation()
  const isActive = (path) => location.pathname === path 
    ? 'flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs bg-[#0F172A] text-white shadow-sm transition-all' 
    : 'flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all'
  
  const initials = user?.nom ? user.nom.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'D'

  return (
    <aside className="w-[260px] bg-white border-r border-slate-200 flex flex-col fixed top-0 left-0 bottom-0 z-40 shadow-sm">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[#0F172A] p-0.5 shadow-sm flex items-center justify-center shrink-0">
            <img src="/logo_icon.jpg" alt="Logo" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 font-display flex items-center gap-1.5">
              <span>Dar Al Oumouma</span>
            </div>
            <div className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-0.5 border border-emerald-200">
              Santé Maternelle Rurale
            </div>
          </div>
        </Link>
      </div>

      {/* Facility Badge */}
      <div className="mx-4 mt-4 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] space-y-0.5">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Établissement Soignant</span>
        <div className="font-bold text-slate-800 truncate">Dispensaire Rural Al Haouz</div>
        <div className="text-[10px] text-slate-500 font-medium">Zone Sanitaire #4 · Haut-Atlas</div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {user.role === 'infirmier' && (
          <>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 py-2">
              Espace Soignant CPN
            </div>
            <Link to="/nurse/dossiers" className={isActive('/nurse/dossiers')}>
              <div className="w-4 h-4 text-emerald-600 shrink-0">{ICONS.patients}</div>
              <span>Tableau de Bord & Dossiers</span>
            </Link>
            <Link to="/nurse/new" className={isActive('/nurse/new')}>
              <div className="w-4 h-4 text-emerald-600 shrink-0">{ICONS.plus}</div>
              <span>Nouveau Dossier Patient</span>
            </Link>
          </>
        )}
        {user.role === 'medecin' && (
          <>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 py-2">
              Espace Médecin Référent
            </div>
            <Link to="/doctor/queue" className={isActive('/doctor/queue')}>
              <div className="w-4 h-4 text-emerald-600 shrink-0">{ICONS.check}</div>
              <span>File de Validation CHR</span>
            </Link>
          </>
        )}
      </nav>

      {/* Footer User Info */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="w-9 h-9 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-900 truncate">{user.nom}</div>
            <div className="text-[10px] font-semibold text-emerald-700 capitalize">
              {user.role === 'infirmier' ? 'Infirmier(e) Major' : 'Médecin Référent CHR'}
            </div>
          </div>
          <Tooltip content="Déconnexion" placement="top">
            <Button 
              isIconOnly 
              size="sm" 
              variant="light" 
              onPress={onLogout} 
              className="text-slate-400 hover:text-red-600 transition-colors"
            >
              {ICONS.logout}
            </Button>
          </Tooltip>
        </div>
      </div>
    </aside>
  )
}

function LoginPage({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({ nom: '', email: '', password: '', role: 'infirmier', centre: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login'
      const payload = isRegister ? form : { email: form.email, password: form.password }
      const res = await api.post(endpoint, payload)
      const data = res.data
      onLogin(data.user, data.access_token)
    } catch (err) {
      console.error('Login error:', err)
      const detail = err.response?.data?.detail
      if (detail) {
        setError(detail)
      } else if (!err.response) {
        setError("Impossible de contacter le serveur backend (http://localhost:8000). Veuillez démarrer le serveur Uvicorn.")
      } else {
        setError(`Erreur serveur (${err.response.status}). Réessayez.`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Left Pane - Institutional Enterprise Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0F172A] overflow-hidden text-white flex-col justify-between p-12">
        <div className="relative z-20">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-2">
            Royaume du Maroc · Ministère de la Santé
          </div>
          <h1 className="text-2xl font-black font-display text-white">
            Portail National de Santé Maternelle Rurale
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Système d'Information & d'Aide à la Décision Prénatale — Province d'Al Haouz
          </p>
        </div>

        <div className="relative z-20 my-auto space-y-6 max-w-md">
          <div className="p-6 bg-slate-800/80 border border-slate-700/80 rounded-2xl backdrop-blur-md space-y-3 shadow-2xl">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              🛡️ Protocoles d'Urgence Obstétricale
            </span>
            <p className="text-sm text-slate-200 font-medium leading-relaxed">
              Assistance aux Consultations Prénatales (CPN), dépistage précoce de la pré-éclampsie et régulation automatique du transfert médical vers le CHR.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
            <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl">
              <span className="text-emerald-400 font-black text-lg block">141</span>
              <span className="text-[10px] text-slate-400">Régulation SAMU</span>
            </div>
            <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl">
              <span className="text-white font-black text-lg block">100%</span>
              <span className="text-[10px] text-slate-400">Mode Offline</span>
            </div>
            <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl">
              <span className="text-emerald-400 font-black text-lg block">Darija</span>
              <span className="text-[10px] text-slate-400">STT / TTS Dialectal</span>
            </div>
          </div>
        </div>

        <div className="relative z-20 text-[11px] text-slate-500 font-mono flex justify-between items-center border-t border-slate-800 pt-4">
          <span>Direction Régionale de Santé — Marrakech-Safi</span>
          <span>v2.4 Enterprise</span>
        </div>
      </div>

      {/* Right Pane - Enterprise Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#FAFDFB]">
        <div className="w-full max-w-md">
          
          <div className="text-left mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[#059669] hover:underline mb-6">
              ← Retour à l'accueil
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4ADE80] to-[#10B981] p-0.5 shadow-md">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                  <img src="/logo_icon.jpg" alt="Logo" className="w-9 h-9 object-cover rounded-xl" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-[#0F1F17] font-display">
                  Dar Al Oumouma
                </h1>
                <p className="text-xs text-gray-500">Espace Professionnels de Santé</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {isRegister ? 'Créer un compte soignant ou médecin référent' : 'Accédez à votre espace sécurisé de suivi médical'}
            </p>
          </div>

          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <Card className="border border-emerald-100 shadow-xl shadow-emerald-950/[0.04] bg-white rounded-3xl">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {isRegister && (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-700">Nom complet</label>
                        <input className="w-full h-11 px-3 border border-gray-200 rounded-xl text-sm focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all outline-none" placeholder="Ex: Fatima Mansouri" value={form.nom} onChange={(e) => setForm({...form, nom: e.target.value})} required />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-gray-700">Rôle</label>
                          <select className="w-full h-11 px-3 border border-gray-200 rounded-xl text-sm focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all outline-none bg-white" value={form.role} onChange={(e) => setForm({...form, role: e.target.value})}>
                            <option value="infirmier">Infirmier(e) / Sage-Femme</option>
                            <option value="medecin">Médecin Référent</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-gray-700">Centre Rurale</label>
                          <input className="w-full h-11 px-3 border border-gray-200 rounded-xl text-sm focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all outline-none" placeholder="Ex: Al Haouz" value={form.centre} onChange={(e) => setForm({...form, centre: e.target.value})} />
                        </div>
                      </div>
                    </>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Adresse Email</label>
                    <input className="w-full h-11 px-3 border border-gray-200 rounded-xl text-sm focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all outline-none" type="email" placeholder="votre.nom@sante.gov.ma" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700">Mot de passe</label>
                    <input className="w-full h-11 px-3 border border-gray-200 rounded-xl text-sm focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/20 transition-all outline-none" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required />
                  </div>

                  {error && (
                    <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 font-medium mt-1">{error}</div>
                  )}

                  <button type="submit" disabled={loading} className="w-full mt-2 h-12 bg-[#0F1F17] hover:bg-[#1A2E22] text-[#4ADE80] font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                    {loading ? 'Connexion en cours...' : (isRegister ? "Créer mon compte soignant" : 'Se connecter au système')}
                  </button>
                </form>

                <div className="text-center mt-6 text-xs text-gray-500">
                  {isRegister ? (
                    <>Vous avez déjà un compte ? <button onClick={() => setIsRegister(false)} className="text-[#059669] font-bold hover:underline">Se connecter</button></>
                  ) : (
                    <>Nouveau professionnel de santé ? <button onClick={() => setIsRegister(true)} className="text-[#059669] font-bold hover:underline">Créer un compte</button></>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  )
}

export default App
