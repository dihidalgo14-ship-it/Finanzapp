export const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
export const MONTHS_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export function getMonthKey(monthIdx, year) {
  return `${year}-${String(monthIdx + 1).padStart(2, '0')}`
}

export function parseMonthKey(key) {
  const [y, m] = key.split('-')
  return { year: parseInt(y), monthIdx: parseInt(m) - 1 }
}

export function fmt(n) {
  return '$' + Math.round(n || 0).toLocaleString('es-CL')
}

export function fmtShort(n) {
  const abs = Math.abs(n || 0)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1000000) return sign + '$' + (abs / 1000000).toFixed(1).replace('.0','') + 'M'
  if (abs >= 1000) return sign + '$' + Math.round(abs / 1000) + 'K'
  return fmt(n)
}

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export const CAT_COLORS = [
  '#0071e3','#34c759','#ff9f0a','#ff3b30','#bf5af2',
  '#5ac8fa','#ff6b35','#32ade6','#30d158','#ffd60a',
  '#636366','#ac8e68'
]
