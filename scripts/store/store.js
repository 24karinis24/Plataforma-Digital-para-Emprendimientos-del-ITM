/**
 * store/store.js — Centralized Application State
 *
 * v4 changes:
 *   - Added editingProductId: ID of product being edited by entrepreneur
 *   - Added editingScheduleId: ID of schedule being edited
 *   - myProducts now preserves image dataUrl (bug fix in actions.js)
 */

const _state = {
  currentUser:       null,
  role:              null,
  currentPage:       null,
  subNav:            'products',

  /**
   * Almacenamiento en memoria de perfiles por userId.
   * FIX: Sin localStorage — todo vive aquí durante la sesión.
   * Estructura: { [userId]: { name?, businessName?, businessDesc?, aboutMe?, description?, photoUrl? } }
   */
  profileData:       {},

  /** Buyer flow: product currently open in detail view. */
  selectedProductId: null,

  /** Entrepreneur flow: product currently being edited (null = creating new). */
  editingProductId:  null,

  /** Entrepreneur flow: schedule currently being edited (null = creating new). */
  editingScheduleId: null,

  products: [
    {
      id: 'prod-001', name: 'Artesanía en Madera',
      description: 'Hermosas piezas artesanales talladas a mano con maderas nativas colombianas.',
      price: 45000, category: 'Artesanías', categorySlug: 'artesanias', status: 'available',
      sellerId: 'user-001', sellerName: 'María García',
      sellerDescription: 'Artesana especializada en trabajos manuales y diseño personalizado.',
      sellerEmail: 'maria.garcia@itm.edu.co',
      image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80',
    },
    {
      id: 'prod-002', name: 'Joyería Personalizada',
      description: 'Collares y aretes únicos elaborados en plata 925 con diseños exclusivos para cada cliente.',
      price: 35000, category: 'Joyería', categorySlug: 'joyeria', status: 'available',
      sellerId: 'user-001', sellerName: 'María García',
      sellerDescription: 'Artesana especializada en trabajos manuales y diseño personalizado.',
      sellerEmail: 'maria.garcia@itm.edu.co',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
    },
    {
      id: 'prod-003', name: 'Café Orgánico',
      description: 'Café 100% colombiano de altura, cultivado sin pesticidas en la región cafetera.',
      price: 25000, category: 'Alimentos', categorySlug: 'alimentos', status: 'available',
      sellerId: 'user-002', sellerName: 'Carlos López',
      sellerDescription: 'Productor de alimentos naturales y orgánicos del Eje Cafetero.',
      sellerEmail: 'carlos.lopez@itm.edu.co',
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80',
    },
    {
      id: 'prod-004', name: 'Repostería Artesanal',
      description: 'Postres y tortas elaborados con ingredientes 100% naturales, sin conservantes artificiales.',
      price: 15000, category: 'Alimentos', categorySlug: 'alimentos', status: 'available',
      sellerId: 'user-002', sellerName: 'Carlos López',
      sellerDescription: 'Productor de alimentos naturales y orgánicos del Eje Cafetero.',
      sellerEmail: 'carlos.lopez@itm.edu.co',
      image: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&q=80',
    },
    {
      id: 'prod-005', name: 'Cuadros Decorativos',
      description: 'Pinturas en acrílico y óleo de paisajes colombianos, firmadas por la artista.',
      price: 55000, category: 'Artesanías', categorySlug: 'artesanias', status: 'available',
      sellerId: 'user-001', sellerName: 'María García',
      sellerDescription: 'Artesana especializada en trabajos manuales y diseño personalizado.',
      sellerEmail: 'maria.garcia@itm.edu.co',
      image: 'https://images.unsplash.com/photo-1536924430914-91f9e2041b83?w=800&q=80',
    },
    {
      id: 'prod-006', name: 'Mermeladas Caseras',
      description: 'Mermeladas artesanales de frutas tropicales colombianas elaboradas sin conservantes.',
      price: 12000, category: 'Alimentos', categorySlug: 'alimentos', status: 'available',
      sellerId: 'user-002', sellerName: 'Carlos López',
      sellerDescription: 'Productor de alimentos naturales y orgánicos del Eje Cafetero.',
      sellerEmail: 'carlos.lopez@itm.edu.co',
      image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80',
    },
  ],

  sellerSchedules: {
    'user-001': [
      { id: 's-001-a', locationName: 'Bloque M - Primer Piso',
        days: ['Lunes', 'Miércoles', 'Viernes'], startTime: '08:00', endTime: '14:00' },
      { id: 's-001-b', locationName: 'Bloque E - Zona Verde',
        days: ['Sábado'], startTime: '08:00', endTime: '13:00' },
    ],
    'user-002': [
      { id: 's-002-a', locationName: 'Plaza de Mercado ITM',
        days: ['Martes', 'Jueves'], startTime: '09:00', endTime: '15:00' },
      { id: 's-002-b', locationName: 'Cafetería Central',
        days: ['Viernes', 'Sábado'], startTime: '10:00', endTime: '17:00' },
    ],
  },

  /** Entrepreneur's own schedules (created during this session). */
  mySchedules: [],

  /**
   * Entrepreneur's own products (created during this session).
   * image is stored as a base64 data-URL so it persists in memory
   * without needing a backend file upload endpoint.
   */
  myProducts: [],
};

const _listeners = new Set();

export function getState() { return { ..._state }; }

export function setState(patch) {
  Object.assign(_state, patch);
  _notify();
}

export function subscribe(listener) {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

function _notify() {
  const snap = getState();
  _listeners.forEach(fn => fn(snap));
}
