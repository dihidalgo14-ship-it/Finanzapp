import React, { useState } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import Modal from './Modal'
import { fmt } from '../utils/helpers'

export default function CloseMonthModal({ open, onClose, pendientes, monthLabel, onConfirm }) {
  const [saldo, setSaldo] = useState('')

  const handleConfirm = () => {
    if (saldo === '') return
    onConfirm(Number(saldo))
    setSaldo('')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Cerrar ${monthLabel}`}
      subtitle="Esta acción bloqueará el mes para edición"
      size="md"
    >
      <div className="space-y-4">
        {pendientes.length > 0 && (
          <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <RotateCcw size={14} className="text-amber-400" />
              <span className="text-sm font-medium text-amber-300">
                {pendientes.length} gasto{pendientes.length > 1 ? 's' : ''} pendiente{pendientes.length > 1 ? 's' : ''} se arrastrarán
              </span>
            </div>
            <div className="space-y-1">
              {pendientes.map(p => (
                <div key={p.id} className="flex justify-between text-xs text-amber-400/80">
                  <span className="truncate mr-2">{p.name}</span>
                  <span className="shrink-0 font-medium">{fmt(p.presupuesto)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {pendientes.length === 0 && (
          <div className="bg-emerald-900/20 border border-emerald-700/40 rounded-xl p-3 text-sm text-emerald-300 flex items-center gap-2">
            <AlertTriangle size={14} />
            No hay gastos pendientes. El mes cerrará limpio.
          </div>
        )}

        <div>
          <label className="text-xs text-slate-400 font-medium block mb-1.5">
            Saldo final de caja
            <span className="text-slate-500 ml-1">(dinero real en cuenta al cierre)</span>
          </label>
          <input
            autoFocus
            type="number"
            value={saldo}
            onChange={e => setSaldo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleConfirm()}
            placeholder="Ej: 450000"
            className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-400"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-sm text-slate-400 hover:text-white hover:border-slate-600 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={saldo === ''}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
          >
            Confirmar cierre
          </button>
        </div>
      </div>
    </Modal>
  )
}
