/**
 * services/authService.js — Authentication Business Logic (In-Memory Demo)
 *
 * v3 — Cambios:
 *   - Credenciales simuladas solo en código (NO se muestran en la UI)
 *   - login() acepta ÚNICAMENTE:
 *       1. Credenciales de cuentas demo internas (admin/emprendedor/comprador)
 *       2. Usuarios registrados en esta sesión (mapa _registeredUsers)
 *   - register() añade el usuario al mapa _registeredUsers en memoria
 *   - Si las credenciales no coinciden → error explícito
 *   - Sin localStorage / sessionStorage / cookies
 */

/** Sesión activa en memoria */
let _session = null;

/**
 * Usuarios registrados durante esta sesión.
 * @type {Map<string, { id, name, email, password, role }>}
 */
const _registeredUsers = new Map();

const _delay = ms => new Promise(r => setTimeout(r, ms));

/* ═══════════════════════════════════════════
   CUENTAS DEMO — Solo en código, no en la UI
═══════════════════════════════════════════ */

/**
 * Credenciales simuladas preconfiguradas por rol.
 * PRIVADAS: no se exportan ni muestran en la interfaz.
 *
 * Para probar la demo usar:
 *   admin@itm.edu.co        / admin123
 *   emprendedor@itm.edu.co  / emprendedor123
 *   comprador@itm.edu.co    / comprador123
 */
const _DEMO_ACCOUNTS = [
  { email: 'admin@itm.edu.co',        password: 'admin123',        name: 'Administrador ITM', role: 'admin'        },
  { email: 'emprendedor@itm.edu.co',  password: 'emprendedor123',  name: 'Emprendedor Demo',  role: 'entrepreneur' },
  { email: 'comprador@itm.edu.co',    password: 'comprador123',    name: 'Comprador Demo',    role: 'buyer'        },
];

/* ═══════════════════════════════════════════
   PUBLIC API
═══════════════════════════════════════════ */

/**
 * Inicia sesión.
 * Solo acepta credenciales demo internas o usuarios registrados en memoria.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ ok: boolean, user?: object, isFirstLogin?: boolean, error?: string }>}
 */
export async function login({ email, password }) {
  await _delay(420);

  const emailError = _validateEmail(email);
  if (emailError) return { ok: false, error: emailError };

  if (!password) return { ok: false, error: 'Ingresa tu contraseña.' };

  const normalizedEmail = email.trim().toLowerCase();

  // 1. Verificar cuenta demo interna
  const demo = _DEMO_ACCOUNTS.find(a => a.email === normalizedEmail);
  if (demo) {
    if (password !== demo.password) {
      return { ok: false, error: 'Contraseña incorrecta.' };
    }
    const user = { id: `demo-${demo.role}`, name: demo.name, email: demo.email, role: demo.role };
    _session = { ...user };
    return { ok: true, user, isFirstLogin: false };
  }

  // 2. Verificar usuario registrado en esta sesión
  const registered = _registeredUsers.get(normalizedEmail);
  if (registered) {
    if (registered.password !== password) {
      return { ok: false, error: 'Contraseña incorrecta.' };
    }
    const { password: _pw, ...user } = registered;
    _session = { ...user };
    return { ok: true, user, isFirstLogin: false };
  }

  // 3. Credenciales no reconocidas → error explícito
  return {
    ok:    false,
    error: 'No encontramos una cuenta con ese correo. Verifica los datos o regístrate.',
  };
}

/**
 * Registra un nuevo usuario en memoria.
 * El usuario queda disponible para login durante la misma sesión.
 *
 * @param {{ name: string, email: string, password: string }} data
 * @returns {Promise<{ ok: boolean, user?: object, isFirstLogin?: boolean, errors?: object }>}
 */
export async function register({ name, email, password }) {
  await _delay(420);

  const errors = {};
  if (!name || name.trim().length < 2)
    errors.name = 'El nombre debe tener al menos 2 caracteres.';

  const emailErr = _validateEmail(email);
  if (emailErr) errors.email = emailErr;

  if (!password || password.length < 6)
    errors.password = 'La contraseña debe tener al menos 6 caracteres.';

  if (Object.keys(errors).length) return { ok: false, errors };

  const normalizedEmail = email.trim().toLowerCase();

  // Verificar que el email no esté ya en uso (demo o registrado)
  const isDemo = _DEMO_ACCOUNTS.some(a => a.email === normalizedEmail);
  if (isDemo || _registeredUsers.has(normalizedEmail)) {
    return { ok: false, errors: { email: 'Este correo ya tiene una cuenta asociada.' } };
  }

  const user = {
    id:       `user-${Date.now()}`,
    name:     name.trim().charAt(0).toUpperCase() + name.trim().slice(1),
    email:    normalizedEmail,
    role:     null,
    password, // almacenado en memoria únicamente para validar login posterior
  };

  _registeredUsers.set(normalizedEmail, user);

  const { password: _pw, ...publicUser } = user;
  _session = { ...publicUser };
  return { ok: true, user: publicUser, isFirstLogin: true };
}

/** Devuelve la sesión activa en memoria (null si no hay sesión). */
export function checkSession() {
  return _session ? { ..._session } : null;
}

/** Cierra sesión eliminando el estado en memoria. */
export function logout() {
  _session = null;
}

/** Actualiza el rol en la sesión activa. */
export function selectRole(userId, role) {
  if (_session && _session.id === userId) _session.role = role;
}

/** No-op en demo — sin expiración de sesión real. */
export function refreshSession() {}

/* ── Helpers privados ── */

function _validateEmail(email) {
  if (!email || !email.trim()) return 'El correo electrónico es requerido.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Ingresa un correo válido.';
  return null;
}
