/**
 * pages/EntrepreneurProductsPage.js — Entrepreneur Products Dashboard
 *
 * v4 — Nueva regla de negocio:
 *   EMPRENDEDOR: solo puede eliminar productos con status === 'unavailable'.
 *   Si intenta eliminar un producto disponible → mensaje bloqueante:
 *   "Para eliminar este producto primero debes marcarlo como No disponible".
 *
 *   El botón en la card ya aparece deshabilitado visualmente (ProductCard.js),
 *   pero la restricción también se aplica aquí como segunda línea de defensa.
 *
 * Otras características mantenidas:
 *   - TAREA-1: Contadores de caracteres en modal (nombre 80, descripción 500)
 *   - TAREA-3: Advertencia al cerrar modal con cambios sin guardar (dirtyCheck)
 *   - TAREA-4: D&D consistente — botón "Reemplazar" y "Eliminar" en imagen existente
 */

import { renderFooter }                            from '../components/Footer.js';
import { renderOwnedCard }                         from '../components/ProductCard.js';
import { openModal }                               from '../components/Modal.js';
import { icon }                                    from '../ui/icons.js';
import { byId, val, checked }                      from '../ui/dom.js';
import { notify }                                  from '../ui/notify.js';
import { initUploader, getUploadedFile,
         clearAllUploads }                         from '../ui/imageUpload.js';
import { initCounters }                            from '../ui/charCounter.js';
import { snapshot, isDirty }                       from '../ui/navigationGuard.js';
import { getMyProducts, validateProduct,
         toCategorySlug, canDeleteProduct }      from '../services/productService.js';
import { addMyProduct, updateMyProduct,
         removeMyProduct, setSelectedProduct,
         setEditingProduct }                       from '../store/actions.js';
import { getState }                                from '../store/store.js';
import { navigate }                                from '../router.js';

const CATEGORIES  = ['Artesanías', 'Joyería', 'Alimentos', 'Ropa', 'Tecnología', 'Servicios'];
const UPLOAD_ID   = 'mp-image-upload';
const MODAL_FORM  = 'modal-body';

// Rastrea si el usuario pidió eliminar la imagen existente
let _removeExistingImage = false;

/** @returns {string} */
export function renderEntrepreneurProducts() {
  const products    = getMyProducts();
  const hasProducts = products.length > 0;

  setTimeout(() => {
    byId('btn-new-product')  ?.addEventListener('click', () => _openModal(null));
    byId('btn-first-product')?.addEventListener('click', () => _openModal(null));
    _bindGridActions();
  }, 0);

  return `
    <div class="page">

      <div class="info-banner">
        <div class="info-banner__icon" aria-hidden="true">${icon.store}</div>
        <div>
          <h3 class="info-banner__title">Gestiona tu Emprendimiento</h3>
          <p class="info-banner__desc">
            Administra tu catálogo de productos. Para eliminar un producto,
            primero debes marcarlo como <strong>No disponible</strong>.
          </p>
        </div>
      </div>

      <div class="section-header">
        <div class="section-header__info">
          <h2 class="section-header__title">Mis Productos</h2>
          <p class="section-header__subtitle">Gestiona tu catálogo de productos</p>
        </div>
        <button class="btn btn--primary" id="btn-new-product">
          ${icon.plus} Nuevo Producto
        </button>
      </div>

      ${hasProducts ? _productsGrid(products) : _emptyState()}

    </div>
    ${renderFooter()}
  `;
}

/* ── Templates ── */

function _productsGrid(products) {
  return `
    <div class="grid--products grid--products-owned" id="products-grid">
      ${products.map(renderOwnedCard).join('')}
    </div>
  `;
}

function _emptyState() {
  return `
    <div class="empty-state">
      <div class="empty-state__icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
          <path d="M9 21V12h6v9"/>
        </svg>
      </div>
      <p class="empty-state__title">Sin productos aún</p>
      <p class="empty-state__desc">Crea tu primer producto y comienza a vender en la plataforma.</p>
      <button class="btn btn--primary" id="btn-first-product">
        ${icon.plus} Crear mi primer producto
      </button>
    </div>
  `;
}

/* ── Modal template ── */

