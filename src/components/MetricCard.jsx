import React from 'react'

export default function MetricCard({ label, value, valueClass = '', icon: Icon, sub }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-slate-400 leading-tight">{label}</p>
        {Icon && <Icon size={14} className="text-slate-500 shrink-0 mt-0.5" />}
      </div>
      <p className={`text-lg sm:text-xl font-semibold mt-1.5 ${valueClass || 'text-white'}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  )
}
