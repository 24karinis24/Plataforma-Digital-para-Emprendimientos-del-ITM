/**
 * services/productService.js — Product Business Logic
 *
 * v6 — Fuente de verdad unificada:
 *
 *   MODELO DE DATOS:
 *     - `products`   → productos semilla pre-cargados en el store (creados por emprendedores demo).
 *     - `myProducts` → productos creados por el emprendedor durante la sesión actual.
 *     Ambos arrays son tratados como una única colección de productos de emprendedores.
 *     No existe distinción de "origen" (plataforma vs sesión).
 *
 *   getAvailableProducts(filters)
 *     Solo productos con status === 'available' de AMBOS arrays.
 *     Usado por BuyerCatalogPage — oculta los deshabilitados por admin.
 *
 *   getAllProductsForAdmin(filters)
 *     Todos los productos (products + myProducts) con todos los estados.
 *     Usado por AdminDashboardPage para gestión completa.
 *     Sin etiquetas _source — todos son productos de emprendedores.
 *
 *   getProducts(filters)
 *     Alias de getAvailableProducts (retrocompatibilidad).
 *
 *   getMyProducts()
 *     Productos del emprendedor en sesión (myProducts).
 *
 *   canDeleteProduct(product, role)
 *     Regla de negocio de eliminación por rol.
 *
 *   getCategories()
 *     Categorías de AMBOS arrays (products + myProducts).
 */

import { getState } from '../store/store.js';

/* ═══════════════════════════════════════════
   Helpers internos
═══════════════════════════════════════════ */

/** Devuelve el array unificado de todos los productos (seed + sesión). */
function _allProducts() {
  const { products, myProducts = [] } = getState();
  return [...products, ...myProducts];
}

/* ═══════════════════════════════════════════
   Consultas por rol
═══════════════════════════════════════════ */

/**
 * Para el COMPRADOR: solo productos disponibles de ambos arrays.
 * Oculta automáticamente los que el admin marcó como 'unavailable'.
 *
 * @param {{ query?: string, category?: string }} filters
 * @returns {Product[]}
 */
export function getAvailableProducts(filters = {}) {
  const available = _allProducts().filter(p => p.status === 'available');
  return _applyFilters(available, filters);
}

/**
 * Para el ADMIN: todos los productos (products + myProducts).
 * Incluye Disponibles y No disponibles.
 * Sin distinción de origen — todos son productos de emprendedores.
 *
 * @param {{ query?: string, category?: string }} filters
 * @returns {Product[]}
 */
export function getAllProductsForAdmin(filters = {}) {
  return _applyFilters(_allProducts(), filters);
}

/**
 * Para el EMPRENDEDOR: sus propios productos (solo myProducts).
 * @returns {Product[]}
 */
export function getMyProducts() {
  return getState().myProducts ?? [];
}

/**
 * Retrocompatibilidad — equivalente a getAvailableProducts.
 * @deprecated Usar getAvailableProducts() o getAllProductsForAdmin() según el rol.
 */
export function getProducts(filters = {}) {
  return getAvailableProducts(filters);
}

/**
 * Estadísticas unificadas (admin dashboard).
 * Cuenta en ambos arrays (products + myProducts).
 */
export function getProductStats() {
  const all       = _allProducts();
  const available = all.filter(p => p.status === 'available').length;
  return { total: all.length, available, unavailable: all.length - available };
}

/**
 * Categorías disponibles en el catálogo completo (seed + sesión).
 * Incluye categorías de los productos creados en sesión.
 */
export function getCategories() {
  return [...new Set(_allProducts().map(p => p.category))].sort();
}

/* ═══════════════════════════════════════════
   Validación de producto
═══════════════════════════════════════════ */

export function validateProduct(fields) {
  if (!fields.name?.trim())           return 'El nombre del producto es obligatorio.';
  if (fields.name.trim().length < 3)  return 'El nombre debe tener al menos 3 caracteres.';
  const price = Number(fields.price);
  if (fields.price === '' || fields.price === undefined) return 'El precio es obligatorio.';
  if (isNaN(price) || price < 0)      return 'Ingresa un precio válido (número positivo).';
  if (!fields.category)               return 'Selecciona una categoría.';
  return null;
}

/* ═══════════════════════════════════════════
   Lookups
═══════════════════════════════════════════ */

/**
 * Busca un producto en ambos arrays (products + myProducts).
 * @param {string} id
 * @returns {Product|null}
 */
export function getProductById(id) {
  return _allProducts().find(p => p.id === id) ?? null;
}

/**
 * Horarios del vendedor.
 * Combina sellerSchedules seed con mySchedules si el vendedor es el usuario actual.
 */
export function getSellerSchedules(sellerId) {
  const { sellerSchedules, mySchedules, currentUser } = getState();
  const preSeeded    = sellerSchedules[sellerId] ?? [];
  const ownSchedules = (currentUser?.id === sellerId) ? (mySchedules ?? []) : [];
  return [...preSeeded, ...ownSchedules];
}

/* ═══════════════════════════════════════════
   Helpers de UI
═══════════════════════════════════════════ */

export function getCategoryBadgeClass(slug) {
  return ({
    artesanias: 'badge--artesanias',
    joyeria:    'badge--joyeria',
    alimentos:  'badge--alimentos',
    ropa:       'badge--ropa',
    tecnologia: 'badge--tecnologia',
  })[slug] ?? 'badge--default';
}

export function toCategorySlug(category) {
  return category
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}

/* ═══════════════════════════════════════════
   Regla de negocio — Eliminación
═══════════════════════════════════════════ */

/**
 * Determina si un producto puede ser eliminado según el rol.
 *
 * ADMIN: siempre puede eliminar.
 * EMPRENDEDOR: solo si status === 'unavailable' Y adminDisabled !== true.
 *   (Si el admin lo deshabilitó, el emprendedor no puede eliminarlo directamente.)
 *
 * @param {{ status: string, adminDisabled?: boolean }} product
 * @param {'admin'|'entrepreneur'|'buyer'} role
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function canDeleteProduct(product, role) {
  if (role === 'admin') return { allowed: true };

  if (role === 'entrepreneur') {
    if (product.adminDisabled) {
      return {
        allowed: false,
        reason:  'Este producto fue deshabilitado por el administrador. Contacta al admin para eliminarlo.',
      };
    }
    if (product.status === 'unavailable') return { allowed: true };
    return {
      allowed: false,
      reason:  'Para eliminar este producto primero debes marcarlo como No disponible.',
    };
  }

  return { allowed: false, reason: 'No tienes permisos para eliminar productos.' };
}

/* ── Private ── */

function _applyFilters(products, { query = '', category = '' }) {
  const q = query.toLowerCase().trim();
  return products.filter(p => {
    const matchesQuery    = !q
      || p.name.toLowerCase().includes(q)
      || p.description.toLowerCase().includes(q)
      || p.sellerName?.toLowerCase().includes(q);
    const matchesCategory = !category || p.category === category;
    return matchesQuery && matchesCategory;
  });
}