function _modalBodyHtml(product) {
  const v        = (v) => v ?? '';
  const selected = (opt, field) => product?.[field] === opt ? 'selected' : '';

  return `
    <div class="form-group">
      <label class="form-label" for="mp-name">
        Nombre del Producto <span style="color:var(--color-danger-base)">*</span>
      </label>
      <input class="form-control" type="text" id="mp-name" autocomplete="off"
             placeholder="Ej: Artesanía en Madera" maxlength="80"
             value="${v(product?.name)}" />
      <div class="form-field-footer">
        <span class="form-error" id="err-mp-name" style="display:none"></span>
        <span class="char-counter" id="count-mp-name">0/80</span>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label" for="mp-desc">Descripción</label>
      <textarea class="form-control" id="mp-desc" rows="3" maxlength="500"
                placeholder="Describe tu producto…">${v(product?.description)}</textarea>
      <div class="form-field-footer">
        <span class="form-error" id="err-mp-desc" style="display:none"></span>
        <span class="char-counter" id="count-mp-desc">0/500</span>
      </div>
    </div>

    <div class="form-grid--2">
      <div class="form-group">
        <label class="form-label" for="mp-price">
          Precio (COP) <span style="color:var(--color-danger-base)">*</span>
        </label>
        <input class="form-control" type="number" id="mp-price" min="0"
               placeholder="Ej: 45000" value="${v(product?.price)}" />
      </div>
      <div class="form-group">
        <label class="form-label" for="mp-category">
          Categoría <span style="color:var(--color-danger-base)">*</span>
        </label>
        <select class="form-control" id="mp-category">
          <option value="">Selecciona una categoría</option>
          ${CATEGORIES.map(c =>
            `<option value="${c}" ${selected(c, 'category')}>${c}</option>`
          ).join('')}
        </select>
      </div>
    </div>

    <div class="toggle-row">
      <label class="toggle">
        <input class="toggle__input" type="checkbox" id="mp-available"
               ${product ? (product.status === 'available' ? 'checked' : '') : 'checked'} />
        <span class="toggle__track"></span>
      </label>
      <span class="toggle__label">Producto disponible</span>
    </div>

    <div class="form-group">
      <label class="form-label">Imagen del Producto</label>
      <div id="${UPLOAD_ID}" class="file-upload" role="button" tabindex="0"
           aria-label="Subir imagen del producto"></div>
      <span class="form-hint">Opcional · JPG, PNG, WebP · máx. 5 MB</span>
    </div>

    <div id="modal-error-wrap" style="margin-bottom:0"></div>
  `;
}

/* ── Modal logic ── */

function _openModal(productId) {
  _removeExistingImage = false;

  const product = productId
    ? getMyProducts().find(p => p.id === productId) ?? null
    : null;

  const isEdit = product !== null;
  setEditingProduct(productId);

  openModal({
    title:        isEdit ? 'Editar Producto' : 'Nuevo Producto',
    subtitle:     isEdit ? 'Modifica los datos del producto' : 'Completa los datos de tu nuevo producto',
    confirmLabel: isEdit ? 'Guardar Cambios' : 'Crear Producto',
    bodyHtml:     _modalBodyHtml(product),
    onConfirm:    isEdit ? () => _handleUpdate(productId) : _handleCreate,
    dirtyCheck:   () => isDirty(MODAL_FORM),
  });

  setTimeout(() => {
    initCounters([
      { inputId: 'mp-name', counterId: 'count-mp-name', maxLen: 80  },
      { inputId: 'mp-desc', counterId: 'count-mp-desc', maxLen: 500 },
    ]);

    initUploader(UPLOAD_ID, {
      label:    'Subir imagen del producto',
      sublabel: 'Arrastra y suelta o haz clic · JPG, PNG, WebP · máx. 5 MB',
    });

    if (isEdit && product.image) {
      _injectExistingImagePreview(product);
    }

    snapshot(MODAL_FORM);
  }, 0);
}

function _injectExistingImagePreview(product) {
  const container = byId(UPLOAD_ID);
  if (!container || !product.image) return;

  container.innerHTML = `
    <input type="file" class="file-upload__input"
           accept="image/jpeg,image/jpg,image/png,image/webp"
           aria-hidden="true" tabindex="-1" style="display:none" />
    <div class="file-upload__preview">
      <img class="file-upload__preview-img"
           src="${product.image}" alt="Imagen actual: ${product.name}" />
    </div>
    <div class="file-upload__preview-meta">
      <span class="file-upload__preview-name">Imagen actual</span>
      <div class="file-upload__preview-actions">
        <button type="button" class="btn btn--secondary btn--sm"
                id="btn-replace-image" aria-label="Reemplazar imagen">
          Reemplazar
        </button>
        <button type="button" class="btn btn--ghost btn--sm"
                id="btn-remove-image" aria-label="Eliminar imagen">
          Eliminar
        </button>
      </div>
    </div>
  `;
  container.classList.add('file-upload--loaded');

  byId('btn-replace-image')?.addEventListener('click', (e) => {
    e.stopPropagation();
    _removeExistingImage = false;
    container.classList.remove('file-upload--loaded');
    initUploader(UPLOAD_ID, {
      label:    'Subir imagen del producto',
      sublabel: 'Arrastra y suelta o haz clic · JPG, PNG, WebP · máx. 5 MB',
    });
  });

  byId('btn-remove-image')?.addEventListener('click', (e) => {
    e.stopPropagation();
    _removeExistingImage = true;
    container.classList.remove('file-upload--loaded');
    initUploader(UPLOAD_ID, {
      label:    'Subir imagen del producto',
      sublabel: 'Arrastra y suelta o haz clic · JPG, PNG, WebP · máx. 5 MB',
    });
    notify.info('Imagen eliminada. Guarda los cambios para confirmar.');
  });
}

