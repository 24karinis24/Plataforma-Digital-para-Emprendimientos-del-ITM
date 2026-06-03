<h1 align="center">
  <img src="https://cdn-icons-png.flaticon.com/512/3081/3081559.png" width="48" alt="ITM Logo">
  <br/>
  Plataforma Digital para Emprendimientos ITM
</h1>

<p align="center">
  Conecta emprendedores y compradores dentro del Instituto Tecnológico Metropolitano
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Estado-En%20desarrollo-yellow?style=flat-square">
  <img src="https://img.shields.io/badge/Frontend-HTML%20%26%20CSS-orange?style=flat-square">
  <img src="https://img.shields.io/badge/Lógica-JavaScript%20ES%20Modules-blue?style=flat-square">
  <img src="https://img.shields.io/badge/Backend-rama%20proyecto--backend-lightgrey?style=flat-square">
</p>

---

> [!IMPORTANT]
> **Esta rama (`main`) contiene únicamente el frontend en modo simulación.**
> No existe backend ni base de datos conectada. Toda la lógica, autenticación y persistencia se simulan con **JavaScript puro en el navegador** (estado en memoria RAM, sin `localStorage`).
>
> 👉 Para ver el backend en C#, cambia a la rama [`proyecto-backend`](../../tree/proyecto-backend).

> [!NOTE]
> 👋 ¡Bienvenido al repositorio! Este proyecto está en construcción activa y seguirá evolucionando. Las contribuciones y sugerencias son bienvenidas.

---

## 📋 Tabla de Contenidos

