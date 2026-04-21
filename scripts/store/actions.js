/**
 * store/actions.js — State Mutations
 *
 * v5 — Sincronización admin → emprendedor → comprador:
 *
 *   toggleProductStatus(id):
 *     Busca en store.products Y en store.myProducts.
 *     Invierte el status en donde encuentre el producto.
 *     Añade flag adminDisabled=true cuando el admin deshabilita,
 *     lo limpia cuando rehabilita.
 *     Notifica a todos los suscriptores → vistas reactivas.
 *
 *   getAllProductsForAdmin():
 *     Devuelve platform products + myProducts fusionados para el panel admin.
 *
 *   getAvailableProducts(filters):
 *     Solo productos con status === 'available'. Para comprador.
 */

import { setState, getState } from './store.js';

/* ── Session ── */

export function setUser(user)  { setState({ currentUser: user }); }
export function setRole(role)  { setState({ role, subNav: 'products' }); }

export function clearSession() {
  setState({
    currentUser:       null,
    role:              null,
    currentPage:       null,
    subNav:            'products',
    myProducts:        [],
    mySchedules:       [],
    selectedProductId: null,
    editingProductId:  null,
    editingScheduleId: null,
  });
}

/* ── Navigation ── */

export function setCurrentPage(page) { setState({ currentPage: page }); }
export function setSubNav(tab)       { setState({ subNav: tab }); }
export function setSelectedProduct(id) { setState({ selectedProductId: id }); }
export function setEditingProduct(id)  { setState({ editingProductId: id }); }
export function setEditingSchedule(id) { setState({ editingScheduleId: id }); }

/* ── Platform products (admin — plataforma) ── */

/**
 * TAREA-SYNC: Invierte el status de un producto buscándolo en ambos arrays.
 *
 * Cuando el ADMIN deshabilita:
 *   status: 'available'   → 'unavailable' + adminDisabled: true
 * Cuando el ADMIN habilita:
 *   status: 'unavailable' → 'available'   + adminDisabled: false
 *
 * Al actualizar el store, _notify() avisa a todos los suscriptores.
 * Si alguna vista está suscrita (subscribe en store.js), se redibujará
 * automáticamente. Las páginas normales se redescargan vía navigate().
 *
 * @param {string} productId
 */
export function toggleProductStatus(productId) {
  const state = getState();

  // 1. Buscar en store.products (catálogo de plataforma)
  const inPlatform = state.products.some(p => p.id === productId);

  if (inPlatform) {
    setState({
      products: state.products.map(p => {
        if (p.id !== productId) return p;
        const nowAvailable = p.status !== 'available';
        return {
          ...p,
          status:       nowAvailable ? 'available' : 'unavailable',
          adminDisabled: nowAvailable ? false : true,
        };
      }),
    });
    return;
  }

  // 2. Buscar en store.myProducts (productos del emprendedor en sesión)
  const inMyProducts = state.myProducts.some(p => p.id === productId);

  if (inMyProducts) {
    setState({
      myProducts: state.myProducts.map(p => {
        if (p.id !== productId) return p;
        const nowAvailable = p.status !== 'available';
        return {
          ...p,
          status:        nowAvailable ? 'available' : 'unavailable',
          adminDisabled: nowAvailable ? false : true,
        };
      }),
    });
  }
}

export function removeProduct(productId) {
  const state = getState();
  // Intenta eliminar de cualquiera de los dos arrays
  setState({
    products:   state.products.filter(p => p.id !== productId),
    myProducts: state.myProducts.filter(p => p.id !== productId),
  });
}

/* ── Entrepreneur's own products ── */

/**
 * Añade producto al catálogo del emprendedor.
 * Inyecta datos del perfil más reciente como datos de vendedor (TAREA-5).
 */
export function addMyProduct(data) {
  const { myProducts = [], currentUser, profileData } = getState();
  const profile = profileData[currentUser?.id ?? ''] ?? {};

  const sellerName        = profile.businessName || currentUser?.name || '';
  const sellerDescription = profile.businessDesc  || '';
  const sellerEmail       = currentUser?.email    || '';

  setState({
    myProducts: [
      ...myProducts,
      {
        id:               `tmp-${Date.now()}`,
        sellerId:         currentUser?.id ?? 'unknown',
        sellerName,
        sellerDescription,
        sellerEmail,
        image:            '',
        adminDisabled:    false,
        createdAt:        new Date().toISOString().split('T')[0],
        ...data,
      },
    ],
  });
}

export function updateMyProduct(id, patch) {
  setState({
    myProducts: getState().myProducts.map(p =>
      p.id === id ? { ...p, ...patch } : p
    ),
  });
}

export function removeMyProduct(id) {
  setState({ myProducts: getState().myProducts.filter(p => p.id !== id) });
}

/* ── Entrepreneur's schedules ── */

export function addMySchedule({ locationName, days, startTime, endTime }) {
  const { mySchedules } = getState();
  setState({
    mySchedules: [
      ...mySchedules,
      { id: `sched-${Date.now()}`, locationName, days, startTime, endTime },
    ],
  });
}

export function updateMySchedule(id, patch) {
  setState({
    mySchedules: getState().mySchedules.map(s =>
      s.id === id ? { ...s, ...patch } : s
    ),
  });
}

export function removeMySchedule(scheduleId) {
  setState({ mySchedules: getState().mySchedules.filter(s => s.id !== scheduleId) });
}

/* ── Profile (in-memory) ── */

/**
 * Guarda perfil y propaga cambios visibles a myProducts (v3 - TAREA-5).
 */
export function saveProfileData(userId, data) {
  if (!userId) return;

  const { profileData, myProducts = [], currentUser } = getState();

  const updatedProfile = { ...(profileData[userId] ?? {}), ...data };

  const isOwner = currentUser?.id === userId;
  const updatedProducts = isOwner
    ? myProducts.map(p => {
        if (p.sellerId !== userId) return p;
        return {
          ...p,
          sellerName:        data.businessName || data.name || p.sellerName,
          sellerDescription: data.businessDesc  ?? p.sellerDescription,
          sellerPhotoUrl:    data.photoUrl       ?? p.sellerPhotoUrl,
        };
      })
    : myProducts;

  setState({
    profileData: { ...profileData, [userId]: updatedProfile },
    myProducts:  updatedProducts,
  });
}

export function getProfileData(userId) {
  if (!userId) return {};
  return getState().profileData[userId] ?? {};
}

/**
 * Perfil público del emprendedor autenticado (v3 - TAREA-5).
 */
export function getEntrepreneurPublicProfile() {
  const { currentUser, profileData } = getState();
  if (!currentUser) return {};
  const profile = profileData[currentUser.id] ?? {};
  return {
    name:        profile.businessName || currentUser.name || '',
    description: profile.businessDesc  || '',
    email:       currentUser.email      || '',
    photoUrl:    profile.photoUrl       || null,
  };
}

/** No-op en demo. */
export function loadUserData(_userId) {}
