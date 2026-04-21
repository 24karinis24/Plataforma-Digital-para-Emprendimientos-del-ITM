/**
 * pages/AdminDashboardPage.js — Admin Dashboard Page
 *
 * v6 — Gestión simplificada de productos:
 *   Todos los productos son considerados creados por emprendedores.
 *   No existe distinción de "origen" (plataforma vs sesión).
 *   Eliminadas: columna "Origen", leyenda visual, badges _source.
 *
 *   Usa getAllProductsForAdmin() que incluye products + myProducts unificados.
 *   toggleProductStatus() actúa sobre cualquiera de los dos arrays.
 *   removeProduct() también actúa sobre ambos arrays.
 *
 * Regla de eliminación para admin: sin restricción de estado.
 */

import { renderFooter }                            from '../components/Footer.js';
import { icon }                                    from '../ui/icons.js';
import { delegate }                                from '../ui/dom.js';
import { notify }                                  from '../ui/notify.js';
import { getAllProductsForAdmin,
         getProductStats }                         from '../services/productService.js';
import { toggleProductStatus, removeProduct }      from '../store/actions.js';
import { navigate }                                from '../router.js';

/** @returns {string} */
export function renderAdminDashboard() {
  const stats    = getProductStats();
  const products = getAllProductsForAdmin();

  setTimeout(_bindEvents, 0);

  return `
    <div class="page">

      <div class="page-header">
        <h1 class="page-header__title">Panel de Administración</h1>
        <p class="page-header__subtitle">Gestiona los productos y emprendimientos de la plataforma</p>
      </div>

      <!-- Estadísticas -->
      <div class="grid--stats" style="margin-bottom:var(--space-8)">
        ${_statCard('Total Productos',  'Todos los emprendimientos',  stats.total,       '')}
        ${_statCard('Disponibles',      'Productos activos',          stats.available,   'stat-card__label--primary stat-card__number--primary')}
        ${_statCard('No Disponibles',   'Productos deshabilitados',   stats.unavailable, 'stat-card__label--muted')}
      </div>

      <!-- Banner de permisos admin -->
      <div class="admin-rule-banner" role="note" aria-label="Permisos de administración">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             width="16" height="16" aria-hidden="true" style="flex-shrink:0">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <span>
          Ves <strong>todos</strong> los productos de emprendedores (activos e inactivos).
          Puedes habilitar/deshabilitar o eliminar cualquier producto sin restricción.
          Los cambios se reflejan en tiempo real en las vistas del Comprador y Emprendedor.
        </span>
      </div>

      <!-- Tabla de productos -->
      <div class="card" id="admin-table-card">
        <div class="card__header">
          <h3 class="card__header-title">Gestión de Productos</h3>
          <p class="card__header-subtitle">
            ${stats.total} producto${stats.total !== 1 ? 's' : ''} de emprendedores registrado${stats.total !== 1 ? 's' : ''}
          </p>
        </div>

        <div style="overflow-x:auto">
          <table class="data-table" id="admin-products-table" aria-label="Todos los productos">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Estado</th>
                <th style="text-align:right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${products.length > 0
                ? products.map(_productRow).join('')
                : `<tr><td colspan="5" style="text-align:center;padding:var(--space-10);color:var(--color-text-muted)">
                     No hay productos registrados.
                   </td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

    </div>
    ${renderFooter()}
  `;
}

/* ── Private: templates ── */

function _statCard(label, sublabel, number, extraClasses) {
  return `
    <div class="stat-card">
      <div class="stat-card__label ${extraClasses}">${label}</div>
      <div class="stat-card__sublabel">${sublabel}</div>
      <div class="stat-card__number ${extraClasses}">${number}</div>
    </div>
  `;
}

function _productRow(p) {
  const isAvailable = p.status === 'available';

  return `
    <tr class="${!isAvailable ? 'data-table__row--disabled' : ''}">
      <td>
        <div class="data-table__name">${p.name}</div>
        <div class="data-table__desc">${p.description}</div>
      </td>
      <td>${p.category}</td>
      <td style="font-weight:var(--weight-semibold)">$${Number(p.price).toLocaleString('es-CO')}</td>
      <td>
        <span class="badge ${isAvailable ? 'badge--available' : 'badge--unavailable'}">
          ${isAvailable ? 'Disponible' : 'No disponible'}
        </span>
      </td>
      <td>
        <div class="data-table__actions">
          <button class="btn btn--secondary btn--sm js-toggle"
                  data-id="${p.id}"
                  aria-label="${isAvailable ? 'Deshabilitar' : 'Habilitar'} ${p.name}">
            ${icon.check}
            ${isAvailable ? 'Deshabilitar' : 'Habilitar'}
          </button>
          <button class="btn btn--danger btn--sm js-delete"
                  data-id="${p.id}"
                  data-status="${p.status}"
                  data-name="${p.name}"
                  aria-label="Eliminar ${p.name}">
            ${icon.trash}
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  `;
}

/* ── Private: events ── */

function _bindEvents() {
  delegate('admin-products-table', '.js-toggle', 'click', (btn) => {
    toggleProductStatus(btn.dataset.id);
    navigate('admin-dashboard');
    notify.info('Estado del producto actualizado. El cambio es visible para Comprador y Emprendedor.');
  });

  delegate('admin-products-table', '.js-delete', 'click', (btn) => {
    const id     = btn.dataset.id;
    const name   = btn.dataset.name || 'este producto';
    const status = btn.dataset.status;

    const warning = status === 'available'
      ? `"${name}" está actualmente DISPONIBLE.\n¿Confirmas que deseas eliminarlo?`
      : `¿Eliminar "${name}" permanentemente?`;

    if (!confirm(warning)) return;

    removeProduct(id);
    navigate('admin-dashboard');
    notify.success('Producto eliminado de la plataforma.');
  });
}
