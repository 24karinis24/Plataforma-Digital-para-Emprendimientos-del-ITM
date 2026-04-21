/**
 * services/userService.js — User & Profile Business Logic
 *
 * Handles user-related rules: role labels, profile field
 * configuration per role, and profile update validation.
 */

import { getState } from '../store/store.js';

/**
 * Returns a human-readable label for a role key.
 * @param {'admin'|'buyer'|'entrepreneur'} role
 * @returns {string}
 */
export function getRoleLabel(role) {
  const labels = {
    admin:        'Administrador',
    buyer:        'Comprador',
    entrepreneur: 'Emprendedor',
  };
  return labels[role] ?? role;
}

/**
 * Returns the profile field configuration for a given role.
 * Drives which fields are rendered in ProfilePage without
 * embedding role-switch logic inside the component.
 *
 * @param {'admin'|'buyer'|'entrepreneur'} role
 * @returns {{ fields: ProfileField[], showTips: boolean }}
 */
export function getProfileConfig(role) {
  const configs = {
    entrepreneur: {
      fields: [
        { id: 'businessName', label: 'Nombre del Emprendimiento', type: 'text',     placeholder: 'Tu emprendimiento', autocomplete: 'organization' },
        { id: 'businessDesc', label: 'Descripción del Emprendimiento', type: 'textarea', placeholder: 'Cuéntanos sobre tu emprendimiento...' },
      ],
      showTips: true,
    },
    buyer: {
      fields: [
        { id: 'name',    label: 'Nombre',    type: 'text',    placeholder: 'Tu nombre',       autocomplete: 'name' },
        { id: 'aboutMe', label: 'Sobre ti',  type: 'textarea',placeholder: 'Cuéntanos sobre tus intereses...' },
      ],
      showTips: false,
    },
    admin: {
      fields: [
        { id: 'name',        label: 'Nombre',      type: 'text',    placeholder: 'Tu nombre', autocomplete: 'name' },
        { id: 'description', label: 'Descripción', type: 'textarea',placeholder: 'Escribe una breve descripción...' },
      ],
      showTips: false,
    },
  };
  return configs[role] ?? configs.admin;
}

/**
 * Validates a profile update payload.
 * Returns an error string if invalid, null if valid.
 *
 * @param {{ name?: string }} fields
 * @returns {string|null}
 */
export function validateProfileUpdate(fields) {
  if (fields.name !== undefined && fields.name.trim().length < 2) {
    return 'El nombre debe tener al menos 2 caracteres.';
  }
  return null;
}

/**
 * Returns the initial letter(s) for an avatar placeholder.
 * Falls back to '?' for empty strings.
 *
 * @param {string} name
 * @returns {string}
 */
export function getAvatarInitial(name) {
  if (!name?.trim()) return '?';
  return name.trim().charAt(0).toUpperCase();
}

/**
 * Tips shown to entrepreneurs on their profile page.
 * Defined here (not in the component) so they can be driven by
 * API data or feature flags in the future.
 *
 * @returns {string[]}
 */
export function getEntrepreneurTips() {
  return [
    'Mantén tu catálogo de productos actualizado con fotos de calidad.',
    'Define claramente tus horarios y puntos de venta.',
    'Responde rápidamente a las consultas de compradores.',
    'Usa descripciones detalladas y atractivas para cada producto.',
    'Actualiza tu descripción del emprendimiento regularmente.',
  ];
}
