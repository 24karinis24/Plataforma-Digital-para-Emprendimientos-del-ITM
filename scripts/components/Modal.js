/**
 * components/Modal.js — Generic Modal Component
 *
 * TAREA-3: Advertencia al cerrar con cambios sin guardar.
 *   - openModal() acepta dirtyCheck?: () => boolean en su config.
 *   - Si dirtyCheck() retorna true, muestra confirm() antes de cerrar
 *     al usar Cancel, X, backdrop o Escape.
 *   - El botón Confirmar nunca muestra la advertencia (el handler de
 *     negocio decide si cierra o mantiene el modal abierto).
 *
 * TAREA-4: clearAllUploads() al cerrar para limpiar estado de imageUpload.
 */

import { byId }              from '../ui/dom.js';
import { clearAllUploads }   from '../ui/imageUpload.js';

const OVERLAY_ID   = 'modal-overlay';
const UNSAVED_MSG  = 'Tienes cambios sin guardar. ¿Deseas salir sin guardar?';

let _onConfirm  = null;
/** @type {(() => boolean) | null} */
let _dirtyCheck = null;

/**
 * @param {{
 *   title:         string,
 *   subtitle?:     string,
 *   bodyHtml:      string,
 *   confirmLabel?: string,
 *   onConfirm:     Function,     — return false to keep modal open
 *   dirtyCheck?:   () => boolean — return true if there are unsaved changes
 * }} config
 */
export function openModal({ title, subtitle = '', bodyHtml, confirmLabel = 'Guardar', onConfirm, dirtyCheck }) {
  _onConfirm  = onConfirm;
  _dirtyCheck = dirtyCheck ?? null;

  const overlay = byId(OVERLAY_ID);
  if (!overlay) return;

  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true"
         aria-labelledby="modal-title" id="modal-dialog">

      <div class="modal__header">
        <div>
          <h3 class="modal__title" id="modal-title">${title}</h3>
          ${subtitle ? `<p class="modal__subtitle">${subtitle}</p>` : ''}
        </div>
        <button class="modal__close" id="modal-close" aria-label="Cerrar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               width="18" height="18" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="modal__body" id="modal-body">${bodyHtml}</div>

      <div class="modal__footer">
        <button class="btn btn--secondary" id="modal-cancel">Cancelar</button>
        <button class="btn btn--primary"   id="modal-confirm">${confirmLabel}</button>
      </div>
    </div>
  `;

  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden', 'false');

  byId('modal-close') ?.addEventListener('click', _handleGuardedClose);
  byId('modal-cancel')?.addEventListener('click', _handleGuardedClose);
  byId('modal-confirm')?.addEventListener('click', _handleConfirm);

  overlay.addEventListener('click', _handleBackdrop);
  document.addEventListener('keydown', _handleEscape);

  setTimeout(() => {
    overlay.querySelector('input, textarea, select, button')?.focus();
  }, 60);
}

/** Cierra el modal sin verificar cambios (usado tras guardar exitosamente). */
export function closeModal() {
  const overlay = byId(OVERLAY_ID);
  if (!overlay) return;

  clearAllUploads();

  overlay.classList.add('hidden');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = '';
  _onConfirm  = null;
  _dirtyCheck = null;

  document.removeEventListener('keydown', _handleEscape);
  overlay.removeEventListener('click', _handleBackdrop);
}

/* ── Private ── */

/**
 * TAREA-3: Antes de cerrar (X, Cancelar, backdrop, Escape), verifica si
 * hay cambios sin guardar y pide confirmación si es necesario.
 */
function _handleGuardedClose() {
  if (_dirtyCheck && _dirtyCheck()) {
    if (!window.confirm(UNSAVED_MSG)) return; // usuario elige continuar editando
  }
  closeModal();
}

function _handleConfirm() {
  if (typeof _onConfirm === 'function') {
    const shouldClose = _onConfirm();
    if (shouldClose !== false) closeModal();
  }
}

function _handleBackdrop(e) {
  if (e.target.id === OVERLAY_ID) _handleGuardedClose();
}

function _handleEscape(e) {
  if (e.key === 'Escape') _handleGuardedClose();
}
