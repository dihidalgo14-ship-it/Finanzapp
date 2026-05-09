# FINANZAPP 💰

Aplicación de control presupuestario con lógica de arrastre de saldos y deudas.

## Tecnologías

- **React 18** + **Vite** — UI y bundler
- **Tailwind CSS 3** — estilos responsivos
- **Zustand** — estado global con persistencia en localStorage
- **Lucide React** — iconografía

## Instalación y uso

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar servidor de desarrollo
npm run dev

# 3. Build para producción
npm run build
```

## Funcionalidades

### Matriz Presupuesto vs. Real
- Navega entre meses con las flechas
- Haz clic en cualquier monto para editarlo inline
- Cambia el estado de cada egreso entre **Pendiente** y **Pagado**
- Añade **Gastos no contemplados** con el botón "Extra"

### Cierre de Mes
1. Presiona **Cerrar mes**
2. Confirma el saldo final de caja
3. Los gastos **Pendientes** se arrastran automáticamente al mes siguiente
4. El mes queda bloqueado para edición

### Categorías
- CRUD completo del maestro de categorías
- Define ingresos y egresos recurrentes con monto mensual por defecto
- Las nuevas categorías se aplicarán en los meses que inicialices desde esa fecha

### Historial
- Visualiza todos los meses cerrados
- Detalle de ingresos reales, egresos reales, saldo de caja y arrastres

## Modelo de datos (Firestore — para producción)

```
/users/{userId}
  /categories/{catId}
      name: string
      type: "ingreso" | "egreso"
      defaultAmount: number
      order: number

  /months/{YYYY-MM}
      locked: boolean
      saldoCierre: number | null
      closedAt: Timestamp
      /items/{itemId}
          catId: string | null
          name: string
          type: "ingreso" | "egreso"
          presupuesto: number
          real: number
          estado: "pagado" | "pendiente" | null
          esArrastre: boolean
          esExtra: boolean
          arrastradoDe: string | null
```

## Agregar Firebase (opcional)

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Instala: `npm install firebase`
3. Reemplaza el store de Zustand con llamadas a Firestore
4. La acción `closeMonth` se recomienda como **Cloud Function** para garantizar atomicidad

## Estructura del proyecto

```
src/
  components/
    App.jsx              — Layout principal + navegación
    MatrizView.jsx       — Vista principal presupuesto vs real
    CategoriasView.jsx   — CRUD categorías
    HistorialView.jsx    — Meses cerrados
    ItemRow.jsx          — Fila de tabla (desktop)
    MobileItemCard.jsx   — Card expandible (mobile)
    AddItemModal.jsx     — Modal gastos no contemplados
    CloseMonthModal.jsx  — Modal cierre de mes
    CategoryModal.jsx    — Modal add/edit categoría
    Modal.jsx            — Modal base reutilizable
    MetricCard.jsx       — Tarjeta de métrica
    Badge.jsx            — Badges de estado/tipo
    Toast.jsx            — Notificaciones
  store/
    useStore.js          — Estado global (Zustand + localStorage)
  utils/
    helpers.js           — Formateo de moneda, fechas, etc.
```