- [Descripción General](#-descripción-general)
- [Demo — Cuentas de Prueba](#-demo--cuentas-de-prueba)
- [Roles del Sistema](#-roles-del-sistema)
- [Arquitectura Frontend](#-arquitectura-frontend)
- [Estructura de Archivos](#-estructura-de-archivos)
- [Cómo Ejecutar](#-cómo-ejecutar)
- [Flujos Principales](#-flujos-principales)
- [Reglas de Negocio](#-reglas-de-negocio)
- [Estado del Proyecto](#-estado-del-proyecto)
- [Rama Backend](#-rama-backend)

---

## 🧩 Descripción General

Marketplace universitario que simula el ciclo completo de compra/venta dentro del ITM:

| Actor | Qué puede hacer |
|---|---|
| **Emprendedor** | Crear y gestionar productos, subir imágenes, administrar horarios de atención, editar perfil |
| **Comprador** | Explorar el catálogo filtrado, ver detalles de productos y perfiles de vendedores |
| **Administrador** | Supervisar todos los productos, habilitar/deshabilitar, eliminar sin restricción, ver estadísticas |

> Es una **demo frontend-only**: sin backend, sin APIs externas, sin persistencia entre sesiones. Todo el estado vive en memoria RAM mientras la pestaña esté abierta.

---

## 🔑 Demo — Cuentas de Prueba

Puedes ingresar directamente con cualquiera de estas credenciales sin necesidad de registrarte:

| Rol | Email | Contraseña |
|---|---|---|
| 🛡️ Administrador | `admin@itm.edu.co` | `admin123` |
| 🧑‍💼 Emprendedor | `emprendedor@itm.edu.co` | `emprendedor123` |
| 🛒 Comprador | `comprador@itm.edu.co` | `comprador123` |

También puedes **registrar una cuenta nueva**. Al hacerlo, se te pedirá seleccionar un rol (emprendedor o comprador) antes de acceder a la plataforma.

---

## 👥 Roles del Sistema

### 🛡️ Admin — `admin-dashboard`
- Ve **todos** los productos del sistema (activos e inactivos)
- Puede **habilitar/deshabilitar** cualquier producto
- Puede **eliminar** productos sin restricción de estado
- Accede a estadísticas globales del catálogo

### 🧑‍💼 Emprendedor — `entrepreneur-products`
- **CRUD completo** de sus propios productos (crear, ver, editar, eliminar)
- Sube imágenes vía drag & drop (simulado en base64)
- Gestiona **horarios de atención** multi-día
- Edita su perfil; los cambios se propagan automáticamente a todos sus productos

> ⚠️ Un emprendedor solo puede **eliminar** productos que estén **desactivados** previamente. Si un administrador deshabilita el producto, el emprendedor tampoco puede editarlo.

### 🛒 Comprador — `buyer-catalog`
- Explora el catálogo con **filtros dinámicos** (categoría, precio, búsqueda)
- Solo ve productos con estado `disponible`
- Accede al detalle del producto y al **perfil público del vendedor**

---

## 🏗️ Arquitectura Frontend

```
index.html              ← shell mínimo (solo puntos de anclaje)
    └── app.js          ← bootstrap, callbacks de navegación y autenticación
          ├── router.js               → navigate(), navigateHome(), showView()
          ├── store/
          │   ├── store.js            → estado global reactivo (pub/sub)
          │   └── actions.js          → todas las mutaciones del store
          ├── services/
          │   ├── authService.js      → login/registro en memoria
          │   ├── productService.js   → fuente de verdad unificada de productos
          │   └── userService.js      → labels de rol, config de perfil, tips
          ├── ui/                     → módulos reutilizables del DOM
          │   ├── dom.js
          │   ├── toasts.js
          │   ├── icons.js
          │   ├── imageUpload.js
          │   ├── charCounter.js
          │   └── navigationGuard.js
          ├── components/             → Navbar, Footer, Modal, ProductCard
          └── pages/                  → una clase JS por cada vista
```

**Patrón de estado:** `store.js` centraliza todo el estado de la aplicación. Las páginas solo despachan cambios a través de `actions.js`; ninguna vista modifica el store directamente.

**ES Modules nativos** (`type="module"`) — requiere servidor HTTP local, no funciona con `file://`.

---

## 📁 Estructura de Archivos

```
📦 proyecto-itm/
├── 📄 index.html
├── 📄 app.js
├── 📄 router.js
├── 📂 store/
│   ├── store.js
│   └── actions.js
├── 📂 services/
│   ├── authService.js
│   ├── productService.js
│   └── userService.js
├── 📂 ui/
│   ├── dom.js
│   ├── toasts.js
│   ├── icons.js
│   ├── imageUpload.js
│   ├── charCounter.js
│   └── navigationGuard.js
├── 📂 components/
│   ├── Navbar.js
│   ├── Footer.js
│   ├── Modal.js
│   └── ProductCard.js
├── 📂 pages/
│   ├── AuthPage.js
│   ├── SelectUserPage.js
│   ├── AdminDashboardPage.js
│   ├── BuyerCatalogPage.js
│   ├── ProductDetailPage.js
│   ├── EntrepreneurProductsPage.js
│   ├── EntrepreneurSchedulePage.js
│   └── ProfilePage.js
└── 📂 styles/
    ├── main.css          ← único @import en el HTML
    ├── tokens.css        ← design tokens
    ├── reset.css
    ├── base.css
    ├── layout.css
    ├── utilities.css
    ├── 📂 components/    ← button, form, card, badge, modal, navbar…
    └── 📂 pages/         ← auth, catalog, dashboard, profile…
```

---

## 🚀 Cómo Ejecutar

Este proyecto usa **ES Modules nativos** del navegador. No requiere bundler ni `npm install`.

### Opción 1 — VS Code Live Server (recomendado)

1. Instala la extensión [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Haz clic derecho sobre `index.html` → **"Open with Live Server"**
3. El proyecto abre en `http://localhost:5500`

### Opción 2 — Python HTTP Server

```bash
# Python 3
python -m http.server 8080

# Luego abre: http://localhost:8080
```

### Opción 3 — Node.js `serve`

```bash
npx serve .
```

> ❌ **No abras `index.html` directamente con doble clic.** El protocolo `file://` bloquea los ES Modules por políticas CORS del navegador.

---

## 🔄 Flujos Principales

### Autenticación

```
AuthPage
  ├── Cuenta demo (rol preconfigurado)
  │     └── → mountApp(role) → navigateHome(role)
  ├── Usuario nuevo (registro)
  │     └── → SelectUserPage → elegir rol → mountApp
  └── Error → mensaje inline en el formulario
```

### Creación de Producto (Emprendedor)

```
Emprendedor llena formulario
  └── addMyProduct(data)
        ├── Lee profileData del emprendedor
        ├── Inyecta sellerName / sellerDesc / sellerPhoto
        ├── Genera id: 'tmp-${Date.now()}'
        └── setState → notifica suscriptores
              ├── Comprador: aparece en catálogo
              └── Admin: aparece en dashboard
```

### Sincronización Perfil → Productos

```
ProfilePage guarda cambios
  └── saveProfileData(userId, data)
        └── myProducts.map(): actualiza sellerName, sellerDescription, sellerPhotoUrl
              └── ProductDetailPage: fusiona producto + profileData en tiempo real
```

### Toggle de Estado (Admin)

```
Admin hace clic en "Deshabilitar"
  └── toggleProductStatus(id)
        ├── Invierte status: available ↔ unavailable
        ├── Setea adminDisabled: true / false
        └── setState → re-render en todas las vistas:
              ├── Comprador: producto desaparece del catálogo
              ├── Emprendedor: card con banner "Deshabilitado por Admin"
              │               botones editar/eliminar bloqueados
              └── Admin: botón cambia a "Habilitar"
```

---

## 📏 Reglas de Negocio

### Eliminación de Productos

| Rol | Condición |
|---|---|
| `admin` | Siempre. Confirmación especial si el producto está activo. |
| `entrepreneur` | Solo si `status === 'unavailable'`. Debe desactivarlo primero. |
| `buyer` | Nunca. Sin acceso a esta acción. |

La función `canDeleteProduct(product, role)` en `productService.js` centraliza esta validación. Los botones de UI además verifican el flag `data-deletable` como primera línea de defensa, y `_handleDelete()` re-valida por código como segunda línea (protección contra manipulación por DevTools).

### Flag `adminDisabled`

Cuando un administrador deshabilita un producto, se establece `adminDisabled: true`. Este flag:
- Muestra un banner de bloqueo en la card del emprendedor
- Bloquea la apertura del modal de edición
- Impide la eliminación por parte del emprendedor

### Límites de Caracteres

| Formulario | Campo | Límite |
|---|---|---|
| Perfil Emprendedor | Nombre del emprendimiento | 100 |
| Perfil Emprendedor | Descripción | 500 |
| Perfil Comprador / Admin | Nombre / Apodo | 50 |
| Perfil Comprador / Admin | Sobre ti | 300 |
| Modal Producto | Nombre del producto | 80 |
| Modal Producto | Descripción | 500 |
| Modal Horario | Sede / Ubicación | 100 |

Los contadores muestran alerta visual al alcanzar ≥85% del límite y bloquean al 100%.

---

## ✅ Estado del Proyecto

### Implementado

- ✅ Autenticación simulada con 3 roles + registro en sesión
- ✅ CRUD completo de productos (con imagen drag & drop en base64)
- ✅ CRUD de horarios multi-día para emprendedor
- ✅ Catálogo con filtros dinámicos para comprador
- ✅ Panel de administración con estadísticas y gestión de productos
- ✅ Sincronización perfil → productos en tiempo real
- ✅ Toggle de estado con flag `adminDisabled` y efectos en múltiples vistas
- ✅ Reglas de eliminación por rol con doble validación
- ✅ Navigation guard en formularios y modales (previene pérdida de datos)
- ✅ Contadores de caracteres con umbrales visuales
- ✅ Sistema de toasts accesibles (éxito / error / info)
- ✅ Modelo unificado de productos (colección `products + myProducts`)

### Pendiente por diseño de demo

- ❌ Persistencia de datos entre sesiones
- ❌ Backend / API real
- ❌ Subida real de imágenes
- ❌ Comunicación entre sesiones de distintos usuarios

---

## 🔧 Rama Backend

El backend de este proyecto (en **C#**) se encuentra en una rama separada:

```
git checkout proyecto-backend
```

O directamente en GitHub: [`proyecto-backend`](../../tree/proyecto-backend)

---

<p align="center">
  Hecho con ❤️ · 2026
</p>
