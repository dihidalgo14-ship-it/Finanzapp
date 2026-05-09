import React, { useState, useEffect } from 'react'
import Modal from './Modal'

export default function CategoryModal({ open, onClose, onSave, initial }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('egreso')
  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (initial) {
      setName(initial.name); setType(initial.type); setAmount(String(initial.defaultAmount))
    } else {
      setName(''); setType('egreso'); setAmount('')
    }
  }, [initial, open])

  const handleSubmit = () => {
    if (!name.trim()) return
    onSave({ name: name.trim(), type, defaultAmount: Number(amount) || 0 })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Editar categoría' : 'Nueva categoría'} subtitle="Maestro de categorías">
      <div className="space-y-4">
        <div>
          <label className="text-xs text-slate-400 font-medium block mb-1.5">Nombre</label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Ej: Seguro de salud"
            className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-400"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 font-medium block mb-1.5">Tipo</label>
          <div className="grid grid-cols-2 gap-2">
            {['egreso', 'ingreso'].map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`py-2 rounded-xl border text-sm font-medium transition-colors ${
                  type === t
                    ? t === 'egreso'
                      ? 'bg-red-900/40 border-red-700/60 text-red-300'
                      : 'bg-emerald-900/40 border-emerald-700/60 text-emerald-300'
                    : 'border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                {t === 'ingreso' ? 'Ingreso' : 'Egreso'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-400 font-medium block mb-1.5">Monto mensual por defecto</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-400"
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-sm text-slate-400 hover:text-white hover:border-slate-600 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors">
            Guardar
          </button>
        </div>
      </div>
    </Modal>
  )
}
