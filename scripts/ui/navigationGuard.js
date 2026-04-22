/**
 * ui/navigationGuard.js — Navigation Guard for Unsaved Changes
 *
 * Previene pérdida de datos al navegar fuera de un formulario con cambios sin guardar.
 * Integrado con el router para interceptar navegación interna y con el modal para
 * interceptar cierre con cambios.
 *
 * Mensaje estándar: "Tienes cambios sin guardar. ¿Deseas salir sin guardar?"
 *
 * Public API:
 *   setGuard(dirtyFn)         → Registrar función que retorna true si hay cambios
 *   clearGuard()              → Eliminar guardia activa
 *   checkGuard()              → true = puede navegar, false = usuario canceló
 *   snapshot(containerId)     → Tomar instantánea de un formulario
 *   isDirty(containerId)      → true si los valores difieren del snapshot
 */

const MSG = 'Tienes cambios sin guardar. ¿Deseas salir sin guardar?';

/** @type {Function|null} */
let _guard = null;

/** @type {Record<string, string>|null} */
let _snapshot = null;
let _snapshotId = null;

/* ═══════════════════════════════════════════
   Guard API
═══════════════════════════════════════════ */

/**
 * Registra una función que retorna true cuando hay cambios sin guardar.
 * El router llama a checkGuard() antes de cada navegación.
 * @param {() => boolean} dirtyFn
 */
export function setGuard(dirtyFn) {
  _guard = dirtyFn;
}

/** Elimina la guardia activa (llamar tras guardar o cancelar limpiamente). */
export function clearGuard() {
  _guard    = null;
  _snapshot = null;
  _snapshotId = null;
}

/**
 * Verifica si se puede navegar.
 * - Si no hay guardia, retorna true directamente.
 * - Si la guardia detecta cambios, muestra confirm().
 *   • Confirmar → true  (navegar)
 *   • Cancelar  → false (permanecer)
 * @returns {boolean}
 */
export function checkGuard() {
  if (!_guard) return true;
  if (!_guard()) return true; // sin cambios
  return window.confirm(MSG);
}

/* ═══════════════════════════════════════════
   Snapshot API (para comparar con isDirty)
═══════════════════════════════════════════ */

/**
 * Captura el estado actual de todos los campos de un contenedor.
 * Llamar justo después de pre-rellenar el formulario.
 * @param {string} containerId
 */
export function snapshot(containerId) {
  _snapshotId = containerId;
  _snapshot   = _readValues(containerId);
}

/**
 * Retorna true si el formulario difiere del snapshot inicial.
 * @param {string} containerId
 * @returns {boolean}
 */
export function isDirty(containerId) {
  if (!_snapshot || _snapshotId !== containerId) return false;
  return JSON.stringify(_readValues(containerId)) !== JSON.stringify(_snapshot);
}

/* ── Private helpers ── */

function _readValues(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return {};
  const result = {};
  el.querySelectorAll('input, textarea, select').forEach(input => {
    const key = input.id || input.name || input.className;
    if (!key) return;
    result[key] = input.type === 'checkbox' ? String(input.checked) : input.value;
  });
  return result;
}
