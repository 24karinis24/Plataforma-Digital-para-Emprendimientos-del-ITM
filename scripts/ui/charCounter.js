/**
 * ui/charCounter.js — Character Counter Utility
 *
 * Aplica contadores dinámicos de caracteres a cualquier input/textarea.
 * Formato obligatorio: "0/100", "0/250", etc.
 * Admite varios pares input→counter en una sola llamada (initCounters).
 *
 * Public API:
 *   initCounter(inputId, counterId, maxLen)
 *   initCounters(pairs)   → pairs: [{ inputId, counterId, maxLen }]
 *   syncCounter(inputEl, counterEl, maxLen)  → update a single counter immediately
 */

/**
 * Registra un contador para un único campo.
 *
 * @param {string} inputId    - ID del input o textarea
 * @param {string} counterId  - ID del elemento que muestra "N/MAX"
 * @param {number} maxLen     - Límite máximo de caracteres (debe coincidir con maxlength)
 */
export function initCounter(inputId, counterId, maxLen) {
  const input   = document.getElementById(inputId);
  const counter = document.getElementById(counterId);
  if (!input || !counter) return;

  const update = () => {
    const len = input.value.length;
    counter.textContent = `${len}/${maxLen}`;
    // Indicador visual cuando se acerca al límite
    counter.classList.toggle('char-counter--warn',  len >= Math.floor(maxLen * 0.85));
    counter.classList.toggle('char-counter--limit', len >= maxLen);
  };

  input.addEventListener('input', update);
  update(); // sincronizar estado inicial (pre-relleno)
}

/**
 * Registra contadores para múltiples campos en una sola llamada.
 *
 * @param {Array<{ inputId: string, counterId: string, maxLen: number }>} pairs
 */
export function initCounters(pairs) {
  pairs.forEach(({ inputId, counterId, maxLen }) => {
    initCounter(inputId, counterId, maxLen);
  });
}

/**
 * Sincroniza inmediatamente el texto del contador sin registrar listeners.
 * Útil para pre-rellenar contadores antes de que el usuario escriba.
 *
 * @param {HTMLElement} inputEl
 * @param {HTMLElement} counterEl
 * @param {number}      maxLen
 */
export function syncCounter(inputEl, counterEl, maxLen) {
  if (!inputEl || !counterEl) return;
  const len = inputEl.value?.length ?? 0;
  counterEl.textContent = `${len}/${maxLen}`;
}
