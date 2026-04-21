/**
 * pages/ProfilePage.js — Profile Page (all roles)
 *
 * TAREA-1: Contadores de caracteres en todos los campos editables
 * TAREA-3: Advertencia al cancelar con cambios sin guardar (navigationGuard)
 * TAREA-4: imageUpload con Reemplazar + Eliminar funcionando correctamente
 * FIX-1:   Vista view/edit mode — guardar sale del modo edición automáticamente
 * FIX-5:   Sin localStorage — todo en memoria (store.profileData)
 */

import { renderFooter }          from '../components/Footer.js';
import { icon }                  from '../ui/icons.js';
import { byId }                  from '../ui/dom.js';
import { notify }                from '../ui/notify.js';
import { getState }              from '../store/store.js';
import { saveProfileData,
         getProfileData }        from '../store/actions.js';
import { getRoleLabel,
         getAvatarInitial }      from '../services/userService.js';
import { initUploader,
         getUploadedFile,
         clearUpload }           from '../ui/imageUpload.js';
import { initCounters }          from '../ui/charCounter.js';
import { setGuard, clearGuard,
         snapshot, isDirty }     from '../ui/navigationGuard.js';

const AVATAR_UPLOAD_ID = 'profile-photo-upload';
const EDIT_FORM_ID     = 'profile-edit-form';

/* ═══════════════════════════════════════════
   RENDER ENTRY POINT
═══════════════════════════════════════════ */

export function renderProfile() {
  const { currentUser, role } = getState();
  const roleLabel  = getRoleLabel(role);
  const initial    = getAvatarInitial(currentUser?.name);
  const saved      = getProfileData(currentUser?.id ?? '');
  const displayName = saved.businessName || saved.name || currentUser?.name || '';

  setTimeout(() => _mountViewMode(currentUser, role, saved, displayName, initial), 0);

  return `
    <div class="page page--narrow" id="profile-root">
      <h1 style="font-size:var(--text-2xl);font-weight:var(--weight-bold);
                 margin-bottom:var(--space-6);color:var(--color-text-primary)">
        Mi Perfil
      </h1>

      <!-- Summary card (siempre visible) -->
      <div class="profile-summary">
        <div class="avatar avatar--lg" id="profile-avatar-display" aria-hidden="true">
          ${initial}
        </div>
        <div>
          <p class="profile-summary__name" id="profile-display-name">${displayName}</p>
          <p class="profile-summary__role">${roleLabel}</p>
        </div>
      </div>

      <!-- Área dinámica: alterna view / edit -->
      <div id="profile-card-area"></div>

    </div>
    ${renderFooter()}
  `;
}

/* ═══════════════════════════════════════════
   MODO VISTA
═══════════════════════════════════════════ */

function _mountViewMode(currentUser, role, saved, displayName, initial) {
  clearGuard(); // sin guardia en modo lectura
  const area = byId('profile-card-area');
  if (!area) return;

  if (saved.photoUrl) _updateAvatarPreview(saved.photoUrl, initial);
  area.innerHTML = _buildViewCard(role, currentUser, saved, displayName);

  byId('btn-edit-profile')?.addEventListener('click', () =>
    _mountEditMode(currentUser, role, saved, initial)
  );
}

function _buildViewCard(role, currentUser, saved, displayName) {
  const rows = _viewRows(role, currentUser, saved, displayName);
  return `
    <div class="profile-form-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4)">
        <h3 class="profile-form-card__title" style="margin:0">Información del Perfil</h3>
        <button class="btn btn--secondary btn--sm" id="btn-edit-profile">
          ${icon.edit} Editar
        </button>
      </div>
      <div class="profile-view-rows">${rows}</div>
    </div>
  `;
}

