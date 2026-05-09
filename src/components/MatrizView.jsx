import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Lock, Plus, LayoutGrid, BarChart2, Check, RotateCcw, Pencil } from 'lucide-react'
import { useStore } from '../store/useStore'
import { MONTHS, MONTHS_SHORT, getMonthKey, fmt, fmtShort } from '../utils/helpers'
import Modal from './Modal'
import { showToast } from './Toast'

// ── Close Month Modal ──────────────────────────────────────────────────────
function CloseModal({ open, onClose, pendientes, monthLabel, onConfirm }) {
  const [saldo, setSaldo] = useState('')
  const handle = () => {
    if (saldo === '') return
    onConfirm(Number(saldo)); setSaldo(''); onClose()
  }
  return (
    <Modal open={open} onClose={onClose} title={`Cerrar ${monthLabel}`} subtitle="El mes quedará bloqueado para edición" size="sm">
      <div className="space-y-4">
        {pendientes.length > 0 && (
          <div className="rounded-xl p-3.5" style={{ background: 'rgba(255,159,10,0.08)', border: '1px solid rgba(255,159,10,0.25)' }}>
            <p className="text-[13px] font-semibold text-[#ff9f0a] mb-1.5"><RotateCcw size={12} className="inline mr-1" />{pendientes.length} gasto{pendientes.length > 1 ? 's' : ''} pendiente{pendientes.length > 1 ? 's' : ''} se arrastrarán</p>
            {pendientes.map(p => (
              <div key={p.id} className="flex justify-between text-[12px] text-[#86868b] py-0.5">
                <span className="truncate mr-2">{p.name}</span>
                <span className="font-medium shrink-0">{fmt(p.presupuesto)}</span>
              </div>
            ))}
          </div>
        )}
        {pendientes.length === 0 && (
          <div className="rounded-xl p-3 text-[13px]" style={{ background: 'rgba(52,199,89,0.08)', border: '1px solid rgba(52,199,89,0.25)', color: '#34c759' }}>
            Sin gastos pendientes — el mes cierra limpio.
          </div>
        )}
        <div>
          <label className="text-[12px] font-medium text-[#6e6e73] block mb-1.5">Saldo final de caja</label>
          <input autoFocus type="number" value={saldo} onChange={e => setSaldo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handle()} placeholder="Monto real en cuenta al cierre" className="mac-input" />
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="mac-btn mac-btn-secondary flex-1 justify-center">Cancelar</button>
          <button onClick={handle} disabled={saldo === ''} className="mac-btn mac-btn-destructive flex-1 justify-center disabled:opacity-40">Confirmar cierre</button>
        </div>
      </div>
    </Modal>
  )
}

