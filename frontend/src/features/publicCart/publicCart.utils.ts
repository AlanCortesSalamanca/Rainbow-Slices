import { createWhatsAppLink } from '../../utils/whatsapp';
import type { CheckoutForm, PublicCartItem, PublicCartProduct } from './publicCart.types';

export const deliveryFee = 15;
export const deliveryPoints = ['Centro de Morelia', 'Carrillo', 'CFE de Colonia Industrial'];
export const deliveryTimes = ['11:00 AM', '4:00 PM'];

export const presentationLabels = {
  slice: 'Rebanada',
  whole: 'Completo',
  mini: 'Mini',
  custom: 'Personalizado'
} as const;

export function formatCurrency(value: number) {
  return `${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)} MXN`;
}

export function toCartItem(product: PublicCartProduct): PublicCartItem {
  return {
    productId: product.id,
    name: product.name,
    slug: product.slug,
    sale_price: Number(product.sale_price ?? 0),
    image_url: product.image_url,
    presentation: product.presentation,
    quantity: 1,
    current_stock: Number(product.current_stock ?? 0)
  };
}

export function getCartItemLimit(item: Pick<PublicCartItem, 'current_stock'>) {
  return item.current_stock > 0 ? item.current_stock : Number.POSITIVE_INFINITY;
}

export function getCartSubtotal(items: PublicCartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity * Math.max(Number(item.sale_price ?? 0), 0), 0);
}

export function getCartDeliveryFee(items: PublicCartItem[]) {
  return items.length > 0 ? deliveryFee : 0;
}

export function getCartTotal(items: PublicCartItem[]) {
  return getCartSubtotal(items) + getCartDeliveryFee(items);
}

export function hasAvailabilityWarning(items: PublicCartItem[]) {
  return items.some((item) => item.current_stock <= 0);
}

export function buildCartWhatsAppLink(items: PublicCartItem[], form: CheckoutForm) {
  const subtotal = getCartSubtotal(items);
  const fee = getCartDeliveryFee(items);
  const total = subtotal + fee;
  const productLines = items.map((item) => {
    const unitPrice = item.sale_price > 0 ? formatCurrency(item.sale_price) : 'Precio por confirmar';
    const lineTotal = item.sale_price > 0 ? formatCurrency(item.quantity * item.sale_price) : 'Precio por confirmar';
    const availability = item.current_stock <= 0 ? ' - Consultar disponibilidad' : '';

    return `* ${item.quantity} x ${item.name} (${presentationLabels[item.presentation]}) - ${unitPrice} c/u = ${lineTotal}${availability}`;
  });

  const phoneLine = form.customerPhone.trim() ? `Teléfono: ${form.customerPhone.trim()}\n` : '';
  const notesLine = form.notes.trim() ? `\nNotas:\n${form.notes.trim()}\n` : '';
  const availabilityNote = hasAvailabilityWarning(items) ? '\nNota: Algunos productos aparecen como "consultar disponibilidad".\n' : '';

  const message = [
    'Hola, quiero hacer un pedido de Rainbow Slices.',
    '',
    `Nombre: ${form.customerName.trim()}`,
    phoneLine.trimEnd(),
    'Productos:',
    '',
    productLines.join('\n'),
    '',
    'Entrega:',
    `Punto: ${form.deliveryPoint}`,
    `Horario: ${form.deliveryTime}`,
    `Costo de entrega: ${formatCurrency(fee)}`,
    '',
    `Subtotal: ${formatCurrency(subtotal)}`,
    `Total estimado: ${formatCurrency(total)}`,
    notesLine.trimEnd(),
    availabilityNote.trimEnd(),
    '¿Me puedes confirmar disponibilidad y el total final?'
  ]
    .filter((line) => line !== '')
    .join('\n');

  return createWhatsAppLink(message);
}
