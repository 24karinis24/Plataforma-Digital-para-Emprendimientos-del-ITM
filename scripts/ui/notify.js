/**
 * ui/notify.js — Toast Notification System
 *
 * Provides non-blocking feedback messages (success, error, info).
 * Replaces alert() calls with accessible, auto-dismissing toasts.
 *
 * Usage:
 *   notify.success('Producto guardado correctamente.');
 *   notify.error('No se pudo procesar la solicitud.');
 *   notify.info('Recuerda actualizar tus horarios.');
 */

import { icon } from './icons.js';

const DURATION_MS = 3500;
const CONTAINER_ID = 'toast-container';

/** Lazily creates the toast container the first time it's needed. */
function _getContainer() {
  let container = document.getElementById(CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = CONTAINER_ID;
    container.className = 'toast-container';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'false');
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Displays a toast notification.
 * @param {'success'|'error'|'info'} type
 * @param {string} message
 */
function _show(type, message) {
  const container = _getContainer();

  const iconMap = {
    success: icon.checkCircle,
    error:   icon.alertCircle,
    info:    icon.info,
  };

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span class="toast__icon">${iconMap[type]}</span>
    <span class="toast__text">${message}</span>
  `;

  container.appendChild(toast);

  // Auto-remove after DURATION_MS with a fade-out animation
  setTimeout(() => {
    toast.style.transition = `opacity ${200}ms ease, transform ${200}ms ease`;
    toast.style.opacity    = '0';
    toast.style.transform  = 'translateX(1rem)';
    setTimeout(() => toast.remove(), 200);
  }, DURATION_MS);
}

export const notify = {
  success: (msg) => _show('success', msg),
  error:   (msg) => _show('error',   msg),
  info:    (msg) => _show('info',    msg),
};
