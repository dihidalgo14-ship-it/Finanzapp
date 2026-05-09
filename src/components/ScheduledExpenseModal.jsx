import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import Modal from './Modal'
import { MONTHS } from '../utils/helpers'

const THIS_YEAR = new Date().getFullYear()
const THIS_MONTH = new Date().getMonth()

function getMonthKey(mIdx, year) {
  return `${year}-${String(mIdx + 1).padStart(2, '0')}`
}

export default function ScheduledExpenseModal({ open, onClose, onSave, initial }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('egreso')
  const [monto, setMonto] = useState('')
  const [selected, setSelected] = useState(new Set()) // Set of 'YYYY-MM' strings
  const [calYear, setCalYear] = useState(THIS_YEAR)

  useEffect(() => {
    if (!open) return
    if (initial) {
      setName(initial.name)
      setType(initial.type)
      setMonto(String(initial.monto))
      setSelected(new Set(initial.monthKeys))
      // Show year of first selected month
      if (initial.monthKeys.length > 0) {
        setCalYear(Number(initial.monthKeys[0].split('-')[0]))
      }
    } else {
      setName(''); setType('egreso'); setMonto('')
      setSelected(new Set()); setCalYear(THIS_YEAR)
    }
  }, [initial, open])

  const toggleMonth = (mIdx, year) => {
    const key = getMonthKey(mIdx, year)
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleSubmit = () => {
    if (!name.trim() || !monto || selected.size === 0) return
    onSave({ name: name.trim(), type, monto: Number(monto), monthKeys: [...selected] })
    onClose()
  }

  // Build sorted display of selected months
  const selectedSorted = [...selected].sort()
  const selectedLabels = selectedSorted.map(k => {
    const [y, m] = k.split('-')
    return `${MONTHS[parseInt(m) - 1].slice(0, 3)} ${y}`
  })

  const now = `${THIS_YEAR}-${String(THIS_MONTH + 1).padStart(2, '0')}`

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Editar gasto programado' : 'Nuevo gasto programado'}
      subtitle="Elige los meses exactos en que aplica"
      size="md"
    >
      <div className="space-y-4">

        {/* Name */}
        <div>
          <label className="text-xs text-slate-400 font-medium block mb-1.5">Descripción</label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej: Crédito auto, Seguro semestral..."
            className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-400"
          />
        </div>

        {/* Type + Amount */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1.5">Tipo</label>
            <div className="flex gap-1.5">
              {['egreso', 'ingreso'].map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-colors ${
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
            <label className="text-xs text-slate-400 font-medium block mb-1.5">Monto por mes</label>
            <input
              type="number"
              value={monto}
              onChange={e => setMonto(e.target.value)}
              placeholder="0"
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-400"
            />
          </div>
        </div>

        {/* Month picker */}
        <div>
          <label className="text-xs text-slate-400 font-medium block mb-2">
            Meses en que aplica
            {selected.size > 0 && (
              <span className="ml-2 text-slate-500">({selected.size} seleccionado{selected.size > 1 ? 's' : ''})</span>
            )}
          </label>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
            {/* Year nav */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setCalYear(y => y - 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-sm font-semibold text-white">{calYear}</span>
              <button
                onClick={() => setCalYear(y => y + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Month grid */}
            <div className="grid grid-cols-4 gap-1.5">
              {MONTHS.map((monthName, mIdx) => {
                const key = getMonthKey(mIdx, calYear)
                const isSelected = selected.has(key)
                const isPast = key < now
                return (
                  <button
                    key={mIdx}
                    onClick={() => toggleMonth(mIdx, calYear)}
                    className={`relative py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? type === 'egreso'
                          ? 'bg-red-600/80 text-white border border-red-500/60'
                          : 'bg-emerald-600/80 text-white border border-emerald-500/60'
                        : isPast
                          ? 'text-slate-600 border border-transparent hover:border-slate-700 hover:text-slate-400'
                          : 'text-slate-300 border border-slate-700/50 hover:border-slate-500 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    {monthName.slice(0, 3)}
                    {isSelected && (
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-white/80" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Quick select helpers */}
            <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-700/50">
              <button
                onClick={() => {
                  const keys = MONTHS.map((_, i) => getMonthKey(i, calYear))
                  const allSelected = keys.every(k => selected.has(k))
                  setSelected(prev => {
                    const next = new Set(prev)
                    keys.forEach(k => allSelected ? next.delete(k) : next.add(k))
                    return next
                  })
                }}
                className="text-xs px-2.5 py-1 rounded-lg border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
              >
                Todo {calYear}
              </button>
              <button
                onClick={() => {
                  const q = [0,1,2].map((_, i) => [0,3,6,9][Math.floor(i/3)])
                  // Quarters for current calYear
                  [[0,1,2],[3,4,5],[6,7,8],[9,10,11]].forEach((months, qi) => {
                    const label = `T${qi+1} ${calYear}`
                  })
                }}
                className="hidden"
              />
              {[[0,1,2],[3,4,5],[6,7,8],[9,10,11]].map((months, qi) => (
                <button
                  key={qi}
                  onClick={() => {
                    const keys = months.map(m => getMonthKey(m, calYear))
                    const allSel = keys.every(k => selected.has(k))
                    setSelected(prev => {
                      const next = new Set(prev)
                      keys.forEach(k => allSel ? next.delete(k) : next.add(k))
                      return next
                    })
                  }}
                  className="text-xs px-2.5 py-1 rounded-lg border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
                >
                  T{qi + 1}
                </button>
              ))}
              {selected.size > 0 && (
                <button
                  onClick={() => setSelected(new Set())}
                  className="text-xs px-2.5 py-1 rounded-lg border border-red-800/60 text-red-400 hover:bg-red-900/20 transition-colors ml-auto"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Selected summary chips */}
          {selectedSorted.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedLabels.map((label, i) => (
                <span
                  key={i}
                  className={`text-xs px-2 py-0.5 rounded-md border font-medium ${
                    type === 'egreso'
                      ? 'bg-red-900/30 text-red-300 border-red-700/40'
                      : 'bg-emerald-900/30 text-emerald-300 border-emerald-700/40'
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-sm text-slate-400 hover:text-white hover:border-slate-600 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !monto || selected.size === 0}
            className="flex-1 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {initial ? 'Guardar cambios' : `Crear en ${selected.size || 0} mes${selected.size !== 1 ? 'es' : ''}`}
          </button>
        </div>

      </div>
    </Modal>
  )
}
