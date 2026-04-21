/**
 * pages/AuthPage.js — Authentication Page Controller
 *
 * v3 — Cambios:
 *   - Eliminada tarjeta de cuentas demo visible en la UI (TAREA-1)
 *   - Credenciales demo solo en authService.js (código interno)
 *   - Limpieza completa de formularios al cambiar de pestaña (TAREA-4)
 *   - clearAuthForms() exportada para llamarla al cerrar sesión
 *   - Mensaje de ayuda minimalista en pie del formulario (no revela credenciales)
 */

import { login, register } from '../services/authService.js';
import { mountAuthLogo }   from '../components/Navbar.js';
import { byId, val }       from '../ui/dom.js';
import { notify }          from '../ui/notify.js';

let _onSuccess = null;

/**
 * @param {Function} onSuccess  Llamado con (user, isFirstLogin) al autenticar
 */
export function initAuthPage(onSuccess) {
  _onSuccess = onSuccess;
  mountAuthLogo();
  _bindTabEvents();
  _bindFormEvents();
  clearAuthForms(); // siempre arrancar limpio
}

/* ─────────────────────────────────────────────
   PÚBLICO: limpiar formularios
   Llamado desde app.js al cerrar sesión
───────────────────────────────────────────── */

export function clearAuthForms() {
  ['login-email', 'login-pass', 'reg-name', 'reg-email', 'reg-pass'].forEach(id => {
    const el = byId(id);
    if (el) el.value = '';
  });
  _clearAllErrors();
  _switchTab('login');
}

/* ── Tabs ── */

function _bindTabEvents() {
  byId('auth-tab-login')   ?.addEventListener('click', () => _switchTab('login'));
  byId('auth-tab-register')?.addEventListener('click', () => _switchTab('register'));
}

/** Limpia campos al cambiar de pestaña para evitar credenciales remanentes */
function _switchTab(tab) {
  const isLogin = tab === 'login';
  byId('auth-tab-login')   ?.classList.toggle('auth-tab--active',  isLogin);
  byId('auth-tab-register')?.classList.toggle('auth-tab--active', !isLogin);
  byId('form-login')       ?.classList.toggle('hidden', !isLogin);
  byId('form-register')    ?.classList.toggle('hidden',  isLogin);

  // Limpiar todos los campos al cambiar de pestaña
  ['login-email', 'login-pass', 'reg-name', 'reg-email', 'reg-pass'].forEach(id => {
    const el = byId(id);
    if (el) el.value = '';
  });
  _clearAllErrors();
}

/* ── Form events ── */

function _bindFormEvents() {
  byId('btn-login')   ?.addEventListener('click', _handleLogin);
  byId('btn-register')?.addEventListener('click', _handleRegister);

  ['login-email', 'login-pass'].forEach(id =>
    byId(id)?.addEventListener('keydown', e => { if (e.key === 'Enter') _handleLogin(); }));

  ['reg-name', 'reg-email', 'reg-pass'].forEach(id =>
    byId(id)?.addEventListener('keydown', e => { if (e.key === 'Enter') _handleRegister(); }));

  ['login-email', 'login-pass', 'reg-name', 'reg-email', 'reg-pass'].forEach(id =>
    byId(id)?.addEventListener('input', () => _clearFieldError(id)));
}

/* ── Login handler ── */

async function _handleLogin() {
  _clearAllErrors();
  const email = val('login-email');
  const pass  = val('login-pass');

  const btn = byId('btn-login');
  if (btn) { btn.disabled = true; btn.textContent = 'Verificando…'; }

  try {
    const result = await login({ email, password: pass });
    if (!result.ok) {
      _showFieldError('login-pass', result.error ?? 'Credenciales incorrectas.');
      return;
    }
    _onSuccess?.(result.user, result.isFirstLogin);
  } catch (err) {
    console.error('[AuthPage] login error:', err);
    _showFieldError('login-pass', 'Error inesperado. Intenta de nuevo.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Ingresar'; }
  }
}

/* ── Register handler ── */

async function _handleRegister() {
  _clearAllErrors();
  const name  = val('reg-name');
  const email = val('reg-email');
  const pass  = val('reg-pass');

  const btn = byId('btn-register');
  if (btn) { btn.disabled = true; btn.textContent = 'Creando cuenta…'; }

  try {
    const result = await register({ name, email, password: pass });
    if (!result.ok) {
      if (result.errors) {
        if (result.errors.name)     _showFieldError('reg-name',  result.errors.name);
        if (result.errors.email)    _showFieldError('reg-email', result.errors.email);
        if (result.errors.password) _showFieldError('reg-pass',  result.errors.password);
      } else if (result.error) {
        _showFieldError('reg-email', result.error);
      }
      return;
    }
    notify.success('¡Cuenta creada! Ahora selecciona tu perfil.');
    _onSuccess?.(result.user, true);
  } catch (err) {
    console.error('[AuthPage] register error:', err);
    _showFieldError('reg-email', 'Error inesperado. Intenta de nuevo.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Crear Cuenta'; }
  }
}

/* ── Error helpers ── */

function _showFieldError(inputId, message) {
  const input = byId(inputId);
  if (!input) return;
  input.parentElement?.querySelector('.form-error')?.remove();
  input.classList.add('form-control--error');
  const err = document.createElement('p');
  err.className   = 'form-error';
  err.textContent = message;
  input.parentElement?.appendChild(err);
}

function _clearFieldError(inputId) {
  const input = byId(inputId);
  if (!input) return;
  input.classList.remove('form-control--error');
  input.parentElement?.querySelector('.form-error')?.remove();
}

function _clearAllErrors() {
  document.querySelectorAll('.form-error').forEach(el => el.remove());
  ['login-email','login-pass','reg-name','reg-email','reg-pass'].forEach(id =>
    byId(id)?.classList.remove('form-control--error'));
}
