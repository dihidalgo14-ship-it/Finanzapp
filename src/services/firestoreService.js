import {
  doc, collection, getDocs, getDoc,
  setDoc, updateDoc, deleteDoc,
  onSnapshot, writeBatch, serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'

// ─── Paths ─────────────────────────────────────────────────────────────────
// /users/{uid}/categories/{catId}
// /users/{uid}/expenses/{expId}
// /users/{uid}/ingresos/{ingId}
// /users/{uid}/monthData/{YYYY-MM}

const userRef = (uid) => doc(db, 'users', uid)
const colRef = (uid, col) => collection(db, 'users', uid, col)
const docRef = (uid, col, id) => doc(db, 'users', uid, col, id)

// ─── Categories ────────────────────────────────────────────────────────────
export async function saveCategory(uid, cat) {
  await setDoc(docRef(uid, 'categories', cat.id), cat)
}
export async function deleteCategory(uid, catId) {
  await deleteDoc(docRef(uid, 'categories', catId))
}
export async function getCategories(uid) {
  const snap = await getDocs(colRef(uid, 'categories'))
  return snap.docs.map(d => d.data())
}

// ─── Expenses ──────────────────────────────────────────────────────────────
export async function saveExpense(uid, exp) {
  await setDoc(docRef(uid, 'expenses', exp.id), exp)
}
export async function deleteExpense(uid, expId) {
  await deleteDoc(docRef(uid, 'expenses', expId))
}
export async function getExpenses(uid) {
  const snap = await getDocs(colRef(uid, 'expenses'))
  return snap.docs.map(d => d.data())
}

// ─── Ingresos ──────────────────────────────────────────────────────────────
export async function saveIngreso(uid, ing) {
  await setDoc(docRef(uid, 'ingresos', ing.id), ing)
}
export async function deleteIngreso(uid, ingId) {
  await deleteDoc(docRef(uid, 'ingresos', ingId))
}
export async function getIngresos(uid) {
  const snap = await getDocs(colRef(uid, 'ingresos'))
  return snap.docs.map(d => d.data())
}

// ─── Month data ─────────────────────────────────────────────────────────────
export async function saveMonthData(uid, monthKey, data) {
  await setDoc(docRef(uid, 'monthData', monthKey), data, { merge: true })
}
export async function getMonthData(uid, monthKey) {
  const snap = await getDoc(docRef(uid, 'monthData', monthKey))
  return snap.exists() ? snap.data() : null
}
export async function getAllMonthData(uid) {
  const snap = await getDocs(colRef(uid, 'monthData'))
  const result = {}
  snap.docs.forEach(d => { result[d.id] = d.data() })
  return result
}

// ─── Closed months ──────────────────────────────────────────────────────────
export async function saveClosedMonths(uid, closedMonths) {
  await setDoc(docRef(uid, 'meta', 'closedMonths'), { closedMonths })
}
export async function getClosedMonths(uid) {
  const snap = await getDoc(docRef(uid, 'meta', 'closedMonths'))
  return snap.exists() ? snap.data().closedMonths : {}
}

// ─── Load all user data at once ─────────────────────────────────────────────
export async function loadAllUserData(uid) {
  const [categories, expenses, ingresos, monthData, closedMonths] = await Promise.all([
    getCategories(uid),
    getExpenses(uid),
    getIngresos(uid),
    getAllMonthData(uid),
    getClosedMonths(uid),
  ])
  return { categories, expenses, ingresos, monthData, closedMonths }
}

// ─── Migration: push localStorage data to Firestore ────────────────────────
export async function migrateFromLocalStorage(uid) {
  const raw = localStorage.getItem('presupuesto-v3')
  if (!raw) throw new Error('No se encontraron datos locales para migrar')

  const parsed = JSON.parse(raw)
  const state = parsed.state
  if (!state) throw new Error('Formato de datos local no reconocido')

  const batch = writeBatch(db)

  // Categories
  ;(state.categories || []).forEach(cat => {
    batch.set(docRef(uid, 'categories', cat.id), cat)
  })

  // Expenses
  ;(state.expenses || []).forEach(exp => {
    batch.set(docRef(uid, 'expenses', exp.id), exp)
  })

  // Ingresos
  ;(state.ingresos || []).forEach(ing => {
    batch.set(docRef(uid, 'ingresos', ing.id), ing)
  })

  // Month data
  Object.entries(state.monthData || {}).forEach(([key, data]) => {
    batch.set(docRef(uid, 'monthData', key), data)
  })

  // Closed months
  batch.set(docRef(uid, 'meta', 'closedMonths'), {
    closedMonths: state.closedMonths || {}
  })

  await batch.commit()

  return {
    categories: (state.categories || []).length,
    expenses: (state.expenses || []).length,
    ingresos: (state.ingresos || []).length,
    monthData: Object.keys(state.monthData || {}).length,
  }
}
