export function getMinimumDeliveryDate(hasStock: boolean, now = new Date()): Date {
  const minimum = new Date(now);

  if (!hasStock) {
    minimum.setDate(minimum.getDate() + 1);
  }

  return minimum;
}