/* ── Handlers ── */

function _handleCreate() {
  const name     = val('mp-name');
  const price    = val('mp-price');
  const category = val('mp-category');

  _clearModalErrors();
  const error = validateProduct({ name, price, category });
  if (error) { _showModalError('modal-error-wrap', error); return false; }

  const upload = getUploadedFile(UPLOAD_ID);

  addMyProduct({
    name,
    description:  val('mp-desc'),
    price:        Number(price),
    category,
    categorySlug: toCategorySlug(category),
    status:       checked('mp-available') ? 'available' : 'unavailable',
    image:        upload?.dataUrl ?? '',
  });

  clearAllUploads();
  notify.success(`"${name}" agregado correctamente.`);
  navigate('entrepreneur-products');
}

function _handleUpdate(productId) {
  const name     = val('mp-name');
  const price    = val('mp-price');
  const category = val('mp-category');

  _clearModalErrors();
  const error = validateProduct({ name, price, category });
  if (error) { _showModalError('modal-error-wrap', error); return false; }

  const upload    = getUploadedFile(UPLOAD_ID);
  const existing  = getMyProducts().find(p => p.id === productId);
  const finalImage = _removeExistingImage
    ? ''
    : (upload?.dataUrl || existing?.image || '');

  updateMyProduct(productId, {
    name,
    description:  val('mp-desc'),
    price:        Number(price),
    category,
    categorySlug: toCategorySlug(category),
    status:       checked('mp-available') ? 'available' : 'unavailable',
    image:        finalImage,
  });

  clearAllUploads();
  _removeExistingImage = false;
  setEditingProduct(null);
  notify.success(`"${name}" actualizado correctamente.`);
  navigate('entrepreneur-products');
}

function _showModalError(wrapperId, message) {
  const w = byId(wrapperId);
  if (w) w.innerHTML = `<p class="form-error">${message}</p>`;
}

function _clearModalErrors() {
  const w = byId('modal-error-wrap');
  if (w) w.innerHTML = '';
}

/* ── Grid events ── */

/**
 * Listener delegado sobre el grid de productos.
 *
 * REGLA v5: acción "edit" bloqueada si data-editable === "false" (adminDisabled).
 * REGLA v4: acción "delete" bloqueada si data-deletable === "false" (disponible o adminDisabled).
 */
function _bindGridActions() {
  const grid = byId('products-grid');
  if (!grid) return;

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const { productId, action, deletable, editable } = btn.dataset;

    if (action === 'view')   { _handleView(productId);              return; }
    if (action === 'edit')   { _handleEdit(productId, editable);    return; }
    if (action === 'delete') { _handleDelete(productId, deletable); }
  });
}

function _handleView(productId) {
  setSelectedProduct(productId);
  navigate('product-detail');
}

/**
 * Abre el modal de edición solo si el producto no está bloqueado por el admin.
 * @param {string} productId
 * @param {string} editable  "true" | "false" (desde data-editable)
 */
function _handleEdit(productId, editable) {
  if (editable === 'false') {
    notify.error('Este producto fue deshabilitado por el administrador y no puede editarse.');
    return;
  }
  _openModal(productId);
}

/**
 * Elimina un producto del catálogo del emprendedor.
 *
 * @param {string}          productId
 * @param {string}          deletable  "true" | "false" (desde data-deletable)
 *
 * REGLA DE NEGOCIO:
 *   Si deletable === "false" el producto está disponible y no puede eliminarse.
 *   Se muestra un mensaje informativo y se bloquea la acción.
 */
function _handleDelete(productId, deletable) {
  const product = getMyProducts().find(p => p.id === productId);
  if (!product) return;

  // Verificar regla de negocio a través del servicio centralizado
  const { allowed, reason } = canDeleteProduct(product, 'entrepreneur');
  if (!allowed) {
    notify.error(reason);
    return;
  }

  if (!confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;

  removeMyProduct(productId);
  notify.info(`"${product.name}" eliminado.`);
  navigate('entrepreneur-products');
}
