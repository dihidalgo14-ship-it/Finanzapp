import React, { useState } from 'react'
import { RotateCcw, ChevronDown, ChevronUp, Trash2, Calendar } from 'lucide-react'
import Badge from './Badge'
import { fmt } from '../utils/helpers'

export default function MobileItemCard({ item, locked, onUpdateItem, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  const diff = item.type === 'ingreso'
    ? item.real - item.presupuesto
    : item.presupuesto - item.real

  const diffClass = diff >= 0 ? 'text-emerald-400' : 'text-red-400'

  return (
    <div className={`bg-slate-800/50 border rounded-xl overflow-hidden transition-colors ${
      item.esArrastre ? 'border-amber-700/40' : item.esScheduled ? 'border-blue-700/40' : 'border-slate-700/50'
    }`}>
      <button
        className="w-full text-left px-4 py-3 flex items-center gap-3"
        onClick={() => setExpanded(e => !e)}
      >
        {item.esArrastre && <RotateCcw size={13} className="text-amber-400 shrink-0" />}
        {item.esScheduled && <Calendar size={13} className="text-blue-400 shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium text-white truncate">{item.name}</span>
            {item.esExtra && <Badge variant="extra" className="shrink-0">Extra</Badge>}
            {item.esArrastre && <Badge variant="arrastre" className="shrink-0">Arrastre</Badge>}
            {item.esScheduled && <Badge variant="scheduled" className="shrink-0">{item.cuotaNum}/{item.totalCuotas}</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Real: {fmt(item.real)}</span>
            <span className={`text-xs font-medium ${diffClass}`}>
              {diff >= 0 ? '+' : ''}{fmt(diff)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {item.type !== 'ingreso' && !locked && (
            <select
              value={item.estado || 'pendiente'}
              onChange={e => { e.stopPropagation(); onUpdateItem('estado', e.target.value) }}
              onClick={e => e.stopPropagation()}
              className={`text-xs px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${
                item.estado === 'pagado'
                  ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50'
                  : 'bg-amber-900/30 text-amber-300 border-amber-700/50'
              }`}
            >
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
            </select>
          )}
          {item.type !== 'ingreso' && locked && (
            <Badge variant={item.estado === 'pagado' ? 'pagado' : 'pendiente'}>
              {item.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
            </Badge>
          )}
          {expanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-3 border-t border-slate-700/50 pt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Presupuestado</label>
              {locked ? (
                <span className="text-sm text-slate-300">{fmt(item.presupuesto)}</span>
              ) : (
                <input
                  type="number"
                  defaultValue={item.presupuesto}
                  onBlur={e => onUpdateItem('presupuesto', Number(e.target.value))}
                  className="w-full text-sm bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-slate-400"
                />
              )}
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Real</label>
              {locked ? (
                <span className="text-sm text-slate-300">{fmt(item.real)}</span>
              ) : (
                <input
                  type="number"
                  defaultValue={item.real}
                  onBlur={e => onUpdateItem('real', Number(e.target.value))}
                  className="w-full text-sm bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-slate-400"
                />
              )}
            </div>
          </div>

          {!locked && item.esExtra && (
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300"
            >
              <Trash2 size={12} />
              Eliminar ítem
            </button>
          )}
        </div>
      )}
    </div>
  )
}
