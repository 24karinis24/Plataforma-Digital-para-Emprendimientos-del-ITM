/**
 * ui/imageUpload.js — Drag & Drop Image Upload Module
 *
 * FIX v5.1:
 *   - maxSizeBytes is now configurable via opts.maxSizeBytes (HU-04: 10MB, HU-07: 5MB)
 *   - maxSizeLabel auto-derived from maxSizeBytes
 *   - Default remains 5 MB for backwards compatibility
 *
 * Public API:
 *   initUploader(containerId, opts?)  → Register + activate an upload zone
 *   getUploadedFile(uploadId)         → { file, dataUrl } | null
 *   clearUpload(uploadId, opts?)      → Reset a specific uploader
 *   clearAllUploads()                 → Reset every registered uploader
 *   validateFile(file, maxBytes?)     → { ok } | { ok: false, error }
 */

const ACCEPTED_TYPES  = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const ACCEPTED_LABEL  = 'JPG, JPEG, PNG, WebP';
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;   // 5 MB — product images (HU-07)

/** @type {Map<string, { file: File|null, dataUrl: string|null, opts: object }>} */
const _registry = new Map();

/* ═══════════════════════════════════════════
   PUBLIC API
═══════════════════════════════════════════ */

/**
 * @param {string} containerId
 * @param {object} [opts]
 * @param {string}   [opts.label]
 * @param {string}   [opts.sublabel]
 * @param {number}   [opts.maxSizeBytes]  Override max file size (default: 5 MB)
 * @param {Function} [opts.onChange]      (file, dataUrl) => void
 */
export function initUploader(containerId, opts = {}) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`[imageUpload] #${containerId} not found.`);
    return;
  }

  const maxBytes = opts.maxSizeBytes ?? DEFAULT_MAX_BYTES;
  const maxLabel = _bytesToLabel(maxBytes);

  const config = {
    label:    opts.label    ?? 'Subir imagen',
    sublabel: opts.sublabel ?? `Arrastra y suelta o haz clic · ${ACCEPTED_LABEL} · máx. ${maxLabel}`,
    maxSizeBytes: maxBytes,
    maxSizeLabel: maxLabel,
    onChange: opts.onChange ?? null,
  };

  _registry.set(containerId, { file: null, dataUrl: null, opts: config });
  _renderIdle(container, config);
  _bindEvents(container, containerId, config);
}

export function getUploadedFile(uploadId) {
  const entry = _registry.get(uploadId);
  return entry ? { file: entry.file, dataUrl: entry.dataUrl } : null;
}

export function clearUpload(uploadId) {
  const container = document.getElementById(uploadId);
  const entry = _registry.get(uploadId);
  const opts = entry?.opts ?? {};

  _registry.set(uploadId, { file: null, dataUrl: null, opts });
  if (container) {
    _renderIdle(container, opts);
    _bindEvents(container, uploadId, opts);
  }
  opts.onChange?.(null, null);
}

export function clearAllUploads() {
  _registry.forEach((_, id) => clearUpload(id));
}

/**
 * Validates a file against type and size constraints.
 * Pure function — no DOM side-effects.
 *
 * @param {File}   file
 * @param {number} [maxSizeBytes]  Defaults to DEFAULT_MAX_BYTES (5 MB)
 * @returns {{ ok: boolean, error?: string }}
 */
export function validateFile(file, maxSizeBytes = DEFAULT_MAX_BYTES) {
  if (!file) return { ok: false, error: 'No se seleccionó ningún archivo.' };

  if (!ACCEPTED_TYPES.has(file.type)) {
    return {
      ok: false,
      error: `Formato no permitido: "${file.type || 'desconocido'}". Usa ${ACCEPTED_LABEL}.`,
    };
  }

  if (file.size > maxSizeBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const maxMb  = _bytesToLabel(maxSizeBytes);
    return {
      ok: false,
      error: `El archivo pesa ${sizeMb} MB. El máximo permitido es ${maxMb}.`,
    };
  }

  return { ok: true };
}

/* ═══════════════════════════════════════════
   DOM RENDERING
═══════════════════════════════════════════ */

function _renderIdle(container, opts) {
  container.innerHTML = `
    <input type="file" class="file-upload__input"
           accept="image/jpeg,image/jpg,image/png,image/webp"
           aria-hidden="true" tabindex="-1" style="display:none" />
    <div class="file-upload__prompt" aria-hidden="true">
      <svg class="file-upload__icon" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <polyline points="16,16 12,12 8,16"/>
        <line x1="12" y1="12" x2="12" y2="21"/>
        <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
      </svg>
      <span class="file-upload__title">${opts.label}</span>
      <span class="file-upload__subtitle">${opts.sublabel}</span>
    </div>
  `;
  container.classList.remove('file-upload--drag-over','file-upload--loaded','file-upload--error');
}

