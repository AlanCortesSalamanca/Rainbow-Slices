interface MoneyTextProps {
  value: number;
}

export function MoneyText({ value }: MoneyTextProps) {
  return <span>{new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)}</span>;
}
