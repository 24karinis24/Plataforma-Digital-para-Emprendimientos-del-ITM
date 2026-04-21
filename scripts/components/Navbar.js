/**
 * components/Navbar.js — Top Navigation Bar Component
 *
 * FIX (v2): Added syncSubNavActive() export.
 *   Root cause of navigation bug: mountSubNav uses a stale closure over
 *   activeTab, so clicking "Inicio" in the navbar re-renders the page content
 *   but never updates the sub-nav active classes.
 *
 *   Fix: router.js calls syncSubNavActive(tab) after every navigate() call
 *   to an entrepreneur page, keeping DOM in sync without re-attaching listeners.
 */

import { icon } from '../ui/icons.js';
import { byId } from '../ui/dom.js';

export function mountNavbar({ onHome, onProfile, onLogout }) {
  const el = byId('main-navbar');
  if (!el) return;

  el.innerHTML = _navbarTemplate();

  byId('nav-brand')  ?.addEventListener('click', onHome);
  byId('nav-home')   ?.addEventListener('click', onHome);
  byId('nav-profile')?.addEventListener('click', onProfile);
  byId('nav-logout') ?.addEventListener('click', onLogout);
}

/**
 * Mounts the sub-nav and wires a single delegated click listener.
 * The listener calls onChange(tab) — app.js translates tab → route.
 *
 * @param {string}   activeTab  'products' | 'schedule'
 * @param {Function} onChange   Called with the clicked tab key
 */
export function mountSubNav(activeTab, onChange) {
  const el = byId('sub-nav');
  if (!el) return;

  el.innerHTML = _subNavTemplate(activeTab);

  el.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tab]');
    if (!btn) return;
    const tab = btn.dataset.tab;
    // Visual sync happens via syncSubNavActive, called from router after navigate()
    onChange(tab);
  });
}

/**
 * Syncs the sub-nav active-state CSS without re-mounting the component.
 * Called by router.js after every navigate() to an entrepreneur page
 * so the sub-nav always reflects the current page, regardless of how
 * the navigation was triggered (click, _navHome, etc.).
 *
 * @param {'products'|'schedule'} activeTab
 */
export function syncSubNavActive(activeTab) {
  const el = byId('sub-nav');
  if (!el) return;
  el.querySelectorAll('[data-tab]').forEach(btn => {
    const isActive = btn.dataset.tab === activeTab;
    btn.classList.toggle('sub-nav__link--active', isActive);
    btn.setAttribute('aria-selected', String(isActive));
  });
}

export function mountAuthLogo() {
  const el = document.querySelector('.auth-card__logo');
  if (el) el.innerHTML = icon.store;
}

/* ── Templates ── */

function _navbarTemplate() {
  return `
    <button class="navbar__brand" id="nav-brand" aria-label="Ir al inicio">
      <div class="navbar__logo" aria-hidden="true">${icon.store}</div>
      <span class="navbar__name">Emprendimientos ITM</span>
    </button>
    <nav class="navbar__nav" aria-label="Navegación principal">
      <button class="navbar__link" id="nav-home">${icon.home}<span>Inicio</span></button>
      <button class="navbar__link" id="nav-profile">${icon.profile}<span>Perfil</span></button>
      <button class="navbar__link" id="nav-logout">${icon.logout}<span>Cerrar Sesión</span></button>
    </nav>
  `;
}

function _subNavTemplate(activeTab) {
  const tabs = [
    { key: 'products', label: 'Mis Productos',   iconHtml: icon.grid  },
    { key: 'schedule', label: 'Horarios y Sedes', iconHtml: icon.clock },
  ];
  return tabs.map(t => `
    <button class="sub-nav__link ${t.key === activeTab ? 'sub-nav__link--active' : ''}"
            data-tab="${t.key}" aria-selected="${t.key === activeTab}" role="tab">
      ${t.iconHtml}<span>${t.label}</span>
    </button>
  `).join('');
}
