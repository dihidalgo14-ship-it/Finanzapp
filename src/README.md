# 💰 Presupuesto vs Real

Aplicación web de control presupuestario personal con comparación presupuesto vs ejecución real, lógica de arrastre de saldos y sincronización en la nube.

---

## ✨ Funcionalidades

- **Matriz mensual** — Compara presupuesto vs real por ítem, con edición inline
- **Vista anual** — Resumen mes a mes con subvistas Presupuestado / Real y flujo acumulado
- **Gastos e ingresos programados** — Define ítems con categoría y selecciona exactamente en qué meses aplica
- **Pagos parciales** — Registra cuánto has pagado de cada gasto con barra de progreso visual
- **Cierre de mes** — Bloquea el mes, registra saldo de caja y arrastra automáticamente los gastos pendientes al mes siguiente
- **Historial** — Visualiza todos los meses cerrados con detalle de arrastres
- **Categorías personalizables** — CRUD con ícono emoji y color personalizable
- **Autenticación con Google** — Login seguro, cada usuario ve solo sus propios datos
- **Sincronización en la nube** — Datos guardados en Firestore, accesibles desde cualquier dispositivo

---

## 🛠 Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite |
| Estilos | Tailwind CSS 3 |
| Estado global | Zustand |
| Base de datos | Firebase Firestore |
| Autenticación | Firebase Auth (Google) |
| Iconos | Lucide React |
| Tipografía | DM Sans + DM Mono |

---

## 🚀 Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/presupuesto-app.git
cd presupuesto-app
npm install
```

### 2. Crear proyecto en Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. Crea un nuevo proyecto
3. Activa **Authentication** → Sign-in method → **Google**
4. Activa **Firestore Database** → modo Producción → región `southamerica-east1`
5. En Configuración del proyecto → Tu app web → copia el objeto `firebaseConfig`

### 3. Configurar credenciales

Crea el archivo `.env` en la raíz del proyecto:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### 4. Publicar reglas de Firestore

En Firebase Console → Firestore → pestaña **Reglas**, pega:
rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
match /users/{userId}/{document=**} {
allow read, write: if request.auth != null && request.auth.uid == userId;
}
}
}

### 5. Levantar en desarrollo

```bash
npm run dev
```

### 6. Build para producción

```bash
npm run build
```

---

## 📁 Estructura del proyecto
src/
├── components/
│   ├── MatrizView.jsx        # Vista mensual y anual
│   ├── GastosView.jsx        # Gastos e ingresos programados
│   ├── CategoriasView.jsx    # CRUD de categorías
│   ├── HistorialView.jsx     # Meses cerrados
│   ├── LoginScreen.jsx       # Pantalla de login con Google
│   ├── Modal.jsx             # Modal base reutilizable
│   ├── MonthPicker.jsx       # Selector de meses
│   └── Toast.jsx             # Notificaciones
├── context/
│   └── AuthContext.jsx       # Contexto de autenticación
├── services/
│   └── firestoreService.js   # Operaciones con Firestore
├── store/
│   └── useStore.js           # Estado global (Zustand)
├── utils/
│   └── helpers.js            # Utilidades
├── firebase.js               # Configuración Firebase
└── App.jsx                   # Layout principal

---

## 🗄 Modelo de datos (Firestore)
/users/{userId}/
categories/{catId}      → { id, name, type, color, icon }
expenses/{expId}        → { id, name, catId, presupuesto, monthKeys[] }
ingresos/{ingId}        → { id, name, catId, presupuesto, monthKeys[] }
monthData/{YYYY-MM}     → { realByExpense, realByIngreso, estado,
pagadoParcial, presupuestoOverride,
saldoCierre, locked, extraItems[] }
meta/closedMonths       → { closedMonths: { 'YYYY-MM': true } }

---

## 🔒 Seguridad

- Autenticación gestionada por Firebase Auth — nunca se almacenan contraseñas
- Security Rules de Firestore garantizan que cada usuario solo accede a sus propios datos
- Credenciales en `.env` — **nunca** subir este archivo a GitHub

---

## 📄 Licencia

MIT