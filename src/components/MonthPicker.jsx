import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MONTHS, getMonthKey } from '../utils/helpers'

export default function MonthPicker({ selected, onChange, accentColor = '#0071e3' }) {
  const now = new Date()
  const [calYear, setCalYear] = useState(now.getFullYear())
  const currentKey = getMonthKey(now.getMonth(), now.getFullYear())
  const selSet = new Set(selected)

  const toggle = (mIdx) => {
    const key = getMonthKey(mIdx, calYear)
    const next = new Set(selSet)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    onChange([...next])
  }

  const toggleYear = () => {
    const keys = MONTHS.map((_, i) => getMonthKey(i, calYear))
    const allSel = keys.every(k => selSet.has(k))
    const next = new Set(selSet)
    keys.forEach(k => allSel ? next.delete(k) : next.add(k))
    onChange([...next])
  }

  const toggleQuarter = (q) => {
    const months = [0,1,2].map(i => q*3+i)
    const keys = months.map(m => getMonthKey(m, calYear))
    const allSel = keys.every(k => selSet.has(k))
    const next = new Set(selSet)
    keys.forEach(k => allSel ? next.delete(k) : next.add(k))
    onChange([...next])
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.08)' }}>
      {/* Year nav */}
      <div className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <button onClick={() => setCalYear(y => y - 1)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors text-[#6e6e73]">
          <ChevronLeft size={14} />
        </button>
        <button onClick={toggleYear} className="text-[13px] font-semibold text-[#1d1d1f] hover:text-[#0071e3] transition-colors px-2">
          {calYear}
        </button>
        <button onClick={() => setCalYear(y => y + 1)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors text-[#6e6e73]">
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Quarter shortcuts */}
      <div className="flex gap-1 px-3 py-2">
        {['T1','T2','T3','T4'].map((q,i) => (
          <button key={q} onClick={() => toggleQuarter(i)}
            className="flex-1 py-1 rounded-md text-[11px] font-medium transition-colors"
            style={{ background: 'rgba(0,0,0,0.04)', color: '#6e6e73' }}>
            {q}
          </button>
        ))}
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-4 gap-1 px-3 pb-3">
        {MONTHS.map((name, mIdx) => {
          const key = getMonthKey(mIdx, calYear)
          const isSel = selSet.has(key)
          const isCurrent = key === currentKey
          return (
            <button key={mIdx} onClick={() => toggle(mIdx)}
              className="py-2 rounded-lg text-[12px] font-medium transition-all relative"
              style={{
                background: isSel ? accentColor : isCurrent ? 'rgba(0,113,227,0.06)' : 'transparent',
                color: isSel ? 'white' : isCurrent ? '#0071e3' : '#1d1d1f',
                border: isCurrent && !isSel ? '1px solid rgba(0,113,227,0.3)' : '1px solid transparent',
              }}>
              {name.slice(0,3)}
            </button>
          )
        })}
      </div>

      {selected.length > 0 && (
        <div className="px-3 pb-3 flex justify-between items-center">
          <span className="text-[11px] text-[#86868b]">{selected.length} mes{selected.length > 1 ? 'es' : ''} seleccionado{selected.length > 1 ? 's' : ''}</span>
          <button onClick={() => onChange([])} className="text-[11px] text-[#ff3b30] hover:underline">Limpiar</button>
        </div>
      )}
    </div>
  )
}
