/**
 * pages/BuyerCatalogPage.js — Buyer Product Catalog Page
 *
 * v5 — Sincronización admin → comprador:
 *   Usa getAvailableProducts() en lugar de getProducts().
 *   Los productos que el admin marcó como "No disponible" quedan
 *   automáticamente excluidos del catálogo visible al comprador.
 *   Los filtros de búsqueda también respetan esta restricción.
 */

import { renderFooter }                           from '../components/Footer.js';
import { renderCatalogCard }                      from '../components/ProductCard.js';
import { getAvailableProducts, getCategories }    from '../services/productService.js';
import { byId, delegate }                         from '../ui/dom.js';
import { setSelectedProduct }                     from '../store/actions.js';
import { navigate }                               from '../router.js';

/** @returns {string} */
export function renderBuyerCatalog() {
  // Solo productos disponibles — los deshabilitados por admin no aparecen
  const products   = getAvailableProducts();
  const categories = getCategories();

  setTimeout(_bindEvents, 0);

  return `
    <div class="page--full">

      <div class="catalog-hero">
        <div style="max-width:var(--content-max-width);margin:0 auto;padding:0 var(--space-8)">
          <h1 class="catalog-hero__title">Catálogo de Productos</h1>
          <p class="catalog-hero__subtitle">Descubre emprendimientos locales de la comunidad ITM</p>
        </div>
      </div>

      <div class="catalog-filters">
        <div style="max-width:var(--content-max-width);margin:0 auto">
          <h3 class="catalog-filters__title">Buscar Productos</h3>
          <div class="catalog-filters__row">
            <div>
              <label class="catalog-filters__label" for="catalog-search">Palabras Clave</label>
              <div class="form-input-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input class="form-control" type="search" id="catalog-search"
                       placeholder="Buscar por nombre, descripción o vendedor..."
                       autocomplete="off" aria-label="Buscar productos" />
              </div>
            </div>
            <div>
              <label class="catalog-filters__label" for="catalog-category">Categoría</label>
              <select class="form-control" id="catalog-category" aria-label="Filtrar por categoría">
                <option value="">Todas las categorías</option>
                ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="catalog-products" style="max-width:var(--content-max-width);margin:0 auto">
        <p class="catalog-products__meta" id="catalog-meta">
          ${_metaText(products.length)}
        </p>
        <div class="grid--products" id="catalog-grid">
          ${products.length > 0
            ? products.map(renderCatalogCard).join('')
            : _emptyState('No hay productos disponibles en este momento.')}
        </div>
      </div>

    </div>
    ${renderFooter()}
  `;
}

/* ── Private ── */

function _bindEvents() {
  const searchInput    = byId('catalog-search');
  const categorySelect = byId('catalog-category');

  if (searchInput && categorySelect) {
    const _filter = () => {
      // Siempre filtrar solo entre disponibles
      const filtered = getAvailableProducts({
        query:    searchInput.value,
        category: categorySelect.value,
      });
      _updateGrid(filtered);
    };
    searchInput.addEventListener('input', _filter);
    categorySelect.addEventListener('change', _filter);
  }

  // Delegación para "Ver detalles"
  const grid = byId('catalog-grid');
  if (grid) {
    grid.addEventListener('click', (e) => {
      const cta = e.target.closest('.product-card__cta');
      if (!cta) return;
      const card = cta.closest('[data-product-id]');
      if (!card) return;
      setSelectedProduct(card.dataset.productId);
      navigate('product-detail');
    });
  }
}

function _updateGrid(products) {
  const grid = byId('catalog-grid');
  const meta = byId('catalog-meta');

  if (grid) {
    grid.innerHTML = products.length > 0
      ? products.map(renderCatalogCard).join('')
      : _emptyState('No se encontraron productos con ese criterio.');
  }

  if (meta) meta.textContent = _metaText(products.length);
}

function _metaText(n) {
  return `${n} producto${n !== 1 ? 's' : ''} encontrado${n !== 1 ? 's' : ''}.`;
}

function _emptyState(message) {
  return `
    <div style="grid-column:1/-1">
      <div class="empty-state">
        <div class="empty-state__icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <p class="empty-state__title">Sin resultados</p>
        <p class="empty-state__desc">${message}</p>
      </div>
    </div>
  `;
}
