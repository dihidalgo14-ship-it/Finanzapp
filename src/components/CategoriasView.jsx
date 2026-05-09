import React, { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import Modal from './Modal'
import { showToast } from './Toast'
import { CAT_COLORS } from '../utils/helpers'

const ICONS = ['💼','🏢','👧','🏠','🛒','⚡','🚗','🎓','💊','🎭','✈️','🎁','💡','📱','🏋️','🍽️','📌','💰','🏦','🔧']

function CategoryModal({ open, onClose, initial, onSave }) {
  const [name, setName] = useState(initial?.name || '')
  const [type, setType] = useState(initial?.type || 'egreso')
  const [color, setColor] = useState(initial?.color || CAT_COLORS[0])
  const [icon, setIcon] = useState(initial?.icon || '📌')

  React.useEffect(() => {
    if (open) {
      setName(initial?.name || '')
      setType(initial?.type || 'egreso')
      setColor(initial?.color || CAT_COLORS[0])
      setIcon(initial?.icon || '📌')
    }
  }, [open, initial])

  const handleSave = () => {
    if (!name.trim()) return
    onSave({ name: name.trim(), type, color, icon })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Editar categoría' : 'Nueva categoría'} size="sm">
      <div className="space-y-4">
        <div>
          <label className="text-[12px] font-medium text-[#6e6e73] block mb-1.5">Nombre</label>
          <input autoFocus value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="Ej: Seguro de salud" className="mac-input" />
        </div>
        <div>
          <label className="text-[12px] font-medium text-[#6e6e73] block mb-1.5">Tipo</label>
          <div className="grid grid-cols-2 gap-2">
            {['egreso','ingreso'].map(t => (
              <button key={t} onClick={() => setType(t)}
                className="py-2 rounded-lg text-[13px] font-medium transition-all"
                style={{ background: type === t ? (t === 'ingreso' ? 'rgba(52,199,89,0.12)' : 'rgba(255,59,48,0.1)') : 'rgba(0,0,0,0.04)', color: type === t ? (t === 'ingreso' ? '#34c759' : '#ff3b30') : '#6e6e73', border: type === t ? `1px solid ${t === 'ingreso' ? 'rgba(52,199,89,0.3)' : 'rgba(255,59,48,0.25)'}` : '1px solid transparent' }}>
                {t === 'ingreso' ? 'Ingreso' : 'Egreso'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[12px] font-medium text-[#6e6e73] block mb-1.5">Ícono</label>
          <div className="grid grid-cols-10 gap-1">
            {ICONS.map(ic => (
              <button key={ic} onClick={() => setIcon(ic)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[16px] transition-all"
                style={{ background: icon === ic ? 'rgba(0,113,227,0.1)' : 'transparent', border: icon === ic ? '1px solid rgba(0,113,227,0.3)' : '1px solid transparent' }}>
                {ic}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[12px] font-medium text-[#6e6e73] block mb-1.5">Color</label>
          <div className="flex flex-wrap gap-2">
            {CAT_COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full transition-all"
                style={{ background: c, outline: color === c ? `3px solid ${c}` : 'none', outlineOffset: '2px' }} />
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="mac-btn mac-btn-secondary flex-1 justify-center">Cancelar</button>
          <button onClick={handleSave} disabled={!name.trim()} className="mac-btn mac-btn-primary flex-1 justify-center disabled:opacity-40">Guardar</button>
        </div>
      </div>
    </Modal>
  )
}

export default function CategoriasView() {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const handleSave = (data) => {
    if (editing) { updateCategory(editing.id, data); showToast('Categoría actualizada') }
    else { addCategory(data); showToast('Categoría creada') }
    setEditing(null)
  }

  const handleDelete = (cat) => {
    if (!window.confirm(`¿Eliminar "${cat.name}"?`)) return
    deleteCategory(cat.id); showToast('Categoría eliminada', 'info')
  }

  const ingresos = categories.filter(c => c.type === 'ingreso')
  const egresos = categories.filter(c => c.type === 'egreso')

  const Section = ({ title, items, color }) => (
    <div className="mac-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="text-[15px] font-semibold text-[#1d1d1f]">{title}</span>
          <span className="text-[12px] text-[#86868b] bg-black/5 rounded-full px-2 py-0.5">{items.length}</span>
        </div>
      </div>
      {items.length === 0 && (
        <p className="text-[13px] text-[#86868b] py-4 text-center">Sin categorías</p>
      )}
      <div className="space-y-1">
        {items.map((cat, i) => (
          <div key={cat.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl group hover:bg-black/3 transition-colors"
               style={{ borderTop: i > 0 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[16px] shrink-0"
                 style={{ background: cat.color + '18' }}>
              {cat.icon}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[14px] font-medium text-[#1d1d1f]">{cat.name}</span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setEditing(cat); setModalOpen(true) }}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#6e6e73] hover:bg-black/6 transition-colors">
                <Pencil size={13} />
              </button>
              <button onClick={() => handleDelete(cat)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#ff3b30] hover:bg-[#ff3b30]/08 transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-semibold text-[#1d1d1f]">Categorías</h1>
          <p className="text-[13px] text-[#86868b] mt-0.5">Organiza tus ingresos y gastos</p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true) }} className="mac-btn mac-btn-primary">
          <Plus size={14} /> Nueva
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Section title="Ingresos" items={ingresos} color="#34c759" />
        <Section title="Egresos" items={egresos} color="#ff3b30" />
      </div>
      <CategoryModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }} initial={editing} onSave={handleSave} />
    </div>
  )
}
