import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button } from './Button';
import './Header.css';

export function Header() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="header">
      <div>
        <span className="header__eyebrow">MVP administrativo</span>
        <h1>Operación de cheesecakes</h1>
      </div>
      <div className="header__session">
        <span className="header__status">{user?.email ?? 'Sesión admin'}</span>
        <Button type="button" variant="secondary" onClick={handleLogout}>Cerrar sesión</Button>
      </div>
    </header>
  );
}