// ── Add Extra Item Modal ───────────────────────────────────────────────────
function AddExtraModal({ open, onClose, onAdd, categories }) {
  const [name, setName] = useState(''); const [type, setType] = useState('egreso')
  const [catId, setCatId] = useState(''); const [presupuesto, setPresupuesto] = useState('')
  React.useEffect(() => { if (open) { setName(''); setType('egreso'); setPresupuesto(''); setCatId(categories.filter(c=>c.type==='egreso')[0]?.id||'') } }, [open])
  const cats = categories.filter(c => c.type === type)
  React.useEffect(() => { setCatId(cats[0]?.id || '') }, [type])
  const handle = () => {
    if (!name.trim()) return
    onAdd(name.trim(), type, catId, Number(presupuesto) || 0)
    onClose()
  }
  return (
    <Modal open={open} onClose={onClose} title="Gasto/ingreso puntual" subtitle="Ítem que no estaba en el presupuesto" size="sm">
      <div className="space-y-4">
        <div>
          <label className="text-[12px] font-medium text-[#6e6e73] block mb-1.5">Descripción</label>
          <input autoFocus value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key==='Enter'&&handle()} placeholder="Ej: Reparación urgente" className="mac-input" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {['egreso','ingreso'].map(t => (
            <button key={t} onClick={() => setType(t)} className="py-2 rounded-lg text-[13px] font-medium transition-all"
              style={{ background: type===t?(t==='ingreso'?'rgba(52,199,89,0.1)':'rgba(255,59,48,0.08)'):'rgba(0,0,0,0.04)', color: type===t?(t==='ingreso'?'#34c759':'#ff3b30'):'#6e6e73', border: type===t?`1px solid ${t==='ingreso'?'rgba(52,199,89,0.25)':'rgba(255,59,48,0.2)'}`:'1px solid transparent' }}>
              {t === 'ingreso' ? 'Ingreso' : 'Egreso'}
            </button>
          ))}
        </div>
        {cats.length > 0 && (
          <div>
            <label className="text-[12px] font-medium text-[#6e6e73] block mb-1.5">Categoría</label>
            <div className="flex flex-wrap gap-1.5">
              {cats.map(cat => (
                <button key={cat.id} onClick={() => setCatId(cat.id)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-medium transition-all"
                  style={{ background: catId===cat.id?cat.color+'18':'rgba(0,0,0,0.04)', color: catId===cat.id?cat.color:'#6e6e73', border: catId===cat.id?`1px solid ${cat.color}40`:'1px solid transparent' }}>
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <label className="text-[12px] font-medium text-[#6e6e73] block mb-1.5">Monto</label>
          <input type="number" value={presupuesto} onChange={e => setPresupuesto(e.target.value)} placeholder="0" className="mac-input" />
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="mac-btn mac-btn-secondary flex-1 justify-center">Cancelar</button>
          <button onClick={handle} disabled={!name.trim()} className="mac-btn mac-btn-primary flex-1 justify-center disabled:opacity-40">Añadir</button>
        </div>
      </div>
    </Modal>
  )
}

// ── Inline editable number ─────────────────────────────────────────────────
function EditableNum({ value, onSave, locked, color, align = 'right', placeholder }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
  React.useEffect(() => { setVal(value) }, [value])
  if (locked) return <span className="text-[13px] mono" style={{ color: color || '#1d1d1f' }}>{fmt(value)}</span>
  if (editing) return (
    <input autoFocus type="number" value={val} onChange={e => setVal(e.target.value)}
      onBlur={() => { onSave(Number(val)||0); setEditing(false) }}
      onKeyDown={e => { if(e.key==='Enter') e.target.blur() }}
      className="mac-input" style={{ padding:'4px 8px', fontSize:'13px', textAlign: align, width:'100px' }} />
  )
  return (
    <button onClick={() => setEditing(true)}
      className="text-[13px] mono hover:underline transition-colors text-right w-full group flex items-center justify-end gap-1"
      style={{ color: color || '#1d1d1f' }}>
      {fmt(value)}
      <Pencil size={10} className="opacity-0 group-hover:opacity-40 shrink-0" />
    </button>
  )
}

// ── Pagado parcial modal ───────────────────────────────────────────────────
function PagoParcialModal({ open, onClose, item, onSave }) {
  const [monto, setMonto] = useState('')
  React.useEffect(() => {
    if (open) setMonto(item?.pagadoParcial > 0 ? String(item.pagadoParcial) : '')
  }, [open, item])

  if (!item) return null
  const pct = item.presupuesto > 0 ? Math.min(100, Math.round((Number(monto)||0) / item.presupuesto * 100)) : 0
  const restante = item.presupuesto - (Number(monto)||0)

  return (
    <Modal open={open} onClose={onClose} title="Pago parcial" subtitle={item.name} size="sm">
      <div className="space-y-4">
        <div className="rounded-xl p-3.5" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)' }}>
          <div className="flex justify-between text-[12px] text-[#86868b] mb-2">
            <span>Presupuesto total</span>
            <span className="font-semibold mono text-[#1d1d1f]">{fmt(item.presupuesto)}</span>
          </div>
          {/* Progress bar preview */}
          <div className="h-2 bg-black/6 rounded-full overflow-hidden mb-2">
            <div className="h-full rounded-full transition-all duration-300"
                 style={{ width: `${pct}%`, background: pct >= 100 ? '#34c759' : '#0071e3' }} />
          </div>
          <div className="flex justify-between text-[11px]">
            <span style={{ color: '#0071e3' }}>{pct}% pagado</span>
            <span className="text-[#86868b]">Restante: {fmt(Math.max(0, restante))}</span>
          </div>
        </div>
        <div>
          <label className="text-[12px] font-medium text-[#6e6e73] block mb-1.5">¿Cuánto has pagado hasta ahora?</label>
          <input autoFocus type="number" value={monto} onChange={e => setMonto(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (onSave(Number(monto)||0), onClose())}
            placeholder="Ej: 25000" className="mac-input" />
          <p className="text-[11px] text-[#86868b] mt-1.5">
            Cuando llegue al 100% del presupuesto se marcará como Pagado automáticamente.
          </p>
        </div>
        {/* Quick pct buttons */}
        <div className="flex gap-2">
          {[25,50,75,100].map(p => (
            <button key={p} onClick={() => setMonto(String(Math.round(item.presupuesto * p / 100)))}
              className="flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-all"
              style={{ background: pct===p?'rgba(0,113,227,0.1)':'rgba(0,0,0,0.04)', color: pct===p?'#0071e3':'#6e6e73', border: pct===p?'1px solid rgba(0,113,227,0.25)':'1px solid transparent' }}>
              {p}%
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="mac-btn mac-btn-secondary flex-1 justify-center">Cancelar</button>
          <button onClick={() => { onSave(Number(monto)||0); onClose() }} className="mac-btn mac-btn-primary flex-1 justify-center">Guardar</button>
        </div>
      </div>
    </Modal>
  )
}

// ── Egreso row with partial payment bar ───────────────────────────────────
function EgresoRow({ item, locked, monthKey, catMap }) {
  const { setReal, setEstado, updateExtraItem, deleteExtraItem, setPagadoParcial, setPresupuestoOverride } = useStore()
  const [parcialOpen, setParcialOpen] = useState(false)

  const cat = catMap[item.catId]
  const pagado = item.pagadoParcial || 0
  const pct = item.presupuesto > 0 ? Math.min(100, Math.round(pagado / item.presupuesto * 100)) : 0
  const diff = item.presupuesto - item.real
  const hasParcial = pagado > 0 && item.estado !== 'pagado'

  const handleEstado = () => {
    const next = item.estado === 'pagado' ? 'pendiente' : 'pagado'
    item.esExtra ? updateExtraItem(monthKey, item.id, 'estado', next) : setEstado(monthKey, item.id, next)
  }

  const handleParcial = (monto) => {
    setPagadoParcial(monthKey, item.id, monto)
    // Also update the real field to reflect what's been paid
    if (!item.esExtra) setReal(monthKey, item.id, 'egreso', monto)
    else updateExtraItem(monthKey, item.id, 'real', monto)
  }

  return (
    <>
      <tr className="group hover:bg-black/[0.015] transition-colors" style={{ borderBottom: hasParcial ? 'none' : '1px solid rgba(0,0,0,0.04)' }}>
        <td className="px-4 py-2.5">
          <div className="flex items-center gap-2">
            {item.esArrastre && <RotateCcw size={11} className="shrink-0" style={{ color:'#ff9f0a' }} />}
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[13px] shrink-0"
                 style={{ background: cat ? cat.color+'18' : '#f5f5f7' }}>{cat?.icon||'📌'}</div>
            <div>
              <span className="text-[13px] font-medium text-[#1d1d1f]">{item.name}</span>
              {item.esExtra && !item.esArrastre && <span className="ml-1.5 text-[10px] text-[#86868b] bg-black/5 rounded px-1.5 py-0.5">puntual</span>}
              {item.esArrastre && <span className="ml-1.5 text-[10px] rounded px-1.5 py-0.5" style={{background:'rgba(255,159,10,0.1)',color:'#ff9f0a'}}>arrastre</span>}
            </div>
          </div>
        </td>

        {/* Presupuesto — editable per-month */}
        <td className="px-3 py-2.5 text-right">
          {item.esExtra
            ? <EditableNum value={item.presupuesto} locked={locked}
                onSave={v => updateExtraItem(monthKey, item.id, 'presupuesto', v)} />
            : <EditableNum value={item.presupuesto} locked={locked}
                onSave={v => { setPresupuestoOverride(monthKey, item.id, v); showToast('Presupuesto ajustado solo para este mes') }} />
          }
        </td>

        {/* Real */}
        <td className="px-3 py-2.5 text-right">
          {item.esExtra
            ? <EditableNum value={item.real} locked={locked} onSave={v => updateExtraItem(monthKey, item.id, 'real', v)} />
            : <EditableNum value={item.real} locked={locked} onSave={v => setReal(monthKey, item.id, 'egreso', v)} />
          }
        </td>

        {/* Diferencia */}
        <td className="px-3 py-2.5 text-right">
          <span className="text-[13px] font-medium mono" style={{ color: diff>=0?'#34c759':'#ff3b30' }}>
            {diff>=0?'+':''}{fmt(diff)}
          </span>
        </td>

        {/* Estado + pago parcial */}
        <td className="px-4 py-2.5">
          {locked
            ? <span className="text-[12px] font-medium" style={{ color: item.estado==='pagado'?'#34c759':'#ff9f0a' }}>{item.estado==='pagado'?'Pagado':'Pendiente'}</span>
            : (
              <div className="flex items-center gap-1.5 flex-wrap">
                <button onClick={handleEstado}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[12px] font-medium transition-all"
                  style={{ background: item.estado==='pagado'?'rgba(52,199,89,0.1)':'rgba(255,159,10,0.08)', color: item.estado==='pagado'?'#34c759':'#ff9f0a', border: item.estado==='pagado'?'1px solid rgba(52,199,89,0.25)':'1px solid rgba(255,159,10,0.2)' }}>
                  {item.estado==='pagado'?<><Check size={11}/> Pagado</>:<>Pendiente</>}
                </button>
                {/* Pago parcial button */}
                {item.estado !== 'pagado' && (
                  <button onClick={() => setParcialOpen(true)}
                    className="px-2 py-1 rounded-lg text-[11px] font-medium transition-all"
                    style={{ background: hasParcial?'rgba(0,113,227,0.1)':'rgba(0,0,0,0.04)', color: hasParcial?'#0071e3':'#86868b', border: hasParcial?'1px solid rgba(0,113,227,0.2)':'1px solid transparent' }}>
                    {hasParcial ? `${pct}%` : 'Parcial'}
                  </button>
                )}
                {item.esExtra && <button onClick={() => deleteExtraItem(monthKey, item.id)} className="w-5 h-5 flex items-center justify-center rounded text-[#c7c7cc] hover:text-[#ff3b30] opacity-0 group-hover:opacity-100 transition-all text-[16px] leading-none">×</button>}
              </div>
            )
          }
        </td>
      </tr>

      {/* Partial payment progress bar row */}
      {hasParcial && (
        <tr style={{ borderBottom:'1px solid rgba(0,0,0,0.04)' }}>
          <td colSpan={5} className="px-4 pb-2.5 pt-0">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-black/6 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300"
                     style={{ width: `${pct}%`, background: '#0071e3' }} />
              </div>
              <span className="text-[11px] mono text-[#0071e3] font-medium shrink-0">{fmt(pagado)}</span>
              <span className="text-[11px] text-[#c7c7cc] shrink-0">/</span>
              <span className="text-[11px] mono text-[#86868b] shrink-0">{fmt(item.presupuesto)}</span>
              <span className="text-[11px] text-[#86868b] shrink-0">· resta {fmt(Math.max(0, item.presupuesto - pagado))}</span>
            </div>
          </td>
        </tr>
      )}

      <PagoParcialModal open={parcialOpen} onClose={() => setParcialOpen(false)} item={item} onSave={handleParcial} />
    </>
  )
}

// ── Ingreso row ────────────────────────────────────────────────────────────
function IngresoRow({ item, locked, monthKey, catMap }) {
  const { setReal, updateExtraItem, deleteExtraItem, setPresupuestoOverride } = useStore()
  const cat = catMap[item.catId]
  const diff = item.real - item.presupuesto
  return (
    <tr className="group hover:bg-black/[0.015] transition-colors" style={{ borderBottom:'1px solid rgba(0,0,0,0.04)' }}>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[13px] shrink-0"
               style={{ background: cat?cat.color+'18':'#f5f5f7' }}>{cat?.icon||'💰'}</div>
          <div>
            <span className="text-[13px] font-medium text-[#1d1d1f]">{item.name}</span>
            {item.esExtra && <span className="ml-1.5 text-[10px] text-[#86868b] bg-black/5 rounded px-1.5 py-0.5">puntual</span>}
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5 text-right">
        {item.esExtra
          ? <EditableNum value={item.presupuesto} locked={locked} onSave={v => updateExtraItem(monthKey, item.id, 'presupuesto', v)} />
          : <EditableNum value={item.presupuesto} locked={locked}
              onSave={v => { setPresupuestoOverride(monthKey, item.id, v); showToast('Presupuesto ajustado solo para este mes') }} />
        }
      </td>
      <td className="px-3 py-2.5 text-right">
        {item.esExtra
          ? <EditableNum value={item.real} locked={locked} onSave={v => updateExtraItem(monthKey, item.id, 'real', v)} />
          : <EditableNum value={item.real} locked={locked} onSave={v => setReal(monthKey, item.id, 'ingreso', v)} />
        }
      </td>
      <td className="px-3 py-2.5 text-right">
        <span className="text-[13px] font-medium mono" style={{ color: diff>=0?'#34c759':'#ff3b30' }}>
          {diff>=0?'+':''}{fmt(diff)}
        </span>
      </td>
      <td className="px-4 py-2.5">
        {item.esExtra && !locked && <button onClick={() => deleteExtraItem(monthKey, item.id)} className="w-5 h-5 flex items-center justify-center rounded text-[#c7c7cc] hover:text-[#ff3b30] opacity-0 group-hover:opacity-100 transition-all text-[16px] leading-none">×</button>}
      </td>
    </tr>
  )
}

// ── Monthly detail ─────────────────────────────────────────────────────────
function MonthlyView({ monthIdx, year }) {
  const { expenses, ingresos, categories, monthData: allMonthData, closedMonths,
          addExtraItem, closeMonth } = useStore()
  const [addOpen, setAddOpen] = useState(false)
  const [closeOpen, setCloseOpen] = useState(false)

  const key = getMonthKey(monthIdx, year)
  const locked = !!closedMonths[key]
  const md = allMonthData[key] || { realByExpense:{}, realByIngreso:{}, estado:{}, pagadoParcial:{}, presupuestoOverride:{}, saldoCierre:null, locked:false, extraItems:[] }
  const extraItems = md.extraItems || []
  const catMap = {}; categories.forEach(c => { catMap[c.id] = c })

  const monthExpenses = expenses.filter(e => e.monthKeys && e.monthKeys.includes(key))
  const monthIngresos = ingresos.filter(i => i.monthKeys && i.monthKeys.includes(key))
  const extraEgresos = extraItems.filter(i => i.type === 'egreso')
  const extraIngresos = extraItems.filter(i => i.type === 'ingreso')

  const allEgresos = [
    ...monthExpenses.map(e => ({
      id: e.id, name: e.name, catId: e.catId,
      presupuesto: md.presupuestoOverride?.[e.id] ?? e.presupuesto,
      real: md.realByExpense[e.id]||0,
      estado: md.estado[e.id]||'pendiente',
      pagadoParcial: md.pagadoParcial?.[e.id]||0,
      esExtra:false, esArrastre:false
    })),
    ...extraEgresos.map(e => ({ ...e, real: e.real||0, estado: e.estado||'pendiente', pagadoParcial: md.pagadoParcial?.[e.id]||0, esExtra:true, esArrastre:!!e.esArrastre })),
  ]
  const allIngresos = [
    ...monthIngresos.map(i => ({
      id: i.id, name: i.name, catId: i.catId,
      presupuesto: md.presupuestoOverride?.[i.id] ?? i.presupuesto,
      real: md.realByIngreso[i.id]||0, esExtra:false
    })),
    ...extraIngresos.map(i => ({ ...i, real: i.real||0, esExtra:true })),
  ]

  const totalPresupEg = allEgresos.reduce((s,e)=>s+e.presupuesto,0)
  const totalRealEg = allEgresos.reduce((s,e)=>s+e.real,0)
  const totalPresupIng = allIngresos.reduce((s,i)=>s+i.presupuesto,0)
  const totalRealIng = allIngresos.reduce((s,i)=>s+i.real,0)
  const saldoPresup = totalPresupIng - totalPresupEg
  const saldoReal = totalRealIng - totalRealEg
  const pendientes = allEgresos.filter(e => e.estado==='pendiente')
  const totalPagadoParcial = allEgresos.reduce((s,e)=>s+(e.pagadoParcial||0),0)

  const handleClose = (saldo) => {
    closeMonth(monthIdx, year, saldo)
    showToast(`Mes cerrado · ${pendientes.length} arrastre${pendientes.length!==1?'s':''} al mes siguiente`)
  }

  const SectionHeader = ({ label }) => (
    <tr>
      <td colSpan={5} className="px-4 py-2" style={{ background:'rgba(0,0,0,0.02)', borderTop:'1px solid rgba(0,0,0,0.05)', borderBottom:'1px solid rgba(0,0,0,0.05)' }}>
        <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">{label}</span>
      </td>
    </tr>
  )

  return (
    <>
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="mac-card px-4 py-3">
          <p className="text-[11px] text-[#86868b] mb-1.5 leading-tight">Ingresos presupuestados</p>
          <p className="text-[18px] font-semibold mono" style={{ color:'#34c759' }}>{fmt(totalPresupIng)}</p>
          <p className="text-[11px] text-[#86868b] mt-0.5">Real: {fmt(totalRealIng)}</p>
        </div>
        <div className="mac-card px-4 py-3">
          <p className="text-[11px] text-[#86868b] mb-1.5 leading-tight">Gastos presupuestados</p>
          <p className="text-[18px] font-semibold mono" style={{ color:'#ff3b30' }}>{fmt(totalPresupEg)}</p>
          <p className="text-[11px] text-[#86868b] mt-0.5">Real: {fmt(totalRealEg)}</p>
        </div>
        <div className="mac-card px-4 py-3">
          <p className="text-[11px] text-[#86868b] mb-1.5 leading-tight">Saldo presupuestado</p>
          <p className="text-[18px] font-semibold mono" style={{ color: saldoPresup>=0?'#34c759':'#ff3b30' }}>{fmt(saldoPresup)}</p>
          <p className="text-[11px] text-[#86868b] mt-0.5">Real: {fmt(saldoReal)}</p>
        </div>
        <div className="mac-card px-4 py-3">
          <p className="text-[11px] text-[#86868b] mb-1.5 leading-tight">Gastos pendientes</p>
          <p className="text-[18px] font-semibold mono" style={{ color: pendientes.length>0?'#ff9f0a':'#34c759' }}>{pendientes.length}</p>
          {totalPagadoParcial > 0 && <p className="text-[11px] mt-0.5" style={{ color:'#0071e3' }}>Parcial: {fmt(totalPagadoParcial)}</p>}
          {pendientes.length > 0 && totalPagadoParcial === 0 && <p className="text-[11px] text-[#86868b] mt-0.5">{fmt(pendientes.reduce((s,p)=>s+p.presupuesto,0))}</p>}
        </div>
      </div>

      {/* Table */}
      <div className="mac-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
          <div>
            <span className="text-[14px] font-semibold text-[#1d1d1f]">Detalle del mes</span>
            <span className="ml-2 text-[12px] text-[#86868b]">· Haz clic en cualquier monto para editarlo</span>
          </div>
          <div className="flex gap-2">
            {!locked && <>
              <button onClick={() => setAddOpen(true)} className="mac-btn mac-btn-secondary" style={{ padding:'5px 12px', fontSize:'13px' }}><Plus size={13}/> Puntual</button>
              <button onClick={() => setCloseOpen(true)} className="mac-btn mac-btn-secondary" style={{ padding:'5px 12px', fontSize:'13px' }}><Lock size={13}/> Cerrar mes</button>
            </>}
            {locked && <div className="flex items-center gap-1.5 text-[13px] text-[#86868b] px-3 py-1.5 rounded-lg bg-black/4"><Lock size={12}/> Cerrado · Saldo: {fmt(md.saldoCierre)}</div>}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(0,0,0,0.06)', background:'rgba(0,0,0,0.01)' }}>
                <th className="text-left px-4 py-2 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider w-[36%]">Concepto</th>
                <th className="text-right px-3 py-2 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider w-[15%]">Presupuesto</th>
                <th className="text-right px-3 py-2 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider w-[15%]">Real</th>
                <th className="text-right px-3 py-2 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider w-[12%]">Diferencia</th>
                <th className="px-4 py-2 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider w-[22%]">Estado</th>
              </tr>
            </thead>
            <tbody>
              {allIngresos.length > 0 && <>
                <SectionHeader label="Ingresos" />
                {allIngresos.map(item => <IngresoRow key={item.id} item={item} locked={locked} monthKey={key} catMap={catMap} />)}
              </>}
              {allEgresos.length > 0 && <>
                <SectionHeader label="Egresos" />
                {allEgresos.map(item => <EgresoRow key={item.id} item={item} locked={locked} monthKey={key} catMap={catMap} />)}
              </>}
              {allIngresos.length === 0 && allEgresos.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-[13px] text-[#86868b]">
                  Sin ítems este mes. Crea gastos/ingresos en la sección "Gastos".
                </td></tr>
              )}
            </tbody>
            <tfoot>
              <tr style={{ borderTop:'1px solid rgba(0,0,0,0.08)', background:'rgba(0,0,0,0.02)' }}>
                <td className="px-4 py-2.5 text-[12px] font-semibold text-[#6e6e73] uppercase tracking-wider">Saldo neto</td>
                <td className="px-3 py-2.5 text-right text-[14px] font-semibold mono text-[#1d1d1f]">{fmt(saldoPresup)}</td>
                <td className="px-3 py-2.5 text-right text-[14px] font-semibold mono" style={{ color: saldoReal>=0?'#34c759':'#ff3b30' }}>{fmt(saldoReal)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <AddExtraModal open={addOpen} onClose={() => setAddOpen(false)} categories={categories}
        onAdd={(name, type, catId, presupuesto) => { addExtraItem(key, name, type, catId, presupuesto); showToast('Ítem añadido') }} />
      <CloseModal open={closeOpen} onClose={() => setCloseOpen(false)} pendientes={pendientes}
        monthLabel={`${MONTHS[monthIdx]} ${year}`} onConfirm={handleClose} />
    </>
  )
}

// ── Annual overview ─────────────────────────────────────────────────────────
function AnnualView({ year, onMonthClick }) {
  const { expenses, ingresos, monthData, closedMonths, categories } = useStore()
  const [subView, setSubView] = useState('presupuesto') // 'presupuesto' | 'real'

  const monthStats = MONTHS.map((name, mIdx) => {
    const key = getMonthKey(mIdx, year)
    const md = monthData[key] || { realByExpense:{}, realByIngreso:{}, estado:{}, presupuestoOverride:{}, extraItems:[] }
    const extraItems = md.extraItems || []
    const monthExp = expenses.filter(e => e.monthKeys && e.monthKeys.includes(key))
    const monthIng = ingresos.filter(i => i.monthKeys && i.monthKeys.includes(key))
    const extraEg = extraItems.filter(i => i.type==='egreso')
    const extraIng = extraItems.filter(i => i.type==='ingreso')

    const presupEg = monthExp.reduce((s,e)=>s+(md.presupuestoOverride?.[e.id]??e.presupuesto),0) + extraEg.reduce((s,e)=>s+e.presupuesto,0)
    const presupIng = monthIng.reduce((s,i)=>s+(md.presupuestoOverride?.[i.id]??i.presupuesto),0) + extraIng.reduce((s,i)=>s+i.presupuesto,0)
    const realEg = monthExp.reduce((s,e)=>s+(md.realByExpense[e.id]||0),0) + extraEg.reduce((s,e)=>s+(e.real||0),0)
    const realIng = monthIng.reduce((s,i)=>s+(md.realByIngreso[i.id]||0),0) + extraIng.reduce((s,i)=>s+(i.real||0),0)
    const pendientes = monthExp.filter(e=>(md.estado[e.id]||'pendiente')==='pendiente').length + extraEg.filter(e=>(e.estado||'pendiente')==='pendiente').length

    return { mIdx, name: name.slice(0,3), key, presupEg, presupIng, realEg, realIng, saldoPresup: presupIng-presupEg, saldoReal: realIng-realEg, locked:!!closedMonths[key], pendientes, hasData: presupEg>0||presupIng>0 }
  })

  const totals = monthStats.reduce((acc, m) => ({
    presupIng: acc.presupIng+m.presupIng, presupEg: acc.presupEg+m.presupEg,
    realIng: acc.realIng+m.realIng, realEg: acc.realEg+m.realEg,
  }), { presupIng:0, presupEg:0, realIng:0, realEg:0 })

  const now = new Date(); const currentKey = getMonthKey(now.getMonth(), now.getFullYear())

  // Acumulados progresivos
  let acumPresup = 0, acumReal = 0
  const acumulados = monthStats.map(m => {
    acumPresup += m.saldoPresup
    if (m.key <= currentKey) {
      const md = monthData[m.key]
      if (closedMonths[m.key] && md?.saldoCierre != null) acumReal = md.saldoCierre
      else acumReal += m.saldoReal
    }
    return { acumPresup, acumReal, hasReal: m.key <= currentKey }
  })

  // Rows for each subview
  const presupRows = [
    { label: 'Ingresos', key: 'presupIng', color: '#34c759', fmt: v => v > 0 ? fmt(v) : '—' },
    { label: 'Gastos', key: 'presupEg', color: '#ff3b30', fmt: v => v > 0 ? fmt(v) : '—', topBorder: true },
    { label: 'Saldo mes', key: 'saldoPresup', colorFn: v => v>=0?'#34c759':'#ff3b30', fmt: (v,m) => m.hasData?fmt(v):'—', topBorder: true, bold: true },
    {
      label: 'Flujo acum.', key: '__acumP', bold: true,
      colorFn: (v,i) => acumulados[i].acumPresup>=0?'#0071e3':'#ff3b30',
      fmt: (v,m,i) => (m.hasData||acumulados[i].acumPresup!==0)?fmt(acumulados[i].acumPresup):'—',
      totalFn: () => fmt(acumulados[11].acumPresup),
    },
  ]

  const realRows = [
    { label: 'Ingresos real', key: 'realIng', color: '#34c759', fmt: (v,m) => m.key<=currentKey?(v>0?fmt(v):'—'):'' },
    { label: 'Gastos real', key: 'realEg', color: '#ff3b30', fmt: (v,m) => m.key<=currentKey?(v>0?fmt(v):'—'):'', topBorder: true },
    { label: 'Saldo mes', key: 'saldoReal', colorFn: v=>v>=0?'#34c759':'#ff3b30', fmt: (v,m) => m.key<=currentKey&&m.hasData?fmt(v):'', topBorder: true, bold: true },
    {
      label: 'Flujo acum.', key: '__acumR', bold: true,
      colorFn: (v,i) => acumulados[i].acumReal>=0?'#0071e3':'#ff3b30',
      fmt: (v,m,i) => acumulados[i].hasReal?fmt(acumulados[i].acumReal):'',
      totalFn: () => { const last=[...acumulados].reverse().find(a=>a.hasReal); return last?fmt(last.acumReal):'—' },
    },
  ]

  const rows = subView === 'presupuesto' ? presupRows : realRows

  const ColHeader = ({ m }) => {
    const isCurrent = m.key === currentKey
    return (
      <th onClick={() => onMonthClick(m.mIdx)}
        className="cursor-pointer px-3 py-2.5 text-center min-w-[78px]"
        style={{ background: isCurrent?'rgba(0,113,227,0.05)':'transparent', borderLeft:'1px solid rgba(0,0,0,0.04)' }}>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[12px] font-semibold" style={{ color: isCurrent?'#0071e3':'#1d1d1f' }}>{m.name}</span>
          {m.locked && <Lock size={9} style={{ color:'#c7c7cc' }} />}
          {isCurrent && !m.locked && <div className="w-1 h-1 rounded-full bg-[#0071e3]" />}
        </div>
      </th>
    )
  }

  return (
    <div className="space-y-4">
      {/* Year summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:`Ingresos ${year}`, val:fmt(totals.presupIng), color:'#34c759', sub:`Real: ${fmt(totals.realIng)}` },
          { label:`Gastos ${year}`, val:fmt(totals.presupEg), color:'#ff3b30', sub:`Real: ${fmt(totals.realEg)}` },
          { label:'Saldo proyectado', val:fmt(totals.presupIng-totals.presupEg), color:(totals.presupIng-totals.presupEg)>=0?'#34c759':'#ff3b30' },
          { label:'Flujo real acumulado', val:fmt(acumulados[acumulados.findIndex(a=>!a.hasReal)-1]?.acumReal ?? acumulados[11].acumReal), color:acumReal>=0?'#0071e3':'#ff3b30' },
        ].map(c => (
          <div key={c.label} className="mac-card px-4 py-3">
            <p className="text-[11px] text-[#86868b] mb-1">{c.label}</p>
            <p className="text-[18px] font-semibold mono" style={{ color:c.color }}>{c.val}</p>
            {c.sub && <p className="text-[11px] text-[#86868b] mt-0.5">{c.sub}</p>}
          </div>
        ))}
      </div>

      {/* Table with subview toggle */}
      <div className="mac-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
          <span className="text-[14px] font-semibold text-[#1d1d1f]">Resumen mes a mes</span>
          {/* Subview toggle */}
          <div className="flex rounded-lg p-0.5 gap-0.5" style={{ background:'rgba(0,0,0,0.06)' }}>
            {[['presupuesto','Presupuestado'],['real','Real']].map(([v,label]) => (
              <button key={v} onClick={() => setSubView(v)}
                className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-all"
                style={{ background: subView===v?'white':'transparent', color: subView===v?'#1d1d1f':'#6e6e73', boxShadow: subView===v?'0 1px 3px rgba(0,0,0,0.08)':'none' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <table style={{ minWidth:'900px', width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'rgba(0,0,0,0.015)', borderBottom:'1px solid rgba(0,0,0,0.07)' }}>
                <th className="sticky left-0 z-10 text-left px-4 py-2.5 text-[11px] font-semibold text-[#86868b] uppercase tracking-wider w-[130px]"
                    style={{ background:'rgba(249,249,251,0.97)', borderRight:'1px solid rgba(0,0,0,0.06)' }}>
                  Concepto
                </th>
                {monthStats.map(m => <ColHeader key={m.mIdx} m={m} />)}
                <th className="px-3 py-2.5 text-center min-w-[88px]"
                    style={{ borderLeft:'1px solid rgba(0,0,0,0.08)', background:'rgba(0,0,0,0.015)' }}>
                  <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Total</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const isCustom = row.key.startsWith('__')
                const totalVal = isCustom ? null : monthStats.reduce((s,m) => s+(m[row.key]||0), 0)
                return (
                  <tr key={row.key} style={{ borderTop: row.topBorder?'1px solid rgba(0,0,0,0.07)':'1px solid rgba(0,0,0,0.035)' }}>
                    <td className="sticky left-0 z-10 px-4 py-2.5"
                        style={{ background:'rgba(249,249,251,0.97)', borderRight:'1px solid rgba(0,0,0,0.06)' }}>
                      <span className="text-[12px] font-medium text-[#86868b]">{row.label}</span>
                    </td>
                    {monthStats.map((m, i) => {
                      const rawVal = isCustom
                        ? (row.key==='__acumP' ? acumulados[i].acumPresup : acumulados[i].acumReal)
                        : (m[row.key]||0)
                      const display = row.fmt(rawVal, m, i)
                      const cellColor = row.colorFn ? row.colorFn(rawVal, i) : ((!display||display==='—') ? '#d1d1d6' : row.color)
                      const isCurrent = m.key === currentKey
                      return (
                        <td key={m.mIdx} className="px-3 py-2.5 text-center"
                            style={{ borderLeft:'1px solid rgba(0,0,0,0.04)', background: isCurrent?'rgba(0,113,227,0.03)':'transparent' }}>
                          <span className={`text-[12px] mono ${row.bold?'font-semibold':''}`}
                                style={{ color: display&&display!=='—' ? cellColor : '#d1d1d6' }}>
                            {display||''}
                          </span>
                        </td>
                      )
                    })}
                    <td className="px-3 py-2.5 text-center"
                        style={{ borderLeft:'1px solid rgba(0,0,0,0.08)', background:'rgba(0,0,0,0.015)' }}>
                      <span className={`text-[12px] mono ${row.bold?'font-semibold':''}`}
                            style={{ color: row.colorFn ? row.colorFn(isCustom?(row.key==='__acumP'?acumulados[11].acumPresup:([...acumulados].reverse().find(a=>a.hasReal)?.acumReal||0)):totalVal, 11) : (totalVal>0?row.color:'#c7c7cc') }}>
                        {row.totalFn ? row.totalFn() : (totalVal!==0?fmt(totalVal):'—')}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {/* Estado row */}
              <tr style={{ borderTop:'1px solid rgba(0,0,0,0.07)' }}>
                <td className="sticky left-0 z-10 px-4 py-2.5"
                    style={{ background:'rgba(249,249,251,0.97)', borderRight:'1px solid rgba(0,0,0,0.06)' }}>
                  <span className="text-[12px] font-medium text-[#86868b]">Estado</span>
                </td>
                {monthStats.map(m => {
                  const isCurrent = m.key === currentKey
                  return (
                    <td key={m.mIdx} className="px-2 py-2.5 text-center"
                        style={{ borderLeft:'1px solid rgba(0,0,0,0.04)', background: isCurrent?'rgba(0,113,227,0.03)':'transparent' }}>
                      {m.locked ? <span className="text-[10px] text-[#c7c7cc]">Cerrado</span>
                        : m.pendientes>0 ? <span className="text-[10px] font-semibold" style={{color:'#ff9f0a'}}>{m.pendientes}⚠</span>
                        : m.hasData ? <span className="text-[10px] text-[#34c759]">✓</span>
                        : <span className="text-[10px] text-[#d1d1d6]">—</span>
                      }
                    </td>
                  )
                })}
                <td style={{ borderLeft:'1px solid rgba(0,0,0,0.08)', background:'rgba(0,0,0,0.015)' }} />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function MatrizView() {
  const { currentMonthIdx, currentYear, prevMonth, nextMonth, setCurrentMonth } = useStore()
  const [viewMode, setViewMode] = useState('monthly')
  const [annualYear, setAnnualYear] = useState(new Date().getFullYear())

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1d1d1f]">Finanzapp</h1>
          <p className="text-[13px] text-[#86868b] mt-0.5">
            {viewMode === 'monthly' ? `${MONTHS[currentMonthIdx]} ${currentYear}` : `Vista anual ${annualYear}`}
          </p>
        </div>
        <div className="flex rounded-xl p-1 gap-1" style={{ background:'rgba(0,0,0,0.06)' }}>
          <button onClick={() => setViewMode('monthly')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all"
            style={{ background: viewMode==='monthly'?'white':'transparent', color: viewMode==='monthly'?'#1d1d1f':'#6e6e73', boxShadow: viewMode==='monthly'?'0 1px 3px rgba(0,0,0,0.08)':'none' }}>
            <LayoutGrid size={13}/> Mes
          </button>
          <button onClick={() => setViewMode('annual')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all"
            style={{ background: viewMode==='annual'?'white':'transparent', color: viewMode==='annual'?'#1d1d1f':'#6e6e73', boxShadow: viewMode==='annual'?'0 1px 3px rgba(0,0,0,0.08)':'none' }}>
            <BarChart2 size={13}/> Año
          </button>
        </div>
      </div>

      {viewMode === 'monthly' && (
        <>
          <div className="flex items-center gap-3 mb-5">
            <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-xl text-[#6e6e73] hover:bg-black/6 transition-colors" style={{ border:'1px solid rgba(0,0,0,0.08)' }}>
              <ChevronLeft size={16} />
            </button>
            <h2 className="text-[17px] font-semibold text-[#1d1d1f]">{MONTHS[currentMonthIdx]} {currentYear}</h2>
            <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-xl text-[#6e6e73] hover:bg-black/6 transition-colors" style={{ border:'1px solid rgba(0,0,0,0.08)' }}>
              <ChevronRight size={16} />
            </button>
          </div>
          <MonthlyView monthIdx={currentMonthIdx} year={currentYear} />
        </>
      )}

      {viewMode === 'annual' && (
        <>
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => setAnnualYear(y => y-1)} className="w-8 h-8 flex items-center justify-center rounded-xl text-[#6e6e73] hover:bg-black/6 transition-colors" style={{ border:'1px solid rgba(0,0,0,0.08)' }}>
              <ChevronLeft size={16} />
            </button>
            <h2 className="text-[17px] font-semibold text-[#1d1d1f]">{annualYear}</h2>
            <button onClick={() => setAnnualYear(y => y+1)} className="w-8 h-8 flex items-center justify-center rounded-xl text-[#6e6e73] hover:bg-black/6 transition-colors" style={{ border:'1px solid rgba(0,0,0,0.08)' }}>
              <ChevronRight size={16} />
            </button>
          </div>
          <AnnualView year={annualYear} onMonthClick={(mIdx) => { setCurrentMonth(mIdx, annualYear); setViewMode('monthly') }} />
        </>
      )}
    </div>
  )
}
