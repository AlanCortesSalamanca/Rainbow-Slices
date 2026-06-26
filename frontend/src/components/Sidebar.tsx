import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const navigationItems = [
  { label: 'Productos', path: '/products' },
  { label: 'Ingredientes', path: '/ingredients' },
  { label: 'Recetas', path: '/recipes' },
  { label: 'Producción', path: '/production' },
  { label: 'Inventario', path: '/inventory/finished' },
  { label: 'Pedidos', path: '/orders' },
  { label: 'Gastos', path: '/expenses' },
  { label: 'Reportes', path: '/reports' }
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__mark">RS</span>
        <div>
          <strong>Rainbow Slices</strong>
          <span>Admin privado</span>
        </div>
      </div>
      <nav className="sidebar__nav" aria-label="Navegación principal">
        {navigationItems.map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => (isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link')}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
