/**
 * components/ProductCard.js — Reusable Product Card
 *
 * v5 — Sincronización admin → emprendedor:
 *   renderOwnedCard() refleja el flag adminDisabled:
 *     - Banner rojo en la card: "Deshabilitado por el administrador"
 *     - Badge especial: "Deshabilitado por Admin"
 *     - Botón Editar bloqueado (visualmente y en data-editable="false")
 *     - Botón Eliminar bloqueado con mensaje específico
 *     - Imagen con overlay oscurecido
 *
 *   La restricción de disponibilidad para eliminar (v4) se mantiene.
 *   data-deletable y data-editable comunican el estado al controller.
 */

import { icon }                  from '../ui/icons.js';
import { getCategoryBadgeClass } from '../services/productService.js';

/* ── Buyer catalog card ── */

export function renderCatalogCard(product) {
  const catClass       = getCategoryBadgeClass(product.categorySlug);
  const priceFormatted = _fmt(product.price);
  const initial        = product.sellerName?.charAt(0).toUpperCase() ?? '?';
  const fallbackImg    = 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=600&q=80';

  return `
    <article class="product-card" data-product-id="${product.id}">
      <div class="product-card__image">
        <img src="${product.image || fallbackImg}" alt="${product.name}"
             loading="lazy" onerror="this.src='${fallbackImg}'" />
      </div>
      <div class="product-card__body">
        <div class="product-card__top">
          <h3 class="product-card__name">${product.name}</h3>
          <span class="badge badge--available">Disponible</span>
        </div>
        <div class="product-card__category">
          <span class="badge ${catClass}">${product.category}</span>
        </div>
        <p class="product-card__desc">${product.description}</p>
        <p class="product-card__price">${priceFormatted}</p>
        <div class="product-card__seller">
          <div class="avatar avatar--sm" aria-hidden="true">${initial}</div>
          <div class="product-card__seller-info">
            <div class="product-card__seller-name">${product.sellerName}</div>
            <div class="product-card__seller-desc">${product.sellerDescription}</div>
          </div>
        </div>
        <button class="product-card__cta" aria-label="Ver detalles de ${product.name}">
          ${icon.eye} Ver Detalles
        </button>
      </div>
    </article>
  `;
}

/* ── Entrepreneur owned card ── */

/**
 * Card del emprendedor en "Mis Productos".
 *
 * Estados visuales:
 *   disponible       → normal
 *   no disponible    → badge gris
 *   adminDisabled    → banner rojo + badge especial + Editar/Eliminar bloqueados
 *
 * data-deletable="true|false" y data-editable="true|false" comunican
 * el estado al listener delegado en EntrepreneurProductsPage.
 */
export function renderOwnedCard(product) {
  const catClass      = getCategoryBadgeClass(product.categorySlug);
  const isAvailable   = product.status === 'available';
  const isAdminLocked = product.adminDisabled === true;

  const statusClass = isAdminLocked
    ? 'badge--admin-disabled'
    : (isAvailable ? 'badge--available' : 'badge--unavailable');
  const statusLabel = isAdminLocked
    ? 'Deshabilitado por Admin'
    : (isAvailable ? 'Disponible' : 'No disponible');

  const price       = _fmt(product.price);
  const fallbackImg = 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=600&q=80';

  // Botón Editar — bloqueado si adminDisabled
  const editBlocked  = isAdminLocked;
  const editTitle    = isAdminLocked
    ? 'Producto deshabilitado por el administrador'
    : `Editar ${product.name}`;
  const editClass    = editBlocked
    ? 'btn btn--primary btn--sm owned-card__btn-edit owned-card__btn-edit--locked'
    : 'btn btn--primary btn--sm owned-card__btn-edit';

  // Botón Eliminar — bloqueado si disponible O si adminDisabled
  const deleteBlocked = isAvailable || isAdminLocked;
  const deleteTitle   = isAdminLocked
    ? 'Deshabilitado por el administrador — contacta al admin para eliminar'
    : (isAvailable
        ? 'Para eliminar primero debes marcarlo como No disponible'
        : `Eliminar ${product.name}`);
  const deleteClass   = deleteBlocked
    ? 'btn btn--danger btn--sm owned-card__btn-delete owned-card__btn-delete--locked'
    : 'btn btn--danger btn--sm owned-card__btn-delete';

  return `
    <article class="owned-card${isAdminLocked ? ' owned-card--admin-locked' : ''}"
             data-product-id="${product.id}">

      ${isAdminLocked ? `
        <div class="owned-card__admin-banner" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               width="13" height="13" aria-hidden="true" style="flex-shrink:0">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          Deshabilitado por el administrador
        </div>` : ''}

      <div class="owned-card__image${isAdminLocked ? ' owned-card__image--dimmed' : ''}">
        <img src="${product.image || fallbackImg}" alt="${product.name}"
             loading="lazy" onerror="this.src='${fallbackImg}'" />
      </div>

      <div class="owned-card__body">
        <div class="owned-card__header">
          <h3 class="owned-card__name">${product.name}</h3>
          <span class="badge ${statusClass}">${statusLabel}</span>
        </div>
        ${product.description ? `<p class="owned-card__desc">${product.description}</p>` : ''}
        <div class="owned-card__meta">
          <span class="owned-card__price">${price}</span>
          ${product.category ? `<span class="badge ${catClass}">${product.category}</span>` : ''}
        </div>
      </div>

      <div class="owned-card__actions">
        <button class="btn btn--ghost btn--sm"
                data-action="view" data-product-id="${product.id}"
                aria-label="Ver ${product.name}">
          ${icon.eye} Ver
        </button>

        <button class="${editClass}"
                data-action="edit" data-product-id="${product.id}"
                data-editable="${!editBlocked}"
                title="${editTitle}" aria-label="${editTitle}"
                ${editBlocked ? 'aria-disabled="true"' : ''}>
          ${icon.edit} Editar
        </button>

        <button class="${deleteClass}"
                data-action="delete" data-product-id="${product.id}"
                data-deletable="${!deleteBlocked}"
                title="${deleteTitle}" aria-label="${deleteTitle}"
                ${deleteBlocked ? 'aria-disabled="true"' : ''}>
          ${icon.trash} Eliminar
        </button>
      </div>

    </article>
  `;
}

/* ── Private ── */
function _fmt(amount) {
  return `$${Number(amount).toLocaleString('es-CO')}`;
}
