import { create } from 'zustand'
import { CAT_COLORS, getMonthKey } from '../utils/helpers'
import {
  saveCategory, deleteCategory as dbDeleteCategory,
  saveExpense, deleteExpense as dbDeleteExpense,
  saveIngreso, deleteIngreso as dbDeleteIngreso,
  saveMonthData, loadAllUserData, saveClosedMonths,
} from '../services/firestoreService'

const INIT_CATEGORIES = [
  { id: 'cat-1', name: 'Honorarios', type: 'ingreso', color: '#34c759', icon: '💼' },
  { id: 'cat-2', name: 'Cuota Matriz', type: 'egreso', color: '#0071e3', icon: '🏢' },
  { id: 'cat-3', name: 'Pensión Antü', type: 'egreso', color: '#bf5af2', icon: '👧' },
  { id: 'cat-4', name: 'Arriendo', type: 'egreso', color: '#ff9f0a', icon: '🏠' },
  { id: 'cat-5', name: 'Alimentación', type: 'egreso', color: '#ff3b30', icon: '🛒' },
  { id: 'cat-6', name: 'Servicios', type: 'egreso', color: '#5ac8fa', icon: '⚡' },
  { id: 'cat-7', name: 'Transporte', type: 'egreso', color: '#ff6b35', icon: '🚗' },
]

function getNextMonth(monthIdx, year) {
  return monthIdx === 11 ? { monthIdx: 0, year: year + 1 } : { monthIdx: monthIdx + 1, year }
}
function emptyMd() {
  return { realByExpense: {}, realByIngreso: {}, estado: {}, pagadoParcial: {}, presupuestoOverride: {}, saldoCierre: null, locked: false, extraItems: [] }
}

