/**
 * ui/dom.js — DOM Manipulation Helpers
 *
 * Pure functions that wrap common DOM operations.
 * Centralizing these calls means:
 *   1. Pages/components stay readable — no verbose querySelector noise.
 *   2. Error handling for missing elements is in one place.
 *   3. Easy to swap for a virtual DOM if migrating to a framework.
 */

/**
 * Returns an element by ID. Warns (not throws) if not found,
 * so a missing element doesn't crash an unrelated part of the app.
 *
 * @param {string} id
 * @returns {HTMLElement|null}
 */
export function byId(id) {
  const el = document.getElementById(id);
  if (!el) console.warn(`[dom] Element #${id} not found.`);
  return el;
}

/**
 * Injects HTML into an element, replacing its content.
 * After injection, runs the optional callback (used to attach listeners).
 *
 * @param {string}   id       - Target element ID
 * @param {string}   html     - HTML string to inject
 * @param {Function} [onDone] - Called after injection
 */
export function render(id, html, onDone) {
  const el = byId(id);
  if (!el) return;
  el.innerHTML = html;
  onDone?.();
}

/**
 * Toggles the .hidden class on an element.
 * @param {string}  id
 * @param {boolean} visible
 */
export function setVisible(id, visible) {
  byId(id)?.classList.toggle('hidden', !visible);
}

/**
 * Switches which of several views is visible.
 * All views in the map are hidden first, then the active one is shown.
 * This prevents flicker from a brief period where multiple views are visible.
 *
 * @param {Record<string, boolean>} viewMap - { viewId: shouldBeVisible }
 */
export function switchView(viewMap) {
  Object.entries(viewMap).forEach(([id, visible]) => setVisible(id, visible));
}

/**
 * Reads a form field value by element ID and trims whitespace.
 * @param {string} id
 * @returns {string}
 */
export function val(id) {
  return byId(id)?.value?.trim() ?? '';
}

/**
 * Reads a checkbox's checked state by element ID.
 * @param {string} id
 * @returns {boolean}
 */
export function checked(id) {
  return byId(id)?.checked ?? false;
}

/**
 * Resets a form by clearing all input/textarea/select values.
 * @param {string} formContainerId
 */
export function resetForm(formContainerId) {
  const container = byId(formContainerId);
  if (!container) return;
  container.querySelectorAll('input, textarea, select').forEach(el => {
    if (el.type === 'checkbox') el.checked = true; // default toggles to "on"
    else el.value = '';
  });
}

/**
 * Attaches a delegated event listener to a container.
 * More efficient than attaching to each child element individually,
 * and survives dynamic content re-renders.
 *
 * @param {string}   containerId
 * @param {string}   selector    - CSS selector to match against event.target
 * @param {string}   event       - Event type (e.g. 'click')
 * @param {Function} handler     - Called with (matchedElement, originalEvent)
 */
export function delegate(containerId, selector, event, handler) {
  const container = byId(containerId);
  if (!container) return;
  container.addEventListener(event, (e) => {
    const matched = e.target.closest(selector);
    if (matched) handler(matched, e);
  });
}
