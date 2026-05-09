import React from 'react'

const variants = {
  ingreso: 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50',
  egreso: 'bg-red-900/40 text-red-300 border-red-700/50',
  arrastre: 'bg-amber-900/40 text-amber-300 border-amber-700/50',
  pendiente: 'bg-amber-900/40 text-amber-300 border-amber-700/50',
  pagado: 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50',
  extra: 'bg-purple-900/40 text-purple-300 border-purple-700/50',
  cerrado: 'bg-slate-700/60 text-slate-300 border-slate-600/50',
  scheduled: 'bg-blue-900/40 text-blue-300 border-blue-700/50',
}

export default function Badge({ variant = 'egreso', children, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${variants[variant] || variants.egreso} ${className}`}>
      {children}
    </span>
  )
}
