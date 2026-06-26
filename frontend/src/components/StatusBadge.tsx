import './StatusBadge.css';

interface StatusBadgeProps {
  value: string;
}

export function StatusBadge({ value }: StatusBadgeProps) {
  return <span className={`status-badge status-badge--${value.replace(/_/g, '-')}`}>{value}</span>;
}
