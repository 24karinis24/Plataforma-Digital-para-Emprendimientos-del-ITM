# Emprendimientos ITM — Documentación Técnica

**Versión**: 6.0  
**Fecha**: Abril 2026  
**Entorno**: Frontend SPA · ES Modules nativos · Sin backend · Demo completamente simulada

---

## Tabla de Contenidos

1. [Estructura del Proyecto](#1-estructura-del-proyecto)
2. [Descripción de Archivos](#2-descripción-de-archivos)
3. [Estado Global y Flujo de Datos](#3-estado-global-y-flujo-de-datos)
4. [Autenticación Simulada](#4-autenticación-simulada)
5. [Sincronización Perfil → Productos](#5-sincronización-perfil--productos)
6. [Módulos de UI Reutilizables](#6-módulos-de-ui-reutilizables)
7. [Flujo Completo de la Aplicación](#7-flujo-completo-de-la-aplicación)
8. [Restricciones de Demo](#8-restricciones-de-demo)
9. [Cómo Ejecutar](#9-cómo-ejecutar)
10. [Guía de Estilos y Design Tokens](#10-guía-de-estilos-y-design-tokens)
11. [Reglas de Negocio — Eliminación de Productos](#11-reglas-de-negocio--eliminación-de-productos)
12. [Sincronización Multi-Rol](#12-sincronización-multi-rol)
13. [Historial de Cambios](#13-historial-de-cambios)

---

## 1. Estructura del Proyecto

```
itm-frontend/
│
├── index.html                          ← Shell HTML mínimo. Solo IDs de anclaje.
│
├── styles/
│   ├── main.css                        ← Único @import en el HTML. Orden de carga explícito.
│   ├── tokens.css                      ← Design tokens: colores, tipos, espaciado, sombras.
│   ├── reset.css                       ← Reset moderno (Josh Comeau-based).
│   ├── base.css                        ← Tipografía y defaults de documento.
│   ├── layout.css                      ← App shell, grids, select-layout, profile-grid--two.
│   ├── utilities.css                   ← Helpers atómicos (.hidden, .flex, etc.)
│   ├── components/
│   │   ├── button.css                  ← .btn con variantes y tamaños (BEM).
│   │   ├── form.css                    ← .form-control, .toggle, .char-counter, .demo-hint.
│   │   ├── image-upload.css            ← 5 estados: idle / drag-over / loading / loaded / error.
│   │   ├── navbar.css                  ← .navbar, .sub-nav.
│   │   ├── footer.css                  ← .footer.
│   │   ├── card.css                    ← .card, .stat-card, .role-card (icon modifiers v3).
│   │   ├── badge.css                   ← .badge con variantes de estado y categoría.
│   │   ├── modal.css                   ← .modal-overlay, .modal (animación scale-in).
│   │   ├── table.css                   ← .data-table.
│   │   └── misc.css                    ← .avatar, .empty-state, .toast, .info-banner, .tips-card.
│   └── pages/
│       ├── auth.css                    ← .auth-card, .auth-tabs, espaciado de formulario.
│       ├── select-user.css             ← .select-header (v3: mejor jerarquía visual).
│       ├── catalog.css                 ← .catalog-hero, .product-card, .product-detail-*.
│       ├── dashboard.css               ← .owned-card, .schedule-item, .schedule-day-chip.
│       └── profile.css                 ← .profile-summary, .profile-form-card, .profile-view-row.
│
├── scripts/
│   ├── app.js                          ← Compositor. Bootstrap y callbacks de navegación.
│   ├── router.js                       ← navigate(), navigateHome(), showView(). Navigation guard integrado.
│   │
│   ├── store/
│   │   ├── store.js                    ← Estado global reactivo. getState(), setState(), subscribe().
│   │   └── actions.js                  ← Todas las mutaciones. saveProfileData() propaga a myProducts.
│   │
│   ├── services/
│   │   ├── authService.js              ← Login/register en memoria. DEMO_ACCOUNTS privadas.
│   │   ├── productService.js           ← Fuente de verdad unificada. Filtrado, stats, validación.
│   │   └── userService.js              ← Labels de rol, configuración de perfil, tips.
│   │
│   ├── ui/
│   │   ├── dom.js                      ← byId(), render(), delegate(), val(), checked().
│   │   ├── icons.js                    ← Biblioteca SVG centralizada (20+ iconos).
│   │   ├── notify.js                   ← Sistema de toasts accesibles (success/error/info).
│   │   ├── imageUpload.js              ← Drag & drop: initUploader(), getUploadedFile(), clearUpload().
│   │   ├── charCounter.js              ← Contadores de caracteres: initCounter(), initCounters().
│   │   └── navigationGuard.js          ← Guardia de cambios sin guardar: setGuard(), checkGuard(), snapshot().
│   │
│   ├── components/
│   │   ├── Navbar.js                   ← mountNavbar(), mountSubNav(), mountAuthLogo().
│   │   ├── Footer.js                   ← renderFooter() → HTML string.
│   │   ├── Modal.js                    ← openModal(), closeModal(). Soporta dirtyCheck().
│   │   └── ProductCard.js              ← renderCatalogCard(), renderOwnedCard().
│   │
│   └── pages/
│       ├── AuthPage.js                 ← Tabs login/registro. Limpieza de campos entre pestañas.
│       ├── SelectUserPage.js           ← Tarjetas de rol (2 opciones centradas). Iconos diferenciados.
│       ├── AdminDashboardPage.js       ← Stats + tabla unificada con toggle/eliminar productos.
│       ├── BuyerCatalogPage.js         ← Hero + filtros + grid + navegar a detalle.
│       ├── ProductDetailPage.js        ← Detalle con perfil de vendedor siempre actualizado.
│       ├── EntrepreneurProductsPage.js ← CRUD completo: crear/ver/editar/eliminar + imagen.
│       ├── EntrepreneurSchedulePage.js ← CRUD de horarios multi-día.
│       └── ProfilePage.js              ← Perfil con modo vista/edición. Propaga cambios a productos.
│
└── data/
    ├── products.json                   ← Mock data de referencia (no se carga en runtime).
    ├── users.json                      ← Mock data de usuarios (no se carga en runtime).
    └── schedules.json                  ← Mock data de horarios (no se carga en runtime).
```

---

## 2. Descripción de Archivos

### `scripts/store/store.js`

Estado global reactivo con patrón publish/subscribe.

| Campo | Tipo | Descripción |
|---|---|---|
| `currentUser` | `object\|null` | Usuario autenticado: `{ id, name, email, role }` |
| `role` | `string\|null` | Rol activo: `'admin'`, `'entrepreneur'`, `'buyer'` |
| `currentPage` | `string\|null` | Ruta activa (clave de `ROUTES`) |
| `profileData` | `Record<userId, ProfileObj>` | Perfiles guardados en memoria por userId |
| `products` | `Product[]` | Productos semilla pre-cargados (emprendedores demo) |
| `myProducts` | `Product[]` | Productos creados por el emprendedor en esta sesión |
| `mySchedules` | `Schedule[]` | Horarios creados por el emprendedor en esta sesión |
| `sellerSchedules` | `Record<userId, Schedule[]>` | Horarios seed de vendedores demo |
| `selectedProductId` | `string\|null` | Producto abierto en vista detalle |
| `editingProductId` | `string\|null` | Producto en edición en el modal |
| `editingScheduleId` | `string\|null` | Horario en edición en el modal |

> **Nota v6:** `products` y `myProducts` son internamente dos arrays separados por conveniencia
> técnica (el emprendedor solo gestiona sus propios productos). Conceptualmente representan
> una única colección: **todos los productos son de emprendedores**. El acceso unificado
> se realiza siempre a través de `productService.js`.

**API pública:**

```js
getState()           // → snapshot inmutable del estado actual
setState(patch)      // → aplica patch y notifica suscriptores
subscribe(listener)  // → registra callback; retorna función para desuscribirse
```

---

### `scripts/store/actions.js`

Todas las mutaciones de estado. Ninguna página modifica el store directamente.

**Acciones de sesión:**

```js
setUser(user)       // Establece el usuario autenticado
setRole(role)       // Establece el rol activo
clearSession()      // Limpia sesión (no borra profileData)
```

**Acciones de perfil:**

```js
saveProfileData(userId, data)
// Guarda perfil en memoria Y propaga cambios visibles a myProducts:
//   data.businessName → producto.sellerName
//   data.businessDesc → producto.sellerDescription
//   data.photoUrl     → producto.sellerPhotoUrl

getProfileData(userId) → object
// Recupera el perfil guardado o {} si no existe

getEntrepreneurPublicProfile() → { name, description, email, photoUrl }
// Combina currentUser + profileData para obtener el perfil público más reciente
```

**Acciones de productos:**

```js
addMyProduct(data)
// Añade producto a myProducts usando el perfil MÁS RECIENTE como datos de vendedor.
// El producto es inmediatamente visible en el catálogo del comprador y en el
// panel del admin sin necesidad de recargar la aplicación.

updateMyProduct(id, patch)   // Merge parcial sobre producto existente en myProducts
removeMyProduct(id)           // Elimina por ID de myProducts

toggleProductStatus(productId)
// Busca el producto en products O en myProducts.
// Invierte status: 'available' ↔ 'unavailable'.
// Añade adminDisabled: true al deshabilitar; false al habilitar.
// Notifica a todos los suscriptores → re-render reactivo en todas las vistas.

removeProduct(productId)
// Elimina por ID de products O de myProducts (busca en ambos).
```

---

### `scripts/services/productService.js`

**Fuente de verdad centralizada para consultas de productos.**

> **Principio v6:** Todos los productos son de emprendedores. No existe distinción
> entre "productos de plataforma" y "productos de sesión". Las consultas siempre
> combinan `store.products` + `store.myProducts` de forma transparente.

**Función interna `_allProducts()`:**

```js
// Unifica los dos arrays del store en una sola colección.
// Usada internamente por todas las funciones de consulta.
function _allProducts() {
  const { products, myProducts = [] } = getState();
  return [...products, ...myProducts];
}
```

**API pública:**

```js
getAvailableProducts(filters)
// Solo productos con status === 'available' de ambos arrays.
// Usado por BuyerCatalogPage. Excluye automáticamente deshabilitados por admin.

getAllProductsForAdmin(filters)
// Todos los productos (disponibles + no disponibles) de ambos arrays.
// Sin etiquetas de origen. Usado por AdminDashboardPage.

getMyProducts()
// Solo los productos del emprendedor en sesión (store.myProducts).
// Usado por EntrepreneurProductsPage para CRUD propio.

getProductStats()
// → { total, available, unavailable } contando ambos arrays.

getCategories()
// Categorías únicas de ambos arrays, ordenadas alfabéticamente.
// Incluye las de los productos creados en sesión.

getProductById(id)
// Busca en ambos arrays. Retorna Product | null.

validateProduct(fields)
// → null si válido, string con mensaje de error si inválido.

canDeleteProduct(product, role)
// → { allowed: boolean, reason?: string }
// Centraliza la regla de eliminación por rol.
```

---

### `scripts/services/authService.js`

Autenticación completamente simulada en memoria.

**Cuentas demo internas** (solo en código, no visibles en la UI):

| Rol | Email | Contraseña |
|---|---|---|
| Admin | `admin@itm.edu.co` | `admin123` |
| Emprendedor | `emprendedor@itm.edu.co` | `emprendedor123` |
| Comprador | `comprador@itm.edu.co` | `comprador123` |

**Reglas de login:**
- Solo acepta credenciales de las 3 cuentas demo, o usuarios registrados en la sesión actual.
- Si el email no existe → error explícito: *"No encontramos una cuenta con ese correo."*
- Si la contraseña es incorrecta → error: *"Contraseña incorrecta."*
- Usuarios registrados quedan en `_registeredUsers` (Map en memoria) y pueden hacer login en la misma sesión.

**API pública:**

```js
login({ email, password })   → Promise<r>
register({ name, email, password }) → Promise<r>
checkSession()               → SessionObj | null
logout()                     → void
selectRole(userId, role)     → void
refreshSession()             → void   // no-op en demo
```

---

### `scripts/ui/charCounter.js`

Contadores de caracteres en tiempo real para inputs y textareas.

```js
initCounter(inputId, counterId, maxLen)
// Actualiza "N/MAX" en tiempo real.
// Clase .char-counter--warn  cuando ≥ 85% del límite.
// Clase .char-counter--limit cuando = 100% del límite.

initCounters([{ inputId, counterId, maxLen }, ...])
// Versión batch para registrar múltiples campos a la vez.

syncCounter(inputEl, counterEl, maxLen)
// Sincronización manual para pre-relleno sin registrar listeners.
```

**Límites por formulario:**

| Formulario | Campo | Límite |
|---|---|---|
| Perfil Emprendedor | Nombre del emprendimiento | 100 |
| Perfil Emprendedor | Descripción del emprendimiento | 500 |
| Perfil Comprador | Nombre / Apodo | 50 |
| Perfil Comprador | Sobre ti | 300 |
| Perfil Admin | Nombre | 50 |
| Perfil Admin | Descripción | 300 |
| Modal Producto | Nombre del producto | 80 |
| Modal Producto | Descripción | 500 |
| Modal Horario | Sede / Ubicación | 100 |

---

### `scripts/ui/navigationGuard.js`

Previene pérdida de datos al navegar fuera de formularios con cambios pendientes.

```js
snapshot(containerId)     // Captura estado actual de todos los campos del contenedor
isDirty(containerId)      // true si los valores difieren del snapshot inicial
setGuard(dirtyFn)         // Registra función que retorna true cuando hay cambios sin guardar
clearGuard()              // Elimina la guardia activa
checkGuard() → boolean    // true = puede navegar; false = usuario decidió quedarse
```

**Mensaje estándar:** *"Tienes cambios sin guardar. ¿Deseas salir sin guardar?"*

---

### `scripts/ui/imageUpload.js`

Módulo de drag & drop para imágenes. Completamente simulado (base64, sin subida real).

```js
initUploader(containerId, opts)        // opts: { label, sublabel, maxSizeBytes, onChange }
getUploadedFile(uploadId)              // → { file, dataUrl } | null
clearUpload(uploadId)                  // Reset de uploader individual
clearAllUploads()                      // Reset de todos los uploaders registrados
validateFile(file, maxBytes)           // → { ok } | { ok: false, error }
```

**Botones en estado loaded:**
- **Reemplazar** → resetea el input y abre el file picker.
- **Eliminar** → limpia el componente y dispara `onChange(null, null)`.

---

### `components/Modal.js`

Modal genérico con soporte de navegación guard.

```js
openModal({ title, subtitle, bodyHtml, confirmLabel, onConfirm, dirtyCheck })
// dirtyCheck?: () => boolean
//   Si se provee, X / Cancelar / backdrop / Escape muestran confirm()
//   antes de cerrar cuando dirtyCheck() === true.

closeModal()   // Cierra y limpia. Llama clearAllUploads() automáticamente.
```

---

## 3. Estado Global y Flujo de Datos

```
authService.js          ← valida credenciales (en memoria)
      │
      ▼
  app.js                ← setUser() / setRole() sobre el store
      │
      ▼
  store.js              ← estado central (getState / setState)
      │
      ├─ store.products   ┐
      ├─ store.myProducts ┘← productService._allProducts() los unifica
      │         │
      │         ├── AdminDashboardPage   ← getAllProductsForAdmin()  (todos)
      │         ├── BuyerCatalogPage     ← getAvailableProducts()   (disponibles)
      │         └── EntrepreneurPage     ← getMyProducts()          (propios)
      │
      ├── ProfilePage ──────► saveProfileData()
      │                              │
      │                              ▼
      │                       propaga a myProducts
      │                       (sellerName, sellerDesc, sellerPhotoUrl)
      │
      ├── EntrepreneurProductsPage → addMyProduct() usa profileData más reciente
      │
      └── ProductDetailPage ──────► _findProduct() fusiona producto + profileData
```

---

## 4. Autenticación Simulada

### Flujo de Login

```
Usuario ingresa email + password
        │
        ▼
authService.login()
        │
        ├── ¿Coincide con cuenta demo? → autenticar (rol pre-asignado)
        ├── ¿Registrado en _registeredUsers? → autenticar (rol null → pantalla de selección)
        └── No existe → error "No encontramos una cuenta con ese correo"
```

### Flujo de Registro

```
Usuario completa el formulario
        │
        ▼
authService.register()
        │
        ├── Validar campos (nombre ≥2, email válido, password ≥6)
        ├── Verificar que el email no exista (demo o registrado)
        ├── Añadir a _registeredUsers (Map en memoria)
        └── Retornar { ok: true, user, isFirstLogin: true }
                │
                ▼
        app.js → showView('select') → usuario elige su rol
```

### Reglas de Seguridad UX

- Formularios se limpian completamente al cambiar de pestaña (login ↔ registro).
- Formularios se limpian al cerrar sesión (`clearAuthForms()` desde `app.js`).
- Sin persistencia: cada recarga de página vuelve al estado inicial.
- Los datos de sesión viven únicamente en el módulo `authService.js`.

---

## 5. Sincronización Perfil → Productos

**Problema:** Al actualizar el perfil del emprendedor, los productos
creados en la misma sesión seguían mostrando el nombre/descripción anterior.

**Solución v3:** Propagación automática en `saveProfileData()`:

```js
// actions.js — saveProfileData()
const updatedProducts = myProducts.map(p => {
  if (p.sellerId !== userId) return p;
  return {
    ...p,
    sellerName:        data.businessName || data.name || p.sellerName,
    sellerDescription: data.businessDesc  ?? p.sellerDescription,
    sellerPhotoUrl:    data.photoUrl       ?? p.sellerPhotoUrl,
  };
});
```

**Puntos de sincronización:**

| Evento | Acción automática |
|---|---|
| Guardar perfil | Actualiza `sellerName`, `sellerDescription`, `sellerPhotoUrl` en todos los `myProducts` del usuario |
| Crear producto | `addMyProduct()` lee `profileData` para inyectar datos del vendedor actualizados |
| Ver producto (detalle) | `_findProduct()` fusiona el producto con `profileData` del propietario autenticado |

---

## 6. Módulos de UI Reutilizables

### Contadores de caracteres

```html
<!-- Estructura HTML requerida -->
<input class="form-control" id="mi-campo" maxlength="100" />
<div class="form-field-footer">
  <span class="form-error" id="err-mi-campo" style="display:none"></span>
  <span class="char-counter" id="count-mi-campo">0/100</span>
</div>
```

```js
import { initCounter } from '../ui/charCounter.js';
initCounter('mi-campo', 'count-mi-campo', 100);
```

### Navigation Guard en página

```js
import { snapshot, isDirty, setGuard, clearGuard } from '../ui/navigationGuard.js';

// Al montar el formulario (después de pre-rellenar):
snapshot('mi-form-container');
setGuard(() => isDirty('mi-form-container'));

// Al guardar exitosamente:
clearGuard();

// Al cancelar:
if (isDirty('mi-form-container')) {
  if (!confirm('Tienes cambios sin guardar. ¿Deseas salir sin guardar?')) return;
}
clearGuard();
```

### Navigation Guard en modal

```js
openModal({
  title:      'Editar Producto',
  bodyHtml:   _modalBodyHtml(),
  onConfirm:  _handleSave,
  dirtyCheck: () => isDirty('modal-body'),
});

// Después de que el modal esté en el DOM:
setTimeout(() => snapshot('modal-body'), 0);
```

---

## 7. Flujo Completo de la Aplicación

```
index.html
  └─► app.js (DOMContentLoaded)
        │
        ├─► authService.checkSession() → null (sin sesión inicial)
        │
        └─► showView('auth') → AuthPage visible
              │
              ├── [Login exitoso] → app._onAuthSuccess(user, isFirstLogin)
              │         │
              │         ├── role preconfigurado (cuenta demo) → _mountApp(role)
              │         └── role null                         → showView('select')
              │
              └── [Registro exitoso] → app._onAuthSuccess(user, isFirstLogin=true)
                        │
                        └─► showView('select') → SelectUserPage
                                  │
                                  └─► [Elige rol] → app._onRoleSelected(role)
                                            │
                                            └─► selectRole() → _mountApp(role)
                                                      │
                                                      └─► router.navigateHome(role)
                                                                │
                                                                ├── admin        → admin-dashboard
                                                                ├── entrepreneur → entrepreneur-products
                                                                └── buyer        → buyer-catalog
```

---

## 8. Restricciones de Demo

| Restricción | Implementación |
|---|---|
| Sin `localStorage` | No existe ninguna llamada en todo el proyecto |
| Sin `sessionStorage` | No existe ninguna llamada en todo el proyecto |
| Sin cookies | No se utilizan |
| Sin API externa | Todos los datos viven en `store.js` como objetos JS |
| Sin subida real de archivos | Las imágenes se convierten a base64 con `FileReader` |
| Sesión en memoria | `_session` en `authService.js` (se pierde al recargar) |
| Perfiles en memoria | `store.profileData` (se pierde al recargar) |
| Productos en memoria | `store.products` + `store.myProducts` (se pierden al recargar) |

---

## 9. Cómo Ejecutar

El proyecto usa **ES Modules nativos** (`type="module"`), que requieren un servidor HTTP.  
Abrir `index.html` directamente con `file://` produce errores CORS.

**Opciones recomendadas:**

```bash
# Node.js (npx)
npx serve .

# Python 3
python -m http.server 8080

# VS Code
# Instalar extensión "Live Server" → clic derecho en index.html → "Open with Live Server"

# PHP
php -S localhost:8080
```

Navegar a `http://localhost:PUERTO/` en el navegador.

---

## 10. Guía de Estilos y Design Tokens

### Colores principales (`tokens.css`)

| Token | Valor | Uso |
|---|---|---|
| `--brand-500` | `#2d4a9b` | Acentos, bullets, foco |
| `--brand-700` | `#1e3a8a` | Links, labels activos |
| `--brand-800` | `#1e3178` | Navbar, avatar fondo |
| `--color-danger-base` | `#ef4444` | Errores, campos inválidos |
| `--color-success-bg` | — | Toast de éxito |
| `--color-warning-base` | `#d97706` | Contador ≥85% del límite |

### Íconos de rol

| Rol | Clase CSS | Color |
|---|---|---|
| Emprendedor | `role-card__icon--entrepreneur` | Naranja `#ea580c → #f97316` (gradiente) |
| Comprador | `role-card__icon--buyer` | Índigo `#4f46e5 → #6366f1` (gradiente) |

### Espaciado (escala de 4px)

```
--space-1: 4px   --space-4: 16px   --space-8:  32px
--space-2: 8px   --space-5: 20px   --space-10: 40px
--space-3: 12px  --space-6: 24px   --space-16: 64px
```

### Breakpoints

| Nombre | Ancho | Comportamiento |
|---|---|---|
| Mobile | `< 640px` | Grid de 1 columna, padding reducido |
| Tablet | `640–767px` | Grid de 2 columnas |
| Desktop | `≥ 768px` | Grid de 3 columnas, navegación completa |

---

## 11. Reglas de Negocio — Eliminación de Productos

### Resumen por rol

| Rol | Puede eliminar | Condición |
|---|---|---|
| **Admin** | Siempre | Sin restricción de estado |
| **Emprendedor** | Solo si `status === 'unavailable'` | Debe marcar como No disponible primero |
| **Comprador** | No | Sin acceso a eliminación |

---

### Flujo Emprendedor

```
Usuario hace clic en "Eliminar"
        │
        ▼
ProductCard.js — renderOwnedCard()
  ¿producto disponible?
        │
        ├── SÍ → botón deshabilitado visualmente (opacity 0.45, cursor not-allowed)
        │          data-deletable="false"
        │
        └── NO → botón activo
                   data-deletable="true"
                        │
                        ▼
        EntrepreneurProductsPage — _handleDelete()
          canDeleteProduct(product, 'entrepreneur')
                │
                ├── allowed: false → notify.error(reason) → BLOQUEAR
                └── allowed: true  → confirm() → removeMyProduct() → navegar
```

### Flujo Admin

```
Admin hace clic en "Eliminar"
        │
        ▼
AdminDashboardPage — _bindEvents()
  Siempre activo — sin verificación de estado
        │
        ├── Producto disponible   → confirm() con aviso "está actualmente DISPONIBLE"
        └── Producto no disponible → confirm() estándar
                │
                ▼
        removeProduct() → re-render del dashboard
```

---

### Implementación técnica

**`services/productService.js`** — función centralizada:

```js
canDeleteProduct(product, role) → { allowed: boolean, reason?: string }
// Centraliza la regla de negocio en la capa de servicio.
// Ambas capas (UI y page-controller) la consultan para mantener consistencia.
```

**`components/ProductCard.js`** — `renderOwnedCard()`:
- `data-deletable="true|false"` en el botón Eliminar.
- Clase `owned-card__btn-delete--locked` cuando `isAvailable === true`.

**`pages/EntrepreneurProductsPage.js`** — `_handleDelete()`:
- Segunda línea de defensa: verifica `canDeleteProduct()` independientemente del estado visual.
- Previene eliminación aunque el botón sea manipulado desde DevTools.

**`pages/AdminDashboardPage.js`**:
- Botón Eliminar siempre activo. Sin restricción de estado.
- Confirmación diferenciada: alerta adicional si el producto está disponible.

---

### Flag `adminDisabled`

Campo booleano en el objeto producto. Establecido por `toggleProductStatus()`:

```js
// Cuando admin deshabilita:
{ ...product, status: 'unavailable', adminDisabled: true  }

// Cuando admin habilita de nuevo:
{ ...product, status: 'available',   adminDisabled: false }
```

Leído por:
- `renderOwnedCard()` → renderizado visual con banner de bloqueo
- `canDeleteProduct()` → bloquear eliminación directa por emprendedor
- `_handleEdit()` → bloquear modal de edición

---

## 12. Sincronización Multi-Rol

### Modelo de datos unificado (v6)

Todos los productos provienen de emprendedores. `store.products` contiene los productos
semilla de los emprendedores demo; `store.myProducts` contiene los creados en la sesión
activa. Ambos arrays son tratados como **una única colección** a través de `productService.js`.

```
store.products   (semilla)  ┐
                             ├─► productService._allProducts()
store.myProducts (sesión)   ┘         │
                                       ├── getAllProductsForAdmin()  → Admin ve todo
                                       ├── getAvailableProducts()   → Comprador ve disponibles
                                       └── getMyProducts()          → Emprendedor ve los suyos
```

---

### Ciclo de vida de un producto creado por el emprendedor

```
Emprendedor llena el formulario y guarda
        │
        ▼
addMyProduct(data)                          ← actions.js
  Lee profileData → inyecta sellerName,
  sellerDescription, sellerEmail
  Genera id: `tmp-${Date.now()}`
  Añade a store.myProducts
        │
        ▼
setState({ myProducts: [...] })             ← store.js
  _notify() → suscriptores notificados
        │
        ▼
navigate('entrepreneur-products')           ← re-render inmediato
        │
        ┌──────────────────────────────────────┐
        │ Admin abre su panel:                 │
        │   getAllProductsForAdmin()           │
        │   = [...products, ...myProducts]     │
        │   → nuevo producto aparece           │
        └──────────────────────────────────────┘
        │
        ┌──────────────────────────────────────┐
        │ Comprador abre el catálogo:          │
        │   getAvailableProducts()             │
        │   filtra status === 'available'      │
        │   sobre ambos arrays                 │
        │   → nuevo producto aparece           │
        └──────────────────────────────────────┘
```

---

### Comportamiento por rol tras deshabilitar (admin)

| Vista | Comportamiento |
|---|---|
| **Comprador** | Producto desaparece del catálogo y de los filtros de búsqueda |
| **Emprendedor** | Producto visible con banner "Deshabilitado por el administrador", Editar y Eliminar bloqueados |
| **Admin** | Producto visible en la tabla, botón cambia a "Habilitar", estado muestra "No disponible" |

---

### Flujo técnico — toggleProductStatus

```
Admin hace clic en "Deshabilitar"
        │
        ▼
toggleProductStatus(id)                     ← store/actions.js
  Busca en store.products
    ├── encontrado → invierte status, adminDisabled: true
    └── no encontrado → busca en store.myProducts → mismo cambio
        │
        ▼
setState({ products | myProducts: [...] })  ← store/store.js
        │
        └── _notify() → todos los suscriptores notificados
                │
                ▼
navigate('admin-dashboard')                 ← re-render con nuevo estado
        │
        ┌──────────────────────────────────────┐
        │ Comprador en catálogo:               │
        │   getAvailableProducts()             │
        │   → producto excluido (status check) │
        └──────────────────────────────────────┘
        │
        ┌──────────────────────────────────────┐
        │ Emprendedor en "Mis Productos":       │
        │   getMyProducts()                    │
        │   → adminDisabled: true              │
        │   → card con banner de bloqueo       │
        └──────────────────────────────────────┘
```

---

## 13. Historial de Cambios

### v6 (Abril 2026) — Gestión unificada de productos

**Motivación:** Eliminar la distinción artificial entre "catálogo de plataforma" y
"productos creados por emprendedor (sesión)". Todos los productos son de emprendedores.

**Cambios en `services/productService.js`:**
- Nueva función interna `_allProducts()` que unifica `store.products + store.myProducts`.
- `getAvailableProducts()` ahora incluye productos de `myProducts` con `status: 'available'`.
  En v5 solo filtraba `store.products`, lo que ocultaba al comprador los productos creados en sesión.
- `getAllProductsForAdmin()` fusiona ambos arrays sin etiquetas `_source`.
  En v5 añadía `_source: 'session'` a los `myProducts` para distinguirlos visualmente.
- `getProductStats()` ya no necesita lógica duplicada; delega a `_allProducts()`.
- `getCategories()` ahora incluye las categorías de productos creados en sesión.

**Cambios en `pages/AdminDashboardPage.js`:**
- Eliminada columna **"Origen"** de la tabla (era la 2ª columna, `colspan` reducido de 6 a 5).
- Eliminada leyenda "Catálogo de plataforma / Creados por emprendedor (sesión)" del header.
- Eliminados badges `admin-source-badge--platform` y `admin-source-badge--session`.
- Subtítulo del card ahora muestra el conteo total de productos.
- Banner de permisos actualizado: refleja que todos los productos son de emprendedores.

**Cambios en `styles/pages/dashboard.css`:**
- Eliminados los bloques CSS de `.admin-source-badge`, `.admin-source-badge--platform`,
  `.admin-source-badge--session`, `.admin-legend`, `.admin-legend--platform` y `.admin-legend--session`.

---

### v5 (Marzo 2026) — Sincronización admin → emprendedor → comprador

- `toggleProductStatus()` actúa sobre `products` y `myProducts`.
- Flag `adminDisabled` bloquea edición y eliminación por el emprendedor.
- `getAvailableProducts()` filtra por `status === 'available'`.
- `getAllProductsForAdmin()` fusiona ambos arrays con etiqueta `_source` (reemplazado en v6).
- `BuyerCatalogPage` usa `getAvailableProducts()` en render y en filtros dinámicos.
- `renderOwnedCard()` refleja `adminDisabled` con banner visual y botones bloqueados.

---

### v4 (Febrero 2026) — Reglas de eliminación por rol

- `canDeleteProduct(product, role)` centraliza la regla de negocio.
- Emprendedor solo puede eliminar productos con `status === 'unavailable'`.
- `editingProductId` en el store para rastrear edición activa.
- `renderOwnedCard()` genera `data-deletable` y `data-editable` en los botones.

---

### v3 (Enero 2026) — Sincronización perfil → productos

- `saveProfileData()` propaga cambios de nombre/descripción a `myProducts`.
- `addMyProduct()` inyecta datos del perfil más reciente como datos de vendedor.
- `getEntrepreneurPublicProfile()` combina `currentUser` + `profileData`.
- Contadores de caracteres (`charCounter.js`) en formularios de perfil y producto.
- Navigation guard (`navigationGuard.js`) en modales y páginas con formularios.
