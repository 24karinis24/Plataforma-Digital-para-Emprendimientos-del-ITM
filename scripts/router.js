/**
 * router.js — Client-Side SPA Router
 *
 * TAREA-3: Integra navigationGuard para interceptar navegación cuando
 *          hay formularios con cambios sin guardar.
 *   - navigate() llama checkGuard() antes de renderizar.
 *   - Si el usuario cancela la navegación, la ruta no cambia.
 *   - clearGuard() se llama automáticamente al navegar con éxito.
 */

import { setCurrentPage }             from './store/actions.js';
import { getState }                   from './store/store.js';
import { setVisible }                 from './ui/dom.js';
import { notify }                     from './ui/notify.js';
import { syncSubNavActive }           from './components/Navbar.js';
import { checkGuard, clearGuard }     from './ui/navigationGuard.js';
import { renderAdminDashboard }       from './pages/AdminDashboardPage.js';
import { renderBuyerCatalog }         from './pages/BuyerCatalogPage.js';
import { renderEntrepreneurProducts } from './pages/EntrepreneurProductsPage.js';
import { renderEntrepreneurSchedule } from './pages/EntrepreneurSchedulePage.js';
import { renderProfile }              from './pages/ProfilePage.js';
import { renderProductDetail }        from './pages/ProductDetailPage.js';

const ROUTES = {
  'admin-dashboard':       { render: renderAdminDashboard,       role: 'admin'        },
  'buyer-catalog':         { render: renderBuyerCatalog,         role: 'buyer'        },
  'entrepreneur-products': { render: renderEntrepreneurProducts, role: 'entrepreneur' },
  'entrepreneur-schedule': { render: renderEntrepreneurSchedule, role: 'entrepreneur' },
  'profile':               { render: renderProfile,              role: null           },
  'product-detail':        { render: renderProductDetail,        role: null           },
};

const HOME_ROUTES = {
  admin:        'admin-dashboard',
  buyer:        'buyer-catalog',
  entrepreneur: 'entrepreneur-products',
};

const SUBNAV_MAP = {
  'entrepreneur-products': 'products',
  'entrepreneur-schedule': 'schedule',
};

/**
 * Navega a una ruta por clave.
 * TAREA-3: Verifica la guardia de cambios no guardados antes de navegar.
 */
export function navigate(pageKey) {
  const route = ROUTES[pageKey];
  if (!route) {
    console.error(`[router] Unknown route: "${pageKey}"`);
    return;
  }

  const { role } = getState();

  const routeRequiresRole = route.role !== null;
  const userIsAdmin       = role === 'admin';
  const roleMatches       = role === route.role;

  if (routeRequiresRole && !userIsAdmin && !roleMatches) {
    notify.error('No tienes permisos para acceder a esta sección.');
    navigateHome(role);
    return;
  }

  // TAREA-3: verificar guardia de cambios sin guardar
  if (!checkGuard()) return; // usuario eligió no navegar
  clearGuard();              // limpiar guardia al navegar con éxito

  setCurrentPage(pageKey);

  const container = document.getElementById('page-container');
  if (container) {
    container.innerHTML = route.render();
    window.scrollTo(0, 0);
  }

  const subNavTab = SUBNAV_MAP[pageKey];
  if (subNavTab) syncSubNavActive(subNavTab);
}

/** Navega al home del rol activo. */
export function navigateHome(role) {
  const homeRoute = HOME_ROUTES[role];
  if (homeRoute) navigate(homeRoute);
}

/** Muestra una de las tres vistas principales. */
export function showView(view) {
  setVisible('auth-view',   view === 'auth');
  setVisible('select-view', view === 'select');
  setVisible('app-view',    view === 'app');
}