function _viewRows(role, currentUser, saved, displayName) {
  const row = (label, value) => `
    <div class="profile-view-row">
      <span class="profile-view-row__label">${label}</span>
      <span class="profile-view-row__value">${value || '<em style="color:var(--color-text-tertiary,#aaa)">Sin completar</em>'}</span>
    </div>`;

  const emailRow = row('Correo', currentUser?.email ?? '');
  if (role === 'entrepreneur') {
    return emailRow
      + row('Emprendimiento', saved.businessName)
      + row('Descripción', saved.businessDesc);
  }
  if (role === 'buyer') {
    return emailRow
      + row('Nombre / Apodo', saved.name || displayName)
      + row('Sobre ti', saved.aboutMe);
  }
  return emailRow
    + row('Nombre', saved.name || displayName)
    + row('Descripción', saved.description);
}

/* ═══════════════════════════════════════════
   MODO EDICIÓN
═══════════════════════════════════════════ */

function _mountEditMode(currentUser, role, saved, initial) {
  const area = byId('profile-card-area');
  if (!area) return;

  area.innerHTML = _buildEditCard(role, currentUser);
  _prefillFields(saved);
  _bindCharCounters(role);

  // TAREA-4: uploader con Reemplazar + Eliminar (via imageUpload.js)
  initUploader(AVATAR_UPLOAD_ID, {
    maxSizeBytes: 10 * 1024 * 1024,
    label:    'Subir foto de perfil',
    sublabel: 'Arrastra y suelta o haz clic · JPG, PNG, WebP · máx. 10 MB',
    onChange: (_file, dataUrl) => _updateAvatarPreview(dataUrl, initial),
  });

  if (saved.photoUrl) _updateAvatarPreview(saved.photoUrl, initial);

  // TAREA-3: snapshot para detectar cambios + guardia de navegación
  setTimeout(() => {
    snapshot(EDIT_FORM_ID);
    setGuard(() => isDirty(EDIT_FORM_ID));
  }, 50);

  // Cancelar con advertencia
  byId('btn-cancel-profile')?.addEventListener('click', () => {
    if (isDirty(EDIT_FORM_ID)) {
      if (!confirm('Tienes cambios sin guardar. ¿Deseas salir sin guardar?')) return;
    }
    clearGuard();
    clearUpload(AVATAR_UPLOAD_ID);
    _mountViewMode(currentUser, role, saved,
      saved.businessName || saved.name || currentUser?.name || '', initial);
  });

  _bindSaveButton(currentUser, role, saved, initial);
}

function _buildEditCard(role, currentUser) {
  return `
    <div class="profile-form-card">
      <h3 class="profile-form-card__title">Editar Perfil</h3>
      <p class="profile-form-card__subtitle">Actualiza tu información personal</p>

      <div id="${EDIT_FORM_ID}">
        <!-- Foto de perfil (TAREA-4: Reemplazar + Eliminar en imageUpload.js) -->
        <div class="form-group">
          <label class="form-label">Foto de Perfil</label>
          <div id="${AVATAR_UPLOAD_ID}" class="file-upload"
               role="button" tabindex="0" aria-label="Subir foto de perfil"></div>
          <span class="form-hint">Opcional · JPG, PNG, WebP · máx. 10 MB</span>
        </div>

        <!-- Email (solo lectura) -->
        <div class="form-group">
          <label class="form-label" for="profile-email">Correo Electrónico</label>
          <input class="form-control form-control--readonly"
                 type="email" id="profile-email"
                 value="${currentUser?.email ?? ''}" readonly />
          <span class="form-hint">El correo no se puede modificar</span>
        </div>

        ${_renderRoleFields(role)}
      </div>

      <div style="display:flex;gap:var(--space-3);margin-top:var(--space-6)">
        <button class="btn btn--primary btn--full" id="btn-save-profile">
          ${icon.save} Guardar Cambios
        </button>
        <button class="btn btn--ghost" id="btn-cancel-profile" style="white-space:nowrap">
          Cancelar
        </button>
      </div>
    </div>
  `;
}

/* ── Campos por rol con contadores TAREA-1 ── */

