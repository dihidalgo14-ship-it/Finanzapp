import React, { useState } from 'react'
import { migrateFromLocalStorage } from '../services/firestoreService'
import { useAuth } from '../context/AuthContext'
import { useStore } from '../store/useStore'

export default function MigrationScreen({ onDone }) {
  const { user } = useAuth()
  const loadUserData = useStore(s => s.loadUserData)
  const [status, setStatus] = useState('idle') // idle | running | done | error | skip
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const hasLocalData = !!localStorage.getItem('presupuesto-v3')

  const handleMigrate = async () => {
    setStatus('running')
    try {
      const res = await migrateFromLocalStorage(user.uid)
      setResult(res)
      setStatus('done')
      // Reload from Firestore
      await loadUserData(user.uid)
    } catch (e) {
      setError(e.message)
      setStatus('error')
    }
  }

  const handleSkip = async () => {
    setStatus('skip')
    await loadUserData(user.uid)
    onDone()
  }

  const handleFinish = () => {
    // Optional: clear localStorage after successful migration
    // localStorage.removeItem('presupuesto-v3')
    onDone()
  }

  if (!hasLocalData) {
    // No local data, just load and go
    React.useEffect(() => { loadUserData(user.uid).then(onDone) }, [])
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f5f5f7' }}>
        <p className="text-[15px] text-[#86868b]">Cargando tu cuenta...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f5f5f7' }}>
      <div className="w-full max-w-md">
        <div className="mac-card p-8">
          {status === 'idle' && (
            <>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[24px] mb-5"
                   style={{ background: 'rgba(0,113,227,0.1)' }}>📦</div>
              <h2 className="text-[19px] font-semibold text-[#1d1d1f] mb-2">Tienes datos guardados localmente</h2>
              <p className="text-[14px] text-[#6e6e73] mb-6">
                Encontramos datos de presupuesto guardados en este navegador. ¿Quieres subirlos a tu cuenta en la nube?
              </p>
              <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)' }}>
                <p className="text-[13px] text-[#86868b]">
                  ✓ Tus datos se migrarán a Firestore de forma segura<br/>
                  ✓ Solo tú podrás verlos con tu cuenta Google<br/>
                  ✓ Los datos locales se mantienen como respaldo
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={handleSkip} className="mac-btn mac-btn-secondary flex-1 justify-center">
                  Empezar limpio
                </button>
                <button onClick={handleMigrate} className="mac-btn mac-btn-primary flex-1 justify-center">
                  Migrar mis datos
                </button>
              </div>
            </>
          )}

          {status === 'running' && (
            <div className="text-center py-8">
              <div className="w-10 h-10 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[15px] font-medium text-[#1d1d1f]">Migrando datos...</p>
              <p className="text-[13px] text-[#86868b] mt-1">Esto solo toma unos segundos</p>
            </div>
          )}

          {status === 'done' && result && (
            <>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[24px] mb-5"
                   style={{ background: 'rgba(52,199,89,0.1)' }}>✅</div>
              <h2 className="text-[19px] font-semibold text-[#1d1d1f] mb-2">¡Migración exitosa!</h2>
              <div className="rounded-xl p-4 mb-6 space-y-1" style={{ background: 'rgba(52,199,89,0.06)', border: '1px solid rgba(52,199,89,0.2)' }}>
                <p className="text-[13px] text-[#34c759]">✓ {result.categories} categorías</p>
                <p className="text-[13px] text-[#34c759]">✓ {result.expenses} gastos programados</p>
                <p className="text-[13px] text-[#34c759]">✓ {result.ingresos} ingresos programados</p>
                <p className="text-[13px] text-[#34c759]">✓ {result.monthData} meses de datos</p>
              </div>
              <button onClick={handleFinish} className="mac-btn mac-btn-primary w-full justify-center">
                Ir a mi presupuesto →
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[24px] mb-5"
                   style={{ background: 'rgba(255,59,48,0.1)' }}>⚠️</div>
              <h2 className="text-[19px] font-semibold text-[#1d1d1f] mb-2">Error en migración</h2>
              <p className="text-[13px] text-[#86868b] mb-4">{error}</p>
              <div className="flex gap-3">
                <button onClick={() => setStatus('idle')} className="mac-btn mac-btn-secondary flex-1 justify-center">
                  Reintentar
                </button>
                <button onClick={handleSkip} className="mac-btn mac-btn-primary flex-1 justify-center">
                  Continuar sin migrar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
