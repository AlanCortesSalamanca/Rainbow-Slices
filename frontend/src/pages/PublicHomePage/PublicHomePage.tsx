import { useEffect, useState } from 'react';
import { FlavorCard } from '../../components/public/FlavorCard';
import { PublicFooter } from '../../components/public/PublicFooter';
import { PublicHeader } from '../../components/public/PublicHeader';
import { PublicHero } from '../../components/public/PublicHero';
import { publicProductsService } from '../../services/publicProducts.service';
import type { PublicProduct } from '../../types/public.types';
import { generalWhatsAppLink } from '../../utils/whatsapp';
import './PublicHomePage.css';

const orderSteps = [
  ['1', 'Elige tu sabor', 'Revisa los sabores y decide cuál se te antoja.'],
  ['2', 'Escríbenos por WhatsApp', 'Te confirmamos disponibilidad y detalles del pedido.'],
  ['3', 'Confirma entrega', 'Elige horario y punto de entrega en Morelia.'],
  ['4', 'Disfruta tu cheesecake', 'Recibe tu rebanada artesanal lista para disfrutar.']
];

const benefits = [
  'Cheesecakes artesanales',
  'Sabores variados',
  'Pedidos organizados',
  'Entregas en puntos de Morelia',
  'Atención directa por WhatsApp'
];

export function PublicHomePage() {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState('');

  useEffect(() => {
    publicProductsService
      .list()
      .then(setProducts)
      .catch(() => setProductsError('No pudimos cargar los sabores en este momento.'))
      .finally(() => setLoadingProducts(false));
  }, []);

  return (
    <main className="public-home">
      <a className="public-home__skip-link" href="#inicio">Saltar al contenido</a>
      <PublicHeader />

      <PublicHero />

      <section className="public-section public-section--flavors" id="sabores">
        <div className="public-section__heading">
          <p>Sabores</p>
          <h2>Elige tu sabor favorito</h2>
          <span>Tenemos rebanadas para todos los antojos: frutales, chocolatosas, clásicas y con toque mexicano.</span>
        </div>
        {loadingProducts ? <div className="public-home__flavor-state">Cargando sabores disponibles...</div> : null}
        {!loadingProducts && productsError ? <div className="public-home__flavor-state public-home__flavor-state--error">{productsError}</div> : null}
        {!loadingProducts && !productsError && products.length === 0 ? <div className="public-home__flavor-state">Pronto agregaremos sabores disponibles.</div> : null}
        {!loadingProducts && !productsError && products.length > 0 ? (
          <div className="public-home__flavor-grid">
            {products.map((product) => (
              <FlavorCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="public-section" id="como-pedir">
        <div className="public-section__heading public-section__heading--center">
          <p>Proceso</p>
          <h2>Haz tu pedido fácil</h2>
          <span>Un flujo simple para apartar tu rebanada sin complicaciones.</span>
        </div>
        <div className="public-home__steps">
          {orderSteps.map(([stepNumber, title, text]) => (
            <article key={stepNumber} className="public-home__step">
              <strong>{stepNumber}</strong>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="public-section public-home__delivery" id="entregas">
        <div className="public-home__info-card public-home__info-card--wide">
          <p className="public-home__card-kicker">Entrega</p>
          <h2>Puntos de entrega en Morelia</h2>
          <div className="public-home__pill-list">
            <span>Centro de Morelia</span>
            <span>Carrillo</span>
            <span>CFE de Colonia Industrial</span>
          </div>
          <p className="public-home__highlight">Costo de entrega: $15 MXN.</p>
        </div>
        <div className="public-home__info-card">
          <p className="public-home__card-kicker">Horarios</p>
          <h2>Horarios de entrega</h2>
          <div className="public-home__schedule">
            <strong>11:00 AM</strong>
            <strong>4:00 PM</strong>
          </div>
          <p className="public-home__highlight">Pedidos con 1 a 2 días de anticipación.</p>
          <p>Si hay stock disponible, podemos confirmar disponibilidad el mismo día por WhatsApp.</p>
        </div>
      </section>

      <section className="public-section public-home__benefits">
        <div className="public-section__heading">
          <p>Diferenciadores</p>
          <h2>¿Por qué pedir en Rainbow Slices?</h2>
        </div>
        <div className="public-home__benefit-grid">
          {benefits.map((benefit) => (
            <article key={benefit}>
              <span aria-hidden="true" />
              <strong>{benefit}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="public-home__final-cta" id="pedido">
        <p>¿Listo para probar tu rebanada favorita?</p>
        <h2>Escríbenos por WhatsApp y aparta tu cheesecake con anticipación.</h2>
        <a className="public-button public-button--primary" href={generalWhatsAppLink} target="_blank" rel="noreferrer">Pedir por WhatsApp</a>
      </section>

      <PublicFooter />
    </main>
  );
}