function _renderRoleFields(role) {
  if (role === 'entrepreneur') {
    return `
      <div class="form-group">
        <label class="form-label" for="businessName">
          Nombre del Emprendimiento <span style="color:var(--color-danger-base)">*</span>
        </label>
        <input class="form-control" type="text" id="businessName"
               placeholder="Ej: Café Artesanal Montaña" maxlength="100" />
        <div class="form-field-footer">
          <span class="form-error" id="err-businessName" style="display:none"></span>
          <span class="char-counter" id="count-businessName">0/100</span>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="businessDesc">
          Descripción <span style="color:var(--color-danger-base)">*</span>
        </label>
        <textarea class="form-control" id="businessDesc" rows="4" maxlength="500"
                  placeholder="Cuéntanos sobre tu emprendimiento (mín. 20 caracteres)…"></textarea>
        <div class="form-field-footer">
          <span class="form-error" id="err-businessDesc" style="display:none"></span>
          <span class="char-counter" id="count-businessDesc">0/500</span>
        </div>
      </div>`;
  }

  if (role === 'buyer') {
    return `
      <div class="form-group">
        <label class="form-label" for="name">
          Nombre / Apodo <span style="color:var(--color-danger-base)">*</span>
        </label>
        <input class="form-control" type="text" id="name"
               placeholder="Ej: CompradorCurioso" maxlength="50" />
        <div class="form-field-footer">
          <span class="form-error" id="err-name" style="display:none"></span>
          <span class="char-counter" id="count-name">0/50</span>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label" for="aboutMe">
          Sobre ti <span class="form-hint">(Opcional)</span>
        </label>
        <textarea class="form-control" id="aboutMe" rows="3" maxlength="300"
                  placeholder="Cuéntanos sobre tus intereses… (si ingresas, mín. 10 caracteres)"></textarea>
        <div class="form-field-footer">
          <span class="form-error" id="err-aboutMe" style="display:none"></span>
          <span class="char-counter" id="count-aboutMe">0/300</span>
        </div>
      </div>`;
  }

  // Admin
  return `
    <div class="form-group">
      <label class="form-label" for="name">
        Nombre <span style="color:var(--color-danger-base)">*</span>
      </label>
      <input class="form-control" type="text" id="name"
             placeholder="Tu nombre" maxlength="50" />
      <div class="form-field-footer">
        <span class="form-error" id="err-name" style="display:none"></span>
        <span class="char-counter" id="count-name">0/50</span>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label" for="description">Descripción</label>
      <textarea class="form-control" id="description" rows="3" maxlength="300"
                placeholder="Escribe una breve descripción…"></textarea>
      <div class="form-field-footer">
        <span class="form-error" id="err-description" style="display:none"></span>
        <span class="char-counter" id="count-description">0/300</span>
      </div>
    </div>`;
}

/* ═══════════════════════════════════════════
   GUARDADO
═══════════════════════════════════════════ */

function _bindSaveButton(currentUser, role, prevSaved, initial) {
  byId('btn-save-profile')?.addEventListener('click', async () => {
    _clearAllErrors();
    const values   = _readFormValues(role);
    const upload   = getUploadedFile(AVATAR_UPLOAD_ID);
    const validation = _validateByRole(role, values);

    if (!validation.ok) { _showErrors(validation.errors); return; }

    const btn = byId('btn-save-profile');
    if (btn) { btn.disabled = true; btn.textContent = 'Guardando…'; }

    await new Promise(r => setTimeout(r, 500));

    const newProfile = { ...prevSaved, ...values };
    if (upload?.dataUrl) {
      newProfile.photoUrl = upload.dataUrl;
      _updateAvatarPreview(upload.dataUrl, initial);
    }

    saveProfileData(currentUser?.id, newProfile);

    const newDisplayName = newProfile.businessName || newProfile.name || currentUser?.name || '';
    const nameEl = byId('profile-display-name');
    if (nameEl) nameEl.textContent = newDisplayName;

    notify.success('Cambios guardados correctamente.');
    clearGuard();
    clearUpload(AVATAR_UPLOAD_ID);
    _mountViewMode(currentUser, role, newProfile, newDisplayName, initial);
  });
}

