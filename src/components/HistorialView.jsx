import React from 'react'
import { Lock, RotateCcw } from 'lucide-react'
import { useStore } from '../store/useStore'
import { MONTHS, getMonthKey, fmt, parseMonthKey } from '../utils/helpers'

export default function HistorialView() {
  const { closedMonths, monthData, expenses, ingresos, categories } = useStore()
  const catMap = {}; categories.forEach(c => { catMap[c.id] = c })
  const closed = Object.keys(closedMonths).sort().reverse()

  if (closed.length === 0) {
    return (
      <div>
        <div className="mb-5"><h1 className="text-[22px] font-semibold text-[#1d1d1f]">Historial</h1><p className="text-[13px] text-[#86868b] mt-0.5">Meses cerrados</p></div>
        <div className="mac-card flex flex-col items-center justify-center py-20 text-center">
          <Lock size={32} className="mb-3" style={{ color:'#c7c7cc' }} />
          <p className="text-[15px] font-medium text-[#6e6e73]">Sin historial aún</p>
          <p className="text-[13px] text-[#86868b] mt-1">Los meses cerrados aparecerán aquí</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5"><h1 className="text-[22px] font-semibold text-[#1d1d1f]">Historial</h1><p className="text-[13px] text-[#86868b] mt-0.5">{closed.length} mes{closed.length>1?'es':''} cerrado{closed.length>1?'s':''}</p></div>
      <div className="space-y-3">
        {closed.map(key => {
          const md = monthData[key] || { realByExpense:{}, realByIngreso:{}, extraItems:[] }
          const { monthIdx, year } = parseMonthKey(key)
          const extraItems = md.extraItems || []
          const monthExp = expenses.filter(e => e.monthKeys && e.monthKeys.includes(key))
          const monthIng = ingresos.filter(i => i.monthKeys && i.monthKeys.includes(key))
          const realEg = monthExp.reduce((s,e)=>s+(md.realByExpense[e.id]||0),0) + extraItems.filter(i=>i.type==='egreso').reduce((s,e)=>s+(e.real||0),0)
          const realIng = monthIng.reduce((s,i)=>s+(md.realByIngreso[i.id]||0),0) + extraItems.filter(i=>i.type==='ingreso').reduce((s,i)=>s+(i.real||0),0)
          const arrastres = extraItems.filter(i => i.esArrastre)
          return (
            <div key={key} className="mac-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-2">
                  <Lock size={13} style={{ color:'#c7c7cc' }} />
                  <span className="text-[15px] font-semibold text-[#1d1d1f]">{MONTHS[monthIdx]} {year}</span>
                </div>
                <span className="text-[13px] font-semibold mono" style={{ color: (realIng-realEg)>=0?'#34c759':'#ff3b30' }}>{fmt(realIng-realEg)}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4" style={{ borderBottom: arrastres.length>0?'1px solid rgba(0,0,0,0.06)':'none' }}>
                {[
                  { label:'Ingresos reales', val:fmt(realIng), color:'#34c759' },
                  { label:'Gastos reales', val:fmt(realEg), color:'#ff3b30' },
                  { label:'Saldo caja al cierre', val:fmt(md.saldoCierre||0), color:'#1d1d1f' },
                  { label:'Arrastres generados', val:arrastres.length.toString(), color: arrastres.length>0?'#ff9f0a':'#86868b' },
                ].map((c,i) => (
                  <div key={c.label} className="px-5 py-3" style={{ borderRight: i<3?'1px solid rgba(0,0,0,0.05)':'none' }}>
                    <p className="text-[11px] text-[#86868b] mb-0.5">{c.label}</p>
                    <p className="text-[14px] font-semibold mono" style={{ color:c.color }}>{c.val}</p>
                  </div>
                ))}
              </div>
              {arrastres.length > 0 && (
                <div className="px-5 py-3">
                  <div className="flex items-center gap-1.5 text-[12px] font-medium mb-2" style={{ color:'#ff9f0a' }}>
                    <RotateCcw size={12}/> Arrastrados al mes siguiente:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {arrastres.map(a => (
                      <div key={a.id} className="flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-lg" style={{ background:'rgba(255,159,10,0.08)', border:'1px solid rgba(255,159,10,0.2)', color:'#6e6e73' }}>
                        <span style={{ color:'#ff9f0a' }}>{catMap[a.catId]?.icon||'📌'}</span>
                        <span>{a.name}</span>
                        <span className="font-medium mono" style={{ color:'#1d1d1f' }}>{fmt(a.presupuesto)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
