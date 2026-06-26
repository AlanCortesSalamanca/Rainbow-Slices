import './Header.css';

export function Header() {
  return (
    <header className="header">
      <div>
        <span className="header__eyebrow">MVP administrativo</span>
        <h1>Operación de cheesecakes</h1>
      </div>
      <div className="header__status">Listo para Supabase</div>
    </header>
  );
}
