/**
 * pages/ProductDetailPage.js — Product Detail View (buyer + entrepreneur)
 *
 * v3 — TAREA-5: Sincronización de perfil en vista pública
 *   - _findProduct() fusiona el producto con los datos actualizados del
 *     perfil del emprendedor (sellerName, sellerDescription, sellerPhotoUrl)
 *     para que "Ver" siempre refleje la información más reciente.
 *   - getEntrepreneurPublicProfile() proporciona el perfil live del
 *     emprendedor autenticado.
 */

import { renderFooter }                            from '../components/Footer.js';
import { icon }                                    from '../ui/icons.js';
import { byId }                                    from '../ui/dom.js';
import { getState }                                from '../store/store.js';
import { getProfileData }                          from '../store/actions.js';
import { getSellerSchedules,
         getCategoryBadgeClass }                   from '../services/productService.js';
import { navigate }                                from '../router.js';

/** @returns {string} */
export function renderProductDetail() {
  const { selectedProductId, role } = getState();

  const product = selectedProductId ? _findProduct(selectedProductId) : null;

  if (!product) {
    setTimeout(() => navigate(role === 'entrepreneur' ? 'entrepreneur-products' : 'buyer-catalog'), 0);
    return '<div class="page"><p>Redirigiendo...</p></div>';
  }

  const schedules      = getSellerSchedules(product.sellerId);
  const catClass       = getCategoryBadgeClass(product.categorySlug);
  const priceFormatted = `$${Number(product.price).toLocaleString('es-CO')}`;
  const isAvailable    = product.status === 'available';
  const fallbackImg    = 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=800&q=80';

  // Avatar del vendedor: foto de perfil si existe, inicial si no
  const sellerInitial  = product.sellerName?.charAt(0).toUpperCase() ?? '?';
  const sellerAvatar   = product.sellerPhotoUrl
    ? `<img src="${product.sellerPhotoUrl}" alt="${product.sellerName}"
            style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-full)" />`
    : sellerInitial;

  const backRoute = role === 'entrepreneur' ? 'entrepreneur-products' : 'buyer-catalog';
  const backLabel = role === 'entrepreneur' ? 'Mis Productos' : 'Catálogo';

  setTimeout(() => {
    byId('btn-back')?.addEventListener('click', () => navigate(backRoute));
  }, 0);

  return `
    <div class="page product-detail-page">

      <div class="product-detail__back">
        <button class="btn btn--ghost btn--sm" id="btn-back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               width="16" height="16" aria-hidden="true">
            <polyline points="15,18 9,12 15,6"/>
          </svg>
          Volver a ${backLabel}
        </button>
      </div>

      <div class="product-detail__layout">

        <!-- Imagen del producto -->
        <div class="product-detail__image-wrap">
          <img class="product-detail__image"
               src="${product.image || fallbackImg}" alt="${product.name}"
               onerror="this.src='${fallbackImg}'" />
        </div>

        <!-- Información -->
        <div class="product-detail__info">

          <div class="product-detail__title-row">
            <h1 class="product-detail__name">${product.name}</h1>
            <span class="badge ${isAvailable ? 'badge--available' : 'badge--unavailable'}">
              ${isAvailable ? 'Disponible' : 'No disponible'}
            </span>
          </div>

          <div style="margin-bottom:var(--space-4)">
            <span class="badge ${catClass}">${product.category ?? ''}</span>
          </div>

          <p class="product-detail__price">${priceFormatted}</p>

          <!-- Tarjeta del emprendedor (TAREA-5: datos siempre actualizados) -->
          <div class="product-detail__seller-card">
            <div class="product-detail__seller-card-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                   width="14" height="14" aria-hidden="true" style="color:var(--color-text-muted)">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span class="product-detail__seller-label">Emprendedor</span>
            </div>
            <div class="product-detail__seller-body">
              <div class="avatar avatar--md product-detail__seller-avatar" aria-hidden="true">
                ${sellerAvatar}
              </div>
              <div class="product-detail__seller-text">
                <p class="product-detail__seller-name">${product.sellerName}</p>
                <p class="product-detail__seller-desc">${product.sellerDescription ?? ''}</p>
                ${product.sellerEmail
                  ? `<p class="product-detail__seller-email">${product.sellerEmail}</p>`
                  : ''}
              </div>
            </div>
          </div>

          <!-- Descripción del producto -->
          <div class="product-detail__section">
            <h3 class="product-detail__section-title">Descripción</h3>
            <p class="product-detail__description">${product.description}</p>
          </div>

          <!-- Horarios -->
          ${schedules.length > 0 ? _schedulesSection(schedules) : ''}

        </div>
      </div>
    </div>
    ${renderFooter()}
  `;
}

/* ── Private ── */

/**
 * TAREA-5: Busca el producto y fusiona los datos del perfil del
 * emprendedor autenticado para que "Ver" muestre información en tiempo real.
 *
 * Prioridad de datos del vendedor:
 *   1. Perfil guardado en profileData (más reciente)
 *   2. Perfil público del emprendedor autenticado (si es el propietario)
 *   3. Datos originales del producto (fallback)
 */
function _findProduct(id) {
  const { products, myProducts = [], currentUser, profileData } = getState();
  const raw = [...products, ...myProducts].find(p => p.id === id);
  if (!raw) return null;

  // Si el propietario está autenticado, enriquecer con perfil actualizado
  const profile = currentUser?.id === raw.sellerId
    ? (profileData[currentUser.id] ?? {})
    : {};

  return {
    ...raw,
    sellerName:        profile.businessName || profile.name || raw.sellerName,
    sellerDescription: profile.businessDesc  ?? raw.sellerDescription,
    sellerPhotoUrl:    profile.photoUrl       ?? raw.sellerPhotoUrl ?? null,
  };
}

function _schedulesSection(schedules) {
  return `
    <div class="product-detail__section">
      <div class="product-detail__where-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             width="16" height="16" aria-hidden="true" style="color:var(--color-text-muted)">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <h3 class="product-detail__section-title" style="margin-bottom:0">Dónde encontrarnos</h3>
      </div>
      <p class="product-detail__where-subtitle">Horarios y ubicaciones del emprendedor</p>
      <div class="product-detail__schedules">
        ${schedules.map(_scheduleCard).join('')}
      </div>
    </div>
  `;
}

function _scheduleCard(s) {
  const daysLabel = Array.isArray(s.days) ? s.days.join(', ') : (s.days ?? '');
  return `
    <div class="detail-schedule-card">
      <div class="detail-schedule-card__row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             width="14" height="14" aria-hidden="true">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <span class="detail-schedule-card__location">${s.locationName}</span>
      </div>
      <div class="detail-schedule-card__row" style="margin-top:var(--space-1)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             width="14" height="14" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
        <span class="detail-schedule-card__days">${daysLabel}</span>
      </div>
      <div class="detail-schedule-card__time">${s.startTime} – ${s.endTime}</div>
    </div>
  `;
}
