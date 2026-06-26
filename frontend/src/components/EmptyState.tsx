import './StateBlocks.css';

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="state-block">
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
