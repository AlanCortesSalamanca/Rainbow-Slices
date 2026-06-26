const WHATSAPP_NUMBER = '522761274898';

export function createWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const generalWhatsAppLink = createWhatsAppLink('Hola, quiero hacer un pedido de Rainbow Slices. ¿Me puedes dar disponibilidad de sabores?');
