import { useState } from 'react';
import type { FormEvent } from 'react';
import { usePublicCart } from './PublicCartContext';
import type { CheckoutForm } from './publicCart.types';
import { buildCartWhatsAppLink, deliveryPoints, deliveryTimes } from './publicCart.utils';
import './CheckoutWhatsAppForm.css';

const initialForm: CheckoutForm = {
  customerName: '',
  customerPhone: '',
  deliveryPoint: '',
  deliveryTime: '',
  notes: ''
};

export function CheckoutWhatsAppForm() {
  const { items, closeCart } = usePublicCart();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  function updateField(field: keyof CheckoutForm, value: string) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
    setError('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (items.length === 0) {
      setError('Agrega al menos un producto a tu pedido.');
      return;
    }

    if (!form.customerName.trim()) {
      setError('Escribe tu nombre para enviar el pedido.');
      return;
    }

    if (!form.deliveryPoint) {
      setError('Elige un punto de entrega.');
      return;
    }

    if (!form.deliveryTime) {
      setError('Elige un horario de entrega.');
      return;
    }

    window.open(buildCartWhatsAppLink(items, form), '_blank', 'noopener,noreferrer');
    closeCart();
  }

  return (
    <form className="checkout-whatsapp-form" onSubmit={handleSubmit}>
      <div className="checkout-whatsapp-form__field">
        <label htmlFor="public-cart-name">Nombre *</label>
        <input id="public-cart-name" value={form.customerName} onChange={(event) => updateField('customerName', event.target.value)} placeholder="Tu nombre" />
      </div>
      <div className="checkout-whatsapp-form__field">
        <label htmlFor="public-cart-phone">Teléfono opcional</label>
        <input id="public-cart-phone" value={form.customerPhone} onChange={(event) => updateField('customerPhone', event.target.value)} placeholder="443 000 0000" inputMode="tel" />
      </div>
      <div className="checkout-whatsapp-form__field">
        <label htmlFor="public-cart-delivery-point">Punto de entrega *</label>
        <select id="public-cart-delivery-point" value={form.deliveryPoint} onChange={(event) => updateField('deliveryPoint', event.target.value)}>
          <option value="">Selecciona un punto</option>
          {deliveryPoints.map((point) => <option key={point} value={point}>{point}</option>)}
        </select>
      </div>
      <div className="checkout-whatsapp-form__field">
        <label htmlFor="public-cart-delivery-time">Horario *</label>
        <select id="public-cart-delivery-time" value={form.deliveryTime} onChange={(event) => updateField('deliveryTime', event.target.value)}>
          <option value="">Selecciona un horario</option>
          {deliveryTimes.map((time) => <option key={time} value={time}>{time}</option>)}
        </select>
      </div>
      <div className="checkout-whatsapp-form__field checkout-whatsapp-form__field--full">
        <label htmlFor="public-cart-notes">Notas opcionales</label>
        <textarea id="public-cart-notes" value={form.notes} onChange={(event) => updateField('notes', event.target.value)} placeholder="Sabores, fecha deseada o detalles del pedido" rows={3} />
      </div>
      {error ? <p className="checkout-whatsapp-form__error" role="alert">{error}</p> : null}
      <button type="submit" className="checkout-whatsapp-form__submit">Enviar pedido por WhatsApp</button>
    </form>
  );
}