function _renderPreview(container, dataUrl, fileName, uploadId, opts) {
  // FIX-2: incluir input oculto en el modo preview para que _triggerFilePicker lo encuentre
  container.innerHTML = `
    <input type="file" class="file-upload__input"
           accept="image/jpeg,image/jpg,image/png,image/webp"
           aria-hidden="true" tabindex="-1" style="display:none" />
    <div class="file-upload__preview">
      <img class="file-upload__preview-img" src="${dataUrl}" alt="Vista previa: ${fileName}" />
    </div>
    <div class="file-upload__preview-meta">
      <span class="file-upload__preview-name">${fileName}</span>
      <div class="file-upload__preview-actions">
        <button type="button" class="btn btn--secondary btn--sm js-upload-replace"
                data-upload-id="${uploadId}" aria-label="Reemplazar imagen">
          Reemplazar
        </button>
        <button type="button" class="btn btn--ghost btn--sm js-upload-clear"
                data-upload-id="${uploadId}" aria-label="Eliminar imagen">
          Eliminar
        </button>
      </div>
    </div>
  `;
  container.classList.add('file-upload--loaded');
  container.classList.remove('file-upload--drag-over','file-upload--error');

  container.querySelector('.js-upload-replace')?.addEventListener('click', (e) => {
    e.stopPropagation();
    _triggerFilePicker(uploadId, opts);
  });
  container.querySelector('.js-upload-clear')?.addEventListener('click', (e) => {
    e.stopPropagation();
    clearUpload(uploadId);
  });
}

function _renderError(container, message, opts) {
  _renderIdle(container, opts);
  const el = document.createElement('p');
  el.className   = 'file-upload__error';
  el.textContent = message;
  el.setAttribute('role', 'alert');
  container.appendChild(el);
  container.classList.add('file-upload--error');
}

function _renderLoading(container) {
  container.innerHTML = `
    <div class="file-upload__loading" aria-label="Cargando imagen…" role="status">
      <div class="file-upload__spinner"></div>
      <span class="file-upload__loading-text">Procesando imagen…</span>
    </div>
  `;
}

/* ═══════════════════════════════════════════
   EVENT WIRING
═══════════════════════════════════════════ */

function _bindEvents(container, uploadId, opts) {
  // Clone to remove old listeners cleanly
  const fresh = container.cloneNode(true);
  container.replaceWith(fresh);

  const el = document.getElementById(uploadId);
  if (!el) return;

  el.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    _triggerFilePicker(uploadId, opts);
  });

  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); _triggerFilePicker(uploadId, opts); }
  });

  el.addEventListener('dragenter', (e) => {
    e.preventDefault();
    el.classList.add('file-upload--drag-over');
  });

  el.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    el.classList.add('file-upload--drag-over');
  });

  el.addEventListener('dragleave', (e) => {
    if (!el.contains(e.relatedTarget)) el.classList.remove('file-upload--drag-over');
  });

  el.addEventListener('drop', (e) => {
    e.preventDefault();
    el.classList.remove('file-upload--drag-over');
    const file = e.dataTransfer?.files?.[0];
    if (file) _processFile(el, uploadId, file, opts);
  });

  el.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) _processFile(el, uploadId, file, opts);
  });
}

/* ═══════════════════════════════════════════
   PRIVATE HELPERS
═══════════════════════════════════════════ */

function _triggerFilePicker(uploadId, opts) {
  const el    = document.getElementById(uploadId);
  const input = el?.querySelector('.file-upload__input');
  if (!input) return;

  // FIX-2: resetear value para que elegir el mismo archivo vuelva a disparar 'change'
  input.value = '';
  input.onchange = (e) => {
    const file = e.target.files?.[0];
    if (file) _processFile(el, uploadId, file, opts);
  };
  input.click();
}

function _processFile(container, uploadId, file, opts) {
  // Use opts.maxSizeBytes for per-instance size limit
  const result = validateFile(file, opts.maxSizeBytes ?? DEFAULT_MAX_BYTES);

  if (!result.ok) {
    _renderError(container, result.error, opts);
    const entry = _registry.get(uploadId);
    if (entry) entry.file = null, entry.dataUrl = null;
    opts.onChange?.(null, null);
    return;
  }

  _renderLoading(container);

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    _registry.set(uploadId, { file, dataUrl, opts });
    _renderPreview(container, dataUrl, file.name, uploadId, opts);
    opts.onChange?.(file, dataUrl);
  };
  reader.onerror = () => {
    _renderError(container, 'Error al leer el archivo. Inténtalo de nuevo.', opts);
  };
  reader.readAsDataURL(file);
}

function _bytesToLabel(bytes) {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb % 1 === 0 ? mb : mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}