export const useStore = create((set, get) => ({
  // ── Auth / loading ────────────────────────────────────────────────────────
  uid: null,
  loading: true, // true while loading from Firestore

  categories: INIT_CATEGORIES,
  expenses: [],
  ingresos: [],
  monthData: {},
  closedMonths: {},
  currentMonthIdx: new Date().getMonth(),
  currentYear: new Date().getFullYear(),

  // ── Load all data from Firestore after login ───────────────────────────────
  loadUserData: async (uid) => {
    set({ uid, loading: true })
    try {
      const data = await loadAllUserData(uid)
      set({
        categories: data.categories.length > 0 ? data.categories : INIT_CATEGORIES,
        expenses: data.expenses,
        ingresos: data.ingresos,
        monthData: data.monthData,
        closedMonths: data.closedMonths,
        loading: false,
      })
      // If new user, save default categories to Firestore
      if (data.categories.length === 0) {
        INIT_CATEGORIES.forEach(cat => saveCategory(uid, cat))
      }
    } catch (e) {
      console.error('Error loading user data:', e)
      set({ loading: false })
    }
  },

  clearUserData: () => set({
    uid: null, loading: false,
    categories: INIT_CATEGORIES, expenses: [], ingresos: [],
    monthData: {}, closedMonths: {},
  }),

  // ── Navigation ────────────────────────────────────────────────────────────
  prevMonth: () => {
    const { currentMonthIdx, currentYear } = get()
    if (currentMonthIdx === 0) set({ currentMonthIdx: 11, currentYear: currentYear - 1 })
    else set({ currentMonthIdx: currentMonthIdx - 1 })
  },
  nextMonth: () => {
    const { currentMonthIdx, currentYear } = get()
    if (currentMonthIdx === 11) set({ currentMonthIdx: 0, currentYear: currentYear + 1 })
    else set({ currentMonthIdx: currentMonthIdx + 1 })
  },
  setCurrentMonth: (monthIdx, year) => set({ currentMonthIdx: monthIdx, currentYear: year }),

  isLocked: (monthIdx, year) => !!get().closedMonths[getMonthKey(monthIdx, year)],

  // ── Month data helpers ────────────────────────────────────────────────────
  _saveMd: (monthKey, md) => {
    const { uid } = get()
    if (uid) saveMonthData(uid, monthKey, md)
  },

  setReal: (monthKey, itemId, itemType, value) => {
    set(state => {
      const md = state.monthData[monthKey] || emptyMd()
      const updated = itemType === 'ingreso'
        ? { ...md, realByIngreso: { ...md.realByIngreso, [itemId]: value } }
        : { ...md, realByExpense: { ...md.realByExpense, [itemId]: value } }
      get()._saveMd(monthKey, updated)
      return { monthData: { ...state.monthData, [monthKey]: updated } }
    })
  },

  setEstado: (monthKey, expId, estado) => {
    set(state => {
      const md = state.monthData[monthKey] || emptyMd()
      const updated = { ...md, estado: { ...md.estado, [expId]: estado } }
      get()._saveMd(monthKey, updated)
      return { monthData: { ...state.monthData, [monthKey]: updated } }
    })
  },

  setPagadoParcial: (monthKey, itemId, monto) => {
    set(state => {
      const md = state.monthData[monthKey] || emptyMd()
      const pagadoParcial = { ...(md.pagadoParcial || {}), [itemId]: monto }
      const exp = state.expenses.find(e => e.id === itemId)
      const presupuesto = exp ? (md.presupuestoOverride?.[itemId] ?? exp.presupuesto)
        : (md.extraItems || []).find(i => i.id === itemId)?.presupuesto || 0
      const estado = { ...(md.estado || {}) }
      if (monto >= presupuesto && presupuesto > 0) estado[itemId] = 'pagado'
      else if (monto > 0) estado[itemId] = 'pendiente'
      const updated = { ...md, pagadoParcial, estado }
      get()._saveMd(monthKey, updated)
      return { monthData: { ...state.monthData, [monthKey]: updated } }
    })
  },

  setPresupuestoOverride: (monthKey, itemId, monto) => {
    set(state => {
      const md = state.monthData[monthKey] || emptyMd()
      const updated = { ...md, presupuestoOverride: { ...(md.presupuestoOverride || {}), [itemId]: monto } }
      get()._saveMd(monthKey, updated)
      return { monthData: { ...state.monthData, [monthKey]: updated } }
    })
  },

  // ── Extra items ───────────────────────────────────────────────────────────
  addExtraItem: (monthKey, name, type, catId, presupuesto) => {
    set(state => {
      const md = state.monthData[monthKey] || emptyMd()
      const item = { id: `extra-${Date.now()}`, name, type, catId, presupuesto, real: 0, estado: type === 'egreso' ? 'pendiente' : null }
      const updated = { ...md, extraItems: [...(md.extraItems || []), item] }
      get()._saveMd(monthKey, updated)
      return { monthData: { ...state.monthData, [monthKey]: updated } }
    })
  },

  updateExtraItem: (monthKey, itemId, field, value) => {
    set(state => {
      const md = state.monthData[monthKey]
      if (!md) return state
      const updated = { ...md, extraItems: md.extraItems.map(i => i.id === itemId ? { ...i, [field]: value } : i) }
      get()._saveMd(monthKey, updated)
      return { monthData: { ...state.monthData, [monthKey]: updated } }
    })
  },

  deleteExtraItem: (monthKey, itemId) => {
    set(state => {
      const md = state.monthData[monthKey]
      if (!md) return state
      const updated = { ...md, extraItems: md.extraItems.filter(i => i.id !== itemId) }
      get()._saveMd(monthKey, updated)
      return { monthData: { ...state.monthData, [monthKey]: updated } }
    })
  },

  // ── Close month ───────────────────────────────────────────────────────────
  closeMonth: (monthIdx, year, saldoCierre) => {
    const key = getMonthKey(monthIdx, year)
    const { expenses, monthData, uid } = get()
    const md = monthData[key] || emptyMd()
    const monthExpenses = expenses.filter(e => e.monthKeys && e.monthKeys.includes(key))
    const pendientes = monthExpenses.filter(e => (md.estado[e.id] || 'pendiente') === 'pendiente')
    const extraPendientes = (md.extraItems || []).filter(i => i.type === 'egreso' && (i.estado || 'pendiente') === 'pendiente')
    const next = getNextMonth(monthIdx, year)
    const nextKey = getMonthKey(next.monthIdx, next.year)

    set(state => {
      const nextMd = state.monthData[nextKey] || emptyMd()
      const arrastres = [
        ...pendientes.map(e => ({ id: `arrastre-${e.id}-${nextKey}`, name: e.name, type: 'egreso', catId: e.catId, presupuesto: md.presupuestoOverride?.[e.id] ?? e.presupuesto, real: 0, estado: 'pendiente', esArrastre: true, desdeMes: key })),
        ...extraPendientes.map(e => ({ ...e, id: `arrastre-extra-${e.id}-${nextKey}`, real: 0, estado: 'pendiente', esArrastre: true, desdeMes: key })),
      ]
      const closedMd = { ...md, saldoCierre, locked: true }
      const newNextMd = { ...nextMd, extraItems: [...(nextMd.extraItems || []), ...arrastres] }
      const newClosed = { ...state.closedMonths, [key]: true }

      if (uid) {
        saveMonthData(uid, key, closedMd)
        saveMonthData(uid, nextKey, newNextMd)
        saveClosedMonths(uid, newClosed)
      }

      return {
        closedMonths: newClosed,
        monthData: { ...state.monthData, [key]: closedMd, [nextKey]: newNextMd }
      }
    })
  },

  // ── Categories ────────────────────────────────────────────────────────────
  addCategory: ({ name, type, color, icon }) => {
    const cat = { id: `cat-${Date.now()}`, name, type, color: color || CAT_COLORS[0], icon: icon || '📌' }
    set(state => ({ categories: [...state.categories, cat] }))
    const { uid } = get()
    if (uid) saveCategory(uid, cat)
  },
  updateCategory: (id, fields) => {
    set(state => ({ categories: state.categories.map(c => c.id === id ? { ...c, ...fields } : c) }))
    const { uid, categories } = get()
    if (uid) { const cat = categories.find(c => c.id === id); if (cat) saveCategory(uid, cat) }
  },
  deleteCategory: (id) => {
    set(state => ({ categories: state.categories.filter(c => c.id !== id) }))
    const { uid } = get()
    if (uid) dbDeleteCategory(uid, id)
  },

  // ── Expenses ──────────────────────────────────────────────────────────────
  addExpense: ({ name, catId, presupuesto, monthKeys }) => {
    const exp = { id: `exp-${Date.now()}`, name, catId, presupuesto, type: 'egreso', monthKeys: [...monthKeys].sort() }
    set(state => ({ expenses: [...state.expenses, exp] }))
    const { uid } = get()
    if (uid) saveExpense(uid, exp)
  },
  updateExpense: (id, fields) => {
    set(state => {
      const updated = state.expenses.map(e => {
        if (e.id !== id) return e
        const next = { ...e, ...fields }
        if (fields.monthKeys) next.monthKeys = [...fields.monthKeys].sort()
        return next
      })
      const exp = updated.find(e => e.id === id)
      const { uid } = get()
      if (uid && exp) saveExpense(uid, exp)
      return { expenses: updated }
    })
  },
  deleteExpense: (id) => {
    set(state => ({ expenses: state.expenses.filter(e => e.id !== id) }))
    const { uid } = get()
    if (uid) dbDeleteExpense(uid, id)
  },

  // ── Ingresos ──────────────────────────────────────────────────────────────
  addIngreso: ({ name, catId, presupuesto, monthKeys }) => {
    const ing = { id: `ing-${Date.now()}`, name, catId, presupuesto, type: 'ingreso', monthKeys: [...monthKeys].sort() }
    set(state => ({ ingresos: [...state.ingresos, ing] }))
    const { uid } = get()
    if (uid) saveIngreso(uid, ing)
  },
  updateIngreso: (id, fields) => {
    set(state => {
      const updated = state.ingresos.map(i => {
        if (i.id !== id) return i
        const next = { ...i, ...fields }
        if (fields.monthKeys) next.monthKeys = [...fields.monthKeys].sort()
        return next
      })
      const ing = updated.find(i => i.id === id)
      const { uid } = get()
      if (uid && ing) saveIngreso(uid, ing)
      return { ingresos: updated }
    })
  },
  deleteIngreso: (id) => {
    set(state => ({ ingresos: state.ingresos.filter(i => i.id !== id) }))
    const { uid } = get()
    if (uid) dbDeleteIngreso(uid, id)
  },
}))
