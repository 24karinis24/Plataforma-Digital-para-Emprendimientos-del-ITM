/**
 * pages/EntrepreneurSchedulePage.js — Entrepreneur Schedule & Locations Page
 *
 * TAREA-1: Contador de caracteres en campo Sede / Ubicación (100 chars)
 * TAREA-3: Advertencia al cerrar modal con cambios sin guardar (dirtyCheck)
 */

import { renderFooter }                            from '../components/Footer.js';
import { openModal }                               from '../components/Modal.js';
import { icon }                                    from '../ui/icons.js';
import { byId, val }                               from '../ui/dom.js';
import { notify }                                  from '../ui/notify.js';
import { getState }                                from '../store/store.js';
import { addMySchedule, updateMySchedule,
         removeMySchedule, setEditingSchedule }    from '../store/actions.js';
import { initCounter }                             from '../ui/charCounter.js';
import { snapshot, isDirty }                       from '../ui/navigationGuard.js';
import { navigate }                                from '../router.js';

const ALL_DAYS  = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MODAL_FORM = 'modal-body';

/** @returns {string} */
export function renderEntrepreneurSchedule() {
  const { mySchedules } = getState();

  setTimeout(() => {
    byId('btn-new-schedule')  ?.addEventListener('click', () => _openModal(null));
    byId('btn-first-schedule')?.addEventListener('click', () => _openModal(null));
    _bindListActions();
  }, 0);

  return `
    <div class="page">

      <div class="section-header">
        <div class="section-header__info">
          <h1 class="section-header__title">Horarios y Sedes</h1>
          <p class="section-header__subtitle">Define dónde y cuándo pueden encontrarte tus clientes</p>
        </div>
        <button class="btn btn--primary" id="btn-new-schedule">
          ${icon.plus} Nuevo Horario
        </button>
      </div>

      ${mySchedules.length > 0 ? _scheduleList(mySchedules) : _emptyState()}

    </div>
    ${renderFooter()}
  `;
}

/* ── Templates ── */

function _scheduleList(schedules) {
  return `
    <div class="schedule-card" id="schedule-list">
      ${schedules.map(_scheduleItem).join('')}
    </div>
  `;
}

function _scheduleItem(s) {
  const daysChips = Array.isArray(s.days)
    ? s.days.map(d => `<span class="schedule-day-chip">${d}</span>`).join('')
    : '';

  return `
    <div class="schedule-item" data-schedule-id="${s.id}">
      <div class="schedule-item__icon-col">
        <div class="schedule-item__icon-wrap" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               width="18" height="18">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      </div>

      <div class="schedule-item__content">
        <div class="schedule-item__location-name">${s.locationName}</div>
        <div class="schedule-item__time-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               width="13" height="13" aria-hidden="true" style="flex-shrink:0">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          <span class="schedule-item__time">${s.startTime} - ${s.endTime}</span>
        </div>
        ${daysChips ? `<div class="schedule-item__chips">${daysChips}</div>` : ''}
      </div>

      <div class="schedule-item__actions">
        <button class="btn btn--ghost btn--icon"
                data-sched-action="edit" data-sched-id="${s.id}"
                aria-label="Editar horario ${s.locationName}">
          ${icon.edit}
        </button>
        <button class="btn btn--danger btn--icon"
                data-sched-action="delete" data-sched-id="${s.id}"
                aria-label="Eliminar horario ${s.locationName}">
          ${icon.trash}
        </button>
      </div>
    </div>
  `;
}

function _emptyState() {
  return `
    <div class="empty-state">
      <div class="empty-state__icon">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
      </div>
      <p class="empty-state__title">Sin horarios definidos</p>
      <p class="empty-state__desc">Define tus horarios y ubicaciones para que los compradores puedan encontrarte.</p>
      <button class="btn btn--primary" id="btn-first-schedule">
        ${icon.plus} Crear primer horario
      </button>
    </div>
  `;
}

/* ── Modal ── */

/**
 * TAREA-1: Campo "sched-location" con contador de caracteres (máx. 100).
 */
