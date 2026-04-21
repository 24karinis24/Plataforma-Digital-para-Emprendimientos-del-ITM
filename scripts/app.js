/**
 * app.js — Application Entry Point & Compositor
 *
 * CORRECCIONES APLICADAS:
 *   - SIN localStorage / sessionStorage / cookies (restricción de demo)
 *   - checkSession() devuelve la sesión en memoria → siempre null al recargar
 *   - refreshSession importado desde authService (no-op en demo)
 *   - Formularios de auth limpios al mostrar la vista de autenticación
 */

import { setRole, setUser, clearSession,
         loadUserData }                     from './store/actions.js';
import { getState }                         from './store/store.js';
import { notify }                           from './ui/notify.js';
import { mountNavbar, mountSubNav }         from './components/Navbar.js';
import { navigate, navigateHome, showView } from './router.js';
import { initAuthPage, clearAuthForms }     from './pages/AuthPage.js';
import { initSelectUserPage }               from './pages/SelectUserPage.js';
import { checkSession, logout,
         selectRole, refreshSession }       from './services/authService.js';

/* ═══════════════════════════════════════════
   Bootstrap
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initAuthPage(_onAuthSuccess);
  initSelectUserPage(_onRoleSelected);

  document.querySelector('.help-btn')
    ?.addEventListener('click', () => notify.info('Soporte: soporte@itm.edu.co'));

  // Refresca la sesión con cualquier interacción (no-op en demo)
  document.addEventListener('click',   refreshSession, { passive: true });
  document.addEventListener('keydown', refreshSession, { passive: true });

  _tryRestoreSession();
  console.info('[app] Emprendimientos ITM — Demo Frontend v5.2 (sin persistencia)');
});

/* ─────────────────────────────────────────────
   Restore session
   Sin localStorage: siempre inicia en la vista de auth
───────────────────────────────────────────── */

function _tryRestoreSession() {
  const session = checkSession(); // null en cada recarga (sin persistencia)

  if (!session) {
    showView('auth');
    return;
  }

  // Rama activa solo cuando se navega dentro de la misma sesión en memoria
  const user = { id: session.id, name: session.name, email: session.email, role: session.role };
  setUser(user);
  loadUserData(session.id);

  if (!session.role) {
    showView('select');
  } else {
    setRole(session.role);
    _mountApp(session.role);
  }
}

/* ═══════════════════════════════════════════
   Auth flow
═══════════════════════════════════════════ */

/** Llamado por AuthPage tras login o registro exitoso. */
function _onAuthSuccess(user, isFirstLogin) {
  setUser(user);
  loadUserData(user.id);

  if (isFirstLogin || !user.role) {
    showView('select');
  } else {
    setRole(user.role);
    _mountApp(user.role);
  }
}

/** Llamado por SelectUserPage cuando el usuario elige un rol. */
function _onRoleSelected(role) {
  const { currentUser } = getState();
  if (!currentUser) return;

  selectRole(currentUser.id, role);
  setRole(role);
  _mountApp(role);
}

/* ═══════════════════════════════════════════
   App shell mount
═══════════════════════════════════════════ */

function _mountApp(role) {
  showView('app');

  mountNavbar({
    onHome:    _navHome,
    onProfile: _navProfile,
    onLogout:  _navLogout,
  });

  const subNavEl = document.getElementById('sub-nav');
  if (subNavEl) {
    const isEntrepreneur = role === 'entrepreneur';
    subNavEl.classList.toggle('hidden', !isEntrepreneur);
    if (isEntrepreneur) {
      mountSubNav('products', (tab) => {
        navigate(tab === 'products' ? 'entrepreneur-products' : 'entrepreneur-schedule');
      });
    }
  }

  navigateHome(role);
}

/* ═══════════════════════════════════════════
   Navigation callbacks
═══════════════════════════════════════════ */

function _navHome()    { navigateHome(getState().role); }
function _navProfile() { navigate('profile'); }

function _navLogout() {
  logout();        // borra sesión en memoria
  clearSession();  // limpia el store
  clearAuthForms(); // FIX: limpiar campos de login/registro al cerrar sesión
  showView('auth');
  notify.info('Sesión cerrada correctamente.');
}
