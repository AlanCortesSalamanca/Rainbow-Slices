import './PublicHero.css';

interface PublicHeroProps {
  onOpenCart: () => void;
}

export function PublicHero({ onOpenCart }: PublicHeroProps) {
  return (
    <section className="public-hero" id="inicio">
      <div className="public-hero__content">
        <p className="public-hero__eyebrow">Morelia, Michoacán</p>
        <h1>Rainbow Slices</h1>
        <p className="public-hero__subtitle">Cheesecakes de sabores en Morelia</p>
        <p className="public-hero__tagline">Una rebanada, un sabor diferente</p>
        <p className="public-hero__text">Haz tu pedido con 1 a 2 días de anticipación y disfruta tu sabor favorito en nuestros puntos de entrega.</p>
        <div className="public-hero__actions">
          <button type="button" className="public-button public-button--primary" onClick={onOpenCart}>Armar mi pedido</button>
          <a className="public-button public-button--secondary" href="#sabores">Ver sabores</a>
        </div>
      </div>
      <div className="public-hero__badge">Pedidos con anticipación</div>
    </section>
  );
}