function _modalBodyHtml(schedule) {
  const existingDays = schedule?.days ?? [];

  const checkboxes = ALL_DAYS.map(day => `
    <label class="schedule-day-check">
      <input type="checkbox" class="schedule-day-input" value="${day}"
             ${existingDays.includes(day) ? 'checked' : ''} />
      <span>${day}</span>
    </label>
  `).join('');

  return `
    <!-- Sede / Ubicación — máx. 100 chars (TAREA-1) -->
    <div class="form-group">
      <label class="form-label" for="sched-location">
        Sede / Ubicación <span style="color:var(--color-danger-base)">*</span>
      </label>
      <input class="form-control" type="text" id="sched-location" maxlength="100"
             placeholder="Ej: Bloque M - Primer Piso" autocomplete="off"
             value="${schedule?.locationName ?? ''}" />
      <div class="form-field-footer">
        <span class="form-error" id="err-sched-location" style="display:none"></span>
        <span class="char-counter" id="count-sched-location">0/100</span>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">Días de la semana <span style="color:var(--color-danger-base)">*</span></label>
      <div class="schedule-days-grid">${checkboxes}</div>
      <span class="form-error" id="err-sched-days" style="display:none"></span>
    </div>

    <div class="form-grid--2">
      <div class="form-group">
        <label class="form-label" for="sched-start">
          Hora de inicio <span style="color:var(--color-danger-base)">*</span>
        </label>
        <input class="form-control" type="time" id="sched-start"
               value="${schedule?.startTime ?? ''}" />
      </div>
      <div class="form-group">
        <label class="form-label" for="sched-end">
          Hora de fin <span style="color:var(--color-danger-base)">*</span>
        </label>
        <input class="form-control" type="time" id="sched-end"
               value="${schedule?.endTime ?? ''}" />
      </div>
    </div>

    <div id="sched-error-wrap"></div>
  `;
}

function _openModal(scheduleId) {
  const schedule = scheduleId
    ? (getState().mySchedules.find(s => s.id === scheduleId) ?? null)
    : null;

  const isEdit = schedule !== null;
  setEditingSchedule(scheduleId);

  openModal({
    title:        isEdit ? 'Editar Horario' : 'Nuevo Horario',
    subtitle:     'Define la sede y los horarios en los que estarás disponible',
    confirmLabel: isEdit ? 'Guardar Cambios' : 'Crear',
    bodyHtml:     _modalBodyHtml(schedule),
    onConfirm:    isEdit ? () => _handleUpdate(scheduleId) : _handleCreate,
    // TAREA-3: detectar cambios sin guardar
    dirtyCheck:   () => isDirty(MODAL_FORM),
  });

  setTimeout(() => {
    // TAREA-1: contador de caracteres para el campo ubicación
    initCounter('sched-location', 'count-sched-location', 100);
    // TAREA-3: snapshot inicial del formulario
    snapshot(MODAL_FORM);
  }, 0);
}

/* ── Event handlers ── */

function _handleCreate() {
  const data = _readForm();
  if (!data) return false;
  addMySchedule(data);
  notify.success(`Horario en "${data.locationName}" creado correctamente.`);
  navigate('entrepreneur-schedule');
}

function _handleUpdate(scheduleId) {
  const data = _readForm();
  if (!data) return false;
  updateMySchedule(scheduleId, data);
  setEditingSchedule(null);
  notify.success(`Horario en "${data.locationName}" actualizado.`);
  navigate('entrepreneur-schedule');
}

function _readForm() {
  const location = val('sched-location');
  const start    = val('sched-start');
  const end      = val('sched-end');
  const days     = [...document.querySelectorAll('.schedule-day-input:checked')]
                     .map(cb => cb.value);

  _clearFormErrors();

  const showFieldErr = (id, msg) => {
    const el = byId(id);
    if (el) { el.textContent = msg; el.style.display = 'block'; }
    return null;
  };

  if (!location.trim())  return showFieldErr('err-sched-location', 'Ingresa el nombre de la sede o ubicación.');
  if (location.length > 100) return showFieldErr('err-sched-location', 'Máximo 100 caracteres.');
  if (days.length === 0) return showFieldErr('err-sched-days', 'Selecciona al menos un día de la semana.');

  const errWrap = byId('sched-error-wrap');
  if (!start || !end) {
    if (errWrap) errWrap.innerHTML = `<p class="form-error">Ingresa la hora de inicio y la hora de fin.</p>`;
    return null;
  }
  if (start >= end) {
    if (errWrap) errWrap.innerHTML = `<p class="form-error">La hora de inicio debe ser anterior a la hora de fin.</p>`;
    return null;
  }

  return { locationName: location, days, startTime: start, endTime: end };
}

function _clearFormErrors() {
  ['err-sched-location', 'err-sched-days'].forEach(id => {
    const el = byId(id);
    if (el) { el.textContent = ''; el.style.display = 'none'; }
  });
  const w = byId('sched-error-wrap');
  if (w) w.innerHTML = '';
}

function _bindListActions() {
  const container = document.getElementById('page-container');
  if (!container || container._scheduleActionsListenerBound) return;

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-sched-action]');
    if (!btn) return;
    const schedId     = btn.dataset.schedId;
    const schedAction = btn.dataset.schedAction;

    if (schedAction === 'edit') _openModal(schedId);
    if (schedAction === 'delete') {
      if (!confirm('¿Eliminar este horario?')) return;
      removeMySchedule(schedId);
      notify.info('Horario eliminado.');
      navigate('entrepreneur-schedule');
    }
  });

  container._scheduleActionsListenerBound = true;
}