/* ── Helpers ── */

function _bindCharCounters(role) {
  const pairs = {
    entrepreneur: [
      { inputId: 'businessName', counterId: 'count-businessName', maxLen: 100 },
      { inputId: 'businessDesc', counterId: 'count-businessDesc', maxLen: 500 },
    ],
    buyer: [
      { inputId: 'name',    counterId: 'count-name',    maxLen: 50  },
      { inputId: 'aboutMe', counterId: 'count-aboutMe', maxLen: 300 },
    ],
    admin: [
      { inputId: 'name',        counterId: 'count-name',        maxLen: 50  },
      { inputId: 'description', counterId: 'count-description', maxLen: 300 },
    ],
  };
  initCounters(pairs[role] ?? []);
}

function _prefillFields(profile) {
  if (!profile) return;
  ['businessName','businessDesc','name','aboutMe','description'].forEach(id => {
    const el = byId(id);
    if (el && profile[id] !== undefined) {
      el.value = profile[id];
      el.dispatchEvent(new Event('input'));
    }
  });
}

function _readFormValues(role) {
  const get = id => byId(id)?.value?.trim() ?? '';
  if (role === 'entrepreneur') return { businessName: get('businessName'), businessDesc: get('businessDesc') };
  if (role === 'buyer')        return { name: get('name'), aboutMe: get('aboutMe') };
  return { name: get('name'), description: get('description') };
}

function _validateByRole(role, values) {
  const errors = {};
  if (role === 'entrepreneur') {
    if (!values.businessName || values.businessName.length < 2)
      errors.businessName = 'El nombre del emprendimiento es requerido (mín. 2 caracteres).';
    else if (values.businessName.length > 100)
      errors.businessName = 'Máximo 100 caracteres.';
    if (!values.businessDesc || values.businessDesc.length < 20)
      errors.businessDesc = 'La descripción debe tener al menos 20 caracteres.';
    else if (values.businessDesc.length > 500)
      errors.businessDesc = 'Máximo 500 caracteres.';
  } else if (role === 'buyer') {
    if (!values.name || values.name.length < 1)
      errors.name = 'El nombre o apodo es requerido.';
    else if (values.name.length > 50) errors.name = 'Máximo 50 caracteres.';
    if (values.aboutMe && values.aboutMe.length > 0 && values.aboutMe.length < 10)
      errors.aboutMe = 'Si ingresas algo, debe tener al menos 10 caracteres.';
  } else {
    if (!values.name || values.name.length < 1) errors.name = 'El nombre es requerido.';
    else if (values.name.length > 50) errors.name = 'Máximo 50 caracteres.';
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, errors: {} };
}

function _showErrors(errors) {
  Object.entries(errors).forEach(([field, msg]) => {
    const errEl = byId(`err-${field}`);
    if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
    const inputEl = byId(field);
    if (inputEl) inputEl.style.borderColor = 'var(--color-danger-base)';
  });
  byId(Object.keys(errors)[0])?.focus();
}

function _clearAllErrors() {
  document.querySelectorAll('[id^="err-"]').forEach(el => {
    el.textContent = ''; el.style.display = 'none';
  });
  ['businessName','businessDesc','name','aboutMe','description']
    .forEach(id => { const el = byId(id); if (el) el.style.borderColor = ''; });
}

function _updateAvatarPreview(dataUrl, fallbackInitial) {
  const el = byId('profile-avatar-display');
  if (!el) return;
  if (dataUrl) {
    el.innerHTML = `<img src="${dataUrl}" alt="Foto de perfil"
      style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-full)" />`;
  } else {
    el.textContent = fallbackInitial;
  }
}
