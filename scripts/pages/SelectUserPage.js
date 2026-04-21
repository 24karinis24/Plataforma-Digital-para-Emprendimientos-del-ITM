/**
 * pages/SelectUserPage.js — Role Selection Page Controller
 *
 * v3 — TAREA-3:
 *   - Dos tarjetas de rol centradas horizontal y verticalmente
 *   - Clase CSS 'role-card__icon--entrepreneur' con color naranja vibrante
 *     para mejorar contraste y visibilidad del ícono del emprendedor
 *   - Estructura limpia sin lógica duplicada
 */

import { icon } from '../ui/icons.js';
import { byId } from '../ui/dom.js';

const ROLES = [
  {
    key:      'entrepreneur',
    iconHtml: icon.store,
    iconMod:  'role-card__icon--entrepreneur',   // color naranja — TAREA-3
    title:    'Emprendedor',
    desc:     'Vende tus productos y gestiona tu emprendimiento',
    features: [
      'Gestionar catálogo de productos',
      'Definir horarios y sedes',
      'Editar perfil de emprendimiento',
    ],
  },
  {
    key:      'buyer',
    iconHtml: icon.bag,
    iconMod:  'role-card__icon--buyer',          // índigo — mantener
    title:    'Comprador',
    desc:     'Explora y descubre emprendimientos locales',
    features: [
      'Buscar y filtrar productos',
      'Ver horarios de emprendedores',
      'Conectar con vendedores',
    ],
  },
];

/**
 * @param {Function} onRoleSelected  Llamado con la clave del rol elegido
 */
export function initSelectUserPage(onRoleSelected) {
  const container = byId('profile-cards');
  if (!container) return;

  // Clase de grid de 2 columnas centrado (layout.css)
  container.classList.add('profile-grid--two');

  container.innerHTML = ROLES.map(_buildCard).join('');

  // Delegación de eventos — un listener para todos los clicks
  container.addEventListener('click', (e) => {
    const card = e.target.closest('[data-role]');
    if (card) onRoleSelected(card.dataset.role);
  });

  // Soporte de teclado
  container.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const card = e.target.closest('[data-role]');
      if (card) { e.preventDefault(); onRoleSelected(card.dataset.role); }
    }
  });
}

function _buildCard({ key, iconHtml, iconMod, title, desc, features }) {
  return `
    <div class="role-card" data-role="${key}" role="button" tabindex="0"
         aria-label="Seleccionar perfil: ${title}">
      <div class="role-card__icon ${iconMod}" aria-hidden="true">
        ${iconHtml}
      </div>
      <h3 class="role-card__title">${title}</h3>
      <p class="role-card__desc">${desc}</p>
      <ul class="role-card__features" role="list">
        ${features.map(f => `<li>${f}</li>`).join('')}
      </ul>
    </div>
  `;
}
