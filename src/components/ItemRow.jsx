import React, { useState } from 'react'
import { Trash2, RotateCcw, Calendar } from 'lucide-react'
import Badge from './Badge'
import { fmt } from '../utils/helpers'

export default function ItemRow({ item, locked, onUpdateItem, onDelete }) {
  const [editPresup, setEditPresup] = useState(false)
  const [editReal, setEditReal] = useState(false)

  const diff = item.type === 'ingreso'
    ? item.real - item.presupuesto
    : item.presupuesto - item.real

  const diffClass = diff >= 0 ? 'text-emerald-400' : 'text-red-400'
  const diffLabel = (diff >= 0 ? '+' : '') + fmt(diff)

  const typeVariant = item.esArrastre ? 'arrastre' : item.esScheduled ? 'scheduled' : item.type
  const typeLabel = item.esArrastre ? 'Arrastre' : item.esScheduled ? 'Programado' : item.type === 'ingreso' ? 'Ingreso' : 'Egreso'

  return (
    <tr className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors group">
      {/* Category */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          {item.esArrastre && <RotateCcw size={13} className="text-amber-400 shrink-0" />}
          {item.esScheduled && <Calendar size={13} className="text-blue-400 shrink-0" />}
          <div>
            <span className="text-sm text-white font-medium">{item.name}</span>
            {item.esExtra && <div className="text-xs text-slate-500">No contemplado</div>}
            {item.esArrastre && <div className="text-xs text-amber-500/80">Arrastrado</div>}
            {item.esScheduled && (
              <div className="text-xs text-blue-400/70">
                Cuota {item.cuotaNum} de {item.totalCuotas}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Type */}
      <td className="px-2 py-2.5">
        <Badge variant={typeVariant}>{typeLabel}</Badge>
      </td>

      {/* Presupuestado */}
      <td className="px-2 py-2.5 text-right">
        {locked || item.esScheduled ? (
          <span className="text-sm text-slate-300">{fmt(item.presupuesto)}</span>
        ) : editPresup ? (
          <input
            autoFocus
            type="number"
            defaultValue={item.presupuesto}
            onBlur={e => { onUpdateItem('presupuesto', Number(e.target.value)); setEditPresup(false) }}
            onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
            className="w-28 text-right text-sm bg-slate-700 border border-slate-500 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-slate-400"
          />
        ) : (
          <button
            onClick={() => setEditPresup(true)}
            className="text-sm text-slate-300 hover:text-white hover:underline transition-colors text-right"
          >
            {fmt(item.presupuesto)}
          </button>
        )}
      </td>

      {/* Real */}
      <td className="px-2 py-2.5 text-right">
        {locked ? (
          <span className="text-sm text-slate-300">{fmt(item.real)}</span>
        ) : editReal ? (
          <input
            autoFocus
            type="number"
            defaultValue={item.real}
            onBlur={e => { onUpdateItem('real', Number(e.target.value)); setEditReal(false) }}
            onKeyDown={e => { if (e.key === 'Enter') e.target.blur() }}
            className="w-28 text-right text-sm bg-slate-700 border border-slate-500 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-slate-400"
          />
        ) : (
          <button
            onClick={() => setEditReal(true)}
            className="text-sm text-slate-300 hover:text-white hover:underline transition-colors text-right"
          >
            {fmt(item.real)}
          </button>
        )}
      </td>

      {/* Diferencia */}
      <td className="px-2 py-2.5 text-right">
        <span className={`text-sm font-medium ${diffClass}`}>{diffLabel}</span>
      </td>

      {/* Estado */}
      <td className="px-2 py-2.5">
        {item.type === 'ingreso' ? (
          <span className="text-slate-600 text-xs">—</span>
        ) : locked ? (
          <Badge variant={item.estado === 'pagado' ? 'pagado' : 'pendiente'}>
            {item.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
          </Badge>
        ) : (
          <select
            value={item.estado || 'pendiente'}
            onChange={e => onUpdateItem('estado', e.target.value)}
            className={`text-xs px-2 py-1 rounded-lg border cursor-pointer focus:outline-none transition-colors ${
              item.estado === 'pagado'
                ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50'
                : 'bg-amber-900/30 text-amber-300 border-amber-700/50'
            }`}
          >
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
          </select>
        )}
      </td>

      {/* Acciones */}
      <td className="px-2 py-2.5">
        {!locked && item.esExtra && (
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-900/30 transition-all"
          >
            <Trash2 size={13} />
          </button>
        )}
      </td>
    </tr>
  )
}
