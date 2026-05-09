import React, { useState, useEffect } from 'react'
import { LayoutGrid, TrendingDown, Tag, History, LogOut, User } from 'lucide-react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useStore } from './store/useStore'
import MatrizView from './components/MatrizView'
import GastosView from './components/GastosView'
import CategoriasView from './components/CategoriasView'
import HistorialView from './components/HistorialView'
import LoginScreen from './components/LoginScreen'
import MigrationScreen from './components/MigrationScreen'
import ToastContainer from './components/Toast'

const TABS = [
  { id: 'matriz', label: 'Resumen', icon: LayoutGrid },
  { id: 'gastos', label: 'Gastos', icon: TrendingDown },
  { id: 'categorias', label: 'Categorías', icon: Tag },
  { id: 'historial', label: 'Historial', icon: History },
]

function AppShell() {
  const { user, logout } = useAuth()
  const { loading, loadUserData, clearUserData } = useStore()
  const [tab, setTab] = useState('matriz')
  const [appState, setAppState] = useState('loading') // loading | migration | ready

  useEffect(() => {
    if (user === undefined) return // still checking auth
    if (user === null) { setAppState('login'); clearUserData(); return }

    // User logged in — check if migration needed
   loadUserData(user.uid).then(() => setAppState('ready'))
  }, [user])

  const handleMigrationDone = () => {
    if (user) localStorage.setItem(`migrated-${user.uid}`, '1')
    setAppState('ready')
  }

  if (appState === 'loading' || user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f5f5f7' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
          <p className="text-[14px] text-[#86868b]">Cargando...</p>
        </div>
      </div>
    )
  }
  if (appState === 'login') return <LoginScreen />
  if (appState === 'migration') return <MigrationScreen onDone={handleMigrationDone} />

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f5f5f7' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
          <p className="text-[14px] text-[#86868b]">Cargando tus datos...</p>
        </div>
      </div>
    )
  }

  const views = { matriz: MatrizView, gastos: GastosView, categorias: CategoriasView, historial: HistorialView }
  const Active = views[tab]

  return (
    <div className="min-h-screen" style={{ background: '#f5f5f7' }}>
      {/* Sidebar desktop */}
      <div className="hidden sm:flex flex-col fixed left-0 top-0 h-full w-56 z-30"
           style={{ background: 'rgba(255,255,255,0.8)', backdropFilter:'blur(20px)', borderRight:'1px solid rgba(0,0,0,0.07)' }}>
        <div className="px-5 pt-6 pb-4" style={{ borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[16px] font-semibold shadow-sm"
                 style={{ background: 'linear-gradient(135deg,#34c759,#30b955)' }}>$</div>
            <div>
              <p className="text-[13px] font-semibold text-[#1d1d1f] leading-tight">Finanzapp</p>
              <p className="text-[11px] text-[#86868b]">Autopymesis</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {TABS.map(t => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all text-left"
                style={{ background: active?'rgba(0,113,227,0.09)':'transparent', color: active?'#0071e3':'#6e6e73' }}>
                <Icon size={15} /> {t.label}
              </button>
            )
          })}
        </nav>
        {/* User info + logout */}
        <div className="px-4 pb-5" style={{ borderTop:'1px solid rgba(0,0,0,0.06)', paddingTop:'12px' }}>
          <div className="flex items-center gap-2.5 mb-3">
            {user.photoURL
              ? <img src={user.photoURL} className="w-7 h-7 rounded-full" alt="" />
              : <div className="w-7 h-7 rounded-full bg-[#0071e3] flex items-center justify-center"><User size={14} className="text-white"/></div>
            }
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-[#1d1d1f] truncate">{user.displayName || 'Usuario'}</p>
              <p className="text-[10px] text-[#86868b] truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-[#86868b] hover:text-[#ff3b30] hover:bg-[#ff3b30]/05 transition-colors">
            <LogOut size={13} /> Cerrar sesión
          </button>
        </div>
      </div>

      {/* Top bar mobile */}
      <header className="sm:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-12"
              style={{ background:'rgba(255,255,255,0.9)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(0,0,0,0.07)' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[11px] font-semibold"
               style={{ background:'linear-gradient(135deg,#34c759,#30b955)' }}>$</div>
          <span className="text-[14px] font-semibold text-[#1d1d1f]">Finanzapp</span>
        </div>
        <button onClick={logout} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#86868b] hover:text-[#ff3b30]">
          <LogOut size={15} />
        </button>
      </header>

      <main className="sm:ml-56 px-4 sm:px-8 py-6 pb-24 sm:pb-8 max-w-4xl sm:max-w-none">
        <Active />
      </main>

      {/* Bottom nav mobile */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 grid grid-cols-4 h-[60px]"
           style={{ background:'rgba(255,255,255,0.95)', backdropFilter:'blur(20px)', borderTop:'1px solid rgba(0,0,0,0.08)' }}>
        {TABS.map(t => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex flex-col items-center justify-center gap-1 transition-colors relative"
              style={{ color: active?'#0071e3':'#86868b' }}>
              <Icon size={18} strokeWidth={active ? 2 : 1.5} />
              <span className="text-[9px] font-medium leading-none">{t.label === 'Categorías' ? 'Categ.' : t.label}</span>
              {active && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#0071e3]" />}
            </button>
          )
        })}
      </nav>

      <ToastContainer />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}
