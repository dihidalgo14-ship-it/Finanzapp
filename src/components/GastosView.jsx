import React, { useState } from 'react'
import { Plus, Pencil, Trash2, TrendingDown, TrendingUp } from 'lucide-react'
import { useStore } from '../store/useStore'
import { MONTHS_SHORT, fmt, getMonthKey, parseMonthKey } from '../utils/helpers'
import Modal from './Modal'
import MonthPicker from './MonthPicker'
import { showToast } from './Toast'

function ItemFormModal({ open, onClose, onSave, initial, categories, itemType = 'egreso' }) {
  const cats = categories.filter(c => c.type === itemType)
  const [name, setName] = useState('')
  const [catId, setCatId] = useState('')
  const [presupuesto, setPresupuesto] = useState('')
  const [monthKeys, setMonthKeys] = useState([])

  React.useEffect(() => {
    if (!open) return
    setName(initial?.name || '')
    setCatId(initial?.catId || cats[0]?.id || '')
    setPresupuesto(initial?.presupuesto ? String(initial.presupuesto) : '')
    setMonthKeys(initial?.monthKeys || [])
  }, [open, initial])

  const handleSave = () => {
    if (!name.trim() || !presupuesto || monthKeys.length === 0) return
    onSave({ name: name.trim(), catId, presupuesto: Number(presupuesto), monthKeys })
    onClose()
  }

  const isIncome = itemType === 'ingreso'
  const accent = isIncome ? '#34c759' : '#0071e3'
  const title = initial ? `Editar ${isIncome ? 'ingreso' : 'gasto'}` : `Nuevo ${isIncome ? 'ingreso' : 'gasto'}`

  return (
    <Modal open={open} onClose={onClose} title={title}
      subtitle="Selecciona los meses en que aplica" size="md">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[12px] font-medium text-[#6e6e73] block mb-1.5">Nombre / descripción</label>
            <input autoFocus value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder={isIncome ? 'Ej: Honorarios mayo' : 'Ej: Crédito auto'}
              className="mac-input" />
          </div>
          <div>
            <label className="text-[12px] font-medium text-[#6e6e73] block mb-1.5">Monto por mes</label>
            <input type="number" value={presupuesto} onChange={e => setPresupuesto(e.target.value)}
              placeholder="0" className="mac-input" />
          </div>
        </div>

        <div>
          <label className="text-[12px] font-medium text-[#6e6e73] block mb-1.5">Categoría</label>
          {cats.length === 0 ? (
            <p className="text-[13px] text-[#86868b] py-2">Sin categorías de {isIncome ? 'ingreso' : 'egreso'}. Crea una primero.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {cats.map(cat => (
                <button key={cat.id} onClick={() => setCatId(cat.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-medium transition-all"
                  style={{
                    background: catId === cat.id ? cat.color + '18' : 'rgba(0,0,0,0.04)',
                    color: catId === cat.id ? cat.color : '#6e6e73',
                    border: catId === cat.id ? `1px solid ${cat.color}40` : '1px solid transparent',
                  }}>
                  <span>{cat.icon}</span> {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-[12px] font-medium text-[#6e6e73] block mb-1.5">Meses que aplica</label>
          <MonthPicker selected={monthKeys} onChange={setMonthKeys} accentColor={accent} />
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="mac-btn mac-btn-secondary flex-1 justify-center">Cancelar</button>
          <button onClick={handleSave} disabled={!name.trim() || !presupuesto || monthKeys.length === 0}
            className="mac-btn mac-btn-primary flex-1 justify-center disabled:opacity-40">
            {initial ? 'Guardar' : `Crear (${monthKeys.length} ${monthKeys.length === 1 ? 'mes' : 'meses'})`}
          </button>
        </div>
      </div>
    </Modal>
  )
}

function ItemCard({ item, categories, onEdit, onDelete, type }) {
  const cat = categories.find(c => c.id === item.catId)
  const sorted = [...item.monthKeys].sort()
  const now = getMonthKey(new Date().getMonth(), new Date().getFullYear())
  const done = sorted.filter(k => k <= now).length
  const total = sorted.length
  const pct = total > 0 ? (done / total) * 100 : 0
  const isActive = sorted.some(k => k === now)
  const isPast = sorted[sorted.length-1] < now
  const isIncome = type === 'ingreso'

  return (
    <div className="flex items-start gap-3 px-4 py-3.5 group rounded-xl hover:bg-black/2 transition-colors"
         style={{ borderTop: '1px solid rgba(0,0,0,0.05)' }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[18px] shrink-0 mt-0.5"
           style={{ background: cat ? cat.color + '18' : '#f5f5f7' }}>
        {cat?.icon || '📌'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[14px] font-semibold text-[#1d1d1f]">{item.name}</span>
          {isActive && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: isIncome ? 'rgba(52,199,89,0.12)' : 'rgba(0,113,227,0.1)', color: isIncome ? '#34c759' : '#0071e3' }}>Activo</span>}
          {isPast && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-black/5 text-[#86868b]">Completado</span>}
        </div>
        <div className="flex items-center gap-2 mb-2">
          {cat && <span className="text-[12px] text-[#86868b]">{cat.name}</span>}
          <span className="text-[12px] text-[#86868b]">·</span>
          <span className="text-[12px] font-medium mono" style={{ color: isIncome ? '#34c759' : '#1d1d1f' }}>{fmt(item.presupuesto)}/mes</span>
          <span className="text-[12px] text-[#86868b]">·</span>
          <span className="text-[12px] text-[#86868b]">Total: {fmt(item.presupuesto * total)}</span>
        </div>
        {/* Month chips */}
        <div className="flex flex-wrap gap-1 mb-2">
          {sorted.map(k => {
            const { monthIdx, year } = parseMonthKey(k)
            const isCurr = k === now
            const past = k < now
            return (
              <span key={k} className="text-[11px] px-1.5 py-0.5 rounded-md font-medium"
                style={{ background: isCurr ? (cat?.color || '#0071e3') + '18' : past ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.05)', color: isCurr ? (cat?.color || '#0071e3') : past ? '#c7c7cc' : '#6e6e73', textDecoration: past && !isCurr ? 'line-through' : 'none' }}>
                {MONTHS_SHORT[monthIdx]} {year !== new Date().getFullYear() ? year : ''}
              </span>
            )
          })}
        </div>
        {/* Progress */}
        {done > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-black/6 overflow-hidden max-w-[100px]">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: isPast ? '#c7c7cc' : (cat?.color || '#0071e3') }} />
            </div>
            <span className="text-[11px] text-[#86868b]">{done}/{total}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
        {!isPast && (
          <button onClick={onEdit} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#6e6e73] hover:bg-black/6">
            <Pencil size={13} />
          </button>
        )}
        <button onClick={onDelete} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#ff3b30] hover:bg-[#ff3b30]/08">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

function Section({ title, icon: Icon, iconColor, items, categories, type, onAdd, onEdit, onDelete }) {
  return (
    <div className="mac-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-2">
          <Icon size={15} style={{ color: iconColor }} />
          <span className="text-[15px] font-semibold text-[#1d1d1f]">{title}</span>
          <span className="text-[12px] text-[#86868b] bg-black/5 rounded-full px-2 py-0.5">{items.length}</span>
        </div>
        <button onClick={onAdd} className="mac-btn mac-btn-secondary" style={{ padding: '5px 12px', fontSize: '13px' }}>
          <Plus size={13} /> Añadir
        </button>
      </div>
      {items.length === 0 && (
        <div className="px-5 py-8 text-center">
          <p className="text-[13px] text-[#86868b]">Sin {type === 'ingreso' ? 'ingresos' : 'gastos'} programados</p>
          <button onClick={onAdd} className="mt-2 text-[13px] text-[#0071e3] hover:underline">Añadir el primero</button>
        </div>
      )}
      {items.map(item => (
        <ItemCard key={item.id} item={item} categories={categories} type={type}
          onEdit={() => onEdit(item)} onDelete={() => onDelete(item)} />
      ))}
    </div>
  )
}

export default function GastosView() {
  const { expenses, ingresos, categories, addExpense, updateExpense, deleteExpense, addIngreso, updateIngreso, deleteIngreso } = useStore()
  const [modal, setModal] = useState(null) // { type:'egreso'|'ingreso', item?:... }

  const handleSaveExpense = (data) => {
    if (modal?.item) { updateExpense(modal.item.id, data); showToast('Gasto actualizado') }
    else { addExpense(data); showToast(`Gasto creado en ${data.monthKeys.length} mes${data.monthKeys.length > 1 ? 'es' : ''}`) }
  }

  const handleSaveIngreso = (data) => {
    if (modal?.item) { updateIngreso(modal.item.id, data); showToast('Ingreso actualizado') }
    else { addIngreso(data); showToast(`Ingreso creado en ${data.monthKeys.length} mes${data.monthKeys.length > 1 ? 'es' : ''}`) }
  }

  const handleDelete = (item, type) => {
    if (!window.confirm(`¿Eliminar "${item.name}"?`)) return
    if (type === 'egreso') { deleteExpense(item.id); showToast('Gasto eliminado', 'info') }
    else { deleteIngreso(item.id); showToast('Ingreso eliminado', 'info') }
  }

  // Summary
  const now = getMonthKey(new Date().getMonth(), new Date().getFullYear())
  const activeExpenses = expenses.filter(e => e.monthKeys.includes(now))
  const activeIngresos = ingresos.filter(i => i.monthKeys.includes(now))
  const totalExpMonth = activeExpenses.reduce((s, e) => s + e.presupuesto, 0)
  const totalIngMonth = activeIngresos.reduce((s, i) => s + i.presupuesto, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1d1d1f]">Gastos e Ingresos</h1>
          <p className="text-[13px] text-[#86868b] mt-0.5">Define presupuesto por categoría y selecciona los meses que aplica</p>
        </div>
      </div>

      {/* This month summary */}
      {(activeExpenses.length > 0 || activeIngresos.length > 0) && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="mac-card px-4 py-3">
            <p className="text-[12px] text-[#86868b] mb-1">Ingresos este mes</p>
            <p className="text-[20px] font-semibold mono" style={{ color: '#34c759' }}>{fmt(totalIngMonth)}</p>
            <p className="text-[11px] text-[#86868b] mt-0.5">{activeIngresos.length} ítem{activeIngresos.length > 1 ? 's' : ''}</p>
          </div>
          <div className="mac-card px-4 py-3">
            <p className="text-[12px] text-[#86868b] mb-1">Gastos este mes</p>
            <p className="text-[20px] font-semibold mono" style={{ color: '#ff3b30' }}>{fmt(totalExpMonth)}</p>
            <p className="text-[11px] text-[#86868b] mt-0.5">{activeExpenses.length} ítem{activeExpenses.length > 1 ? 's' : ''}</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <Section title="Ingresos programados" icon={TrendingUp} iconColor="#34c759" items={ingresos} categories={categories} type="ingreso"
          onAdd={() => setModal({ type: 'ingreso' })}
          onEdit={(item) => setModal({ type: 'ingreso', item })}
          onDelete={(item) => handleDelete(item, 'ingreso')} />

        <Section title="Gastos programados" icon={TrendingDown} iconColor="#ff3b30" items={expenses} categories={categories} type="egreso"
          onAdd={() => setModal({ type: 'egreso' })}
          onEdit={(item) => setModal({ type: 'egreso', item })}
          onDelete={(item) => handleDelete(item, 'egreso')} />
      </div>

      <ItemFormModal
        open={!!modal}
        onClose={() => setModal(null)}
        onSave={modal?.type === 'ingreso' ? handleSaveIngreso : handleSaveExpense}
        initial={modal?.item}
        categories={categories}
        itemType={modal?.type || 'egreso'}
      />
    </div>
  )
}
