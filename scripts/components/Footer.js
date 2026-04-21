/**
 * components/Footer.js — Page Footer Component
 *
 * Returns an HTML string. Pages call renderFooter() at the end
 * of their template string rather than having the footer rendered
 * as a separate DOM injection — this ensures correct document flow.
 */

import { icon } from '../ui/icons.js';

/**
 * @returns {string} Footer HTML string
 */
export function renderFooter() {
  return `
    <footer class="footer" role="contentinfo">
      <div class="footer__brand">
        <div class="footer__logo" aria-hidden="true">${icon.store}</div>
        <div>
          <div class="footer__brand-name">Emprendimientos ITM</div>
          <div class="footer__brand-sub">Instituto Tecnológico Metropolitano</div>
        </div>
      </div>
      <div class="footer__copy">
        Conectando emprendedores con la comunidad<br>
        © ${new Date().getFullYear()} Todos los derechos reservados
      </div>
    </footer>
  `;
}
