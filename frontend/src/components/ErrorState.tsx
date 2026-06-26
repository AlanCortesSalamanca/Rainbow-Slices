import './StateBlocks.css';

interface ErrorStateProps {
  message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="state-block state-block--error">
      <strong>No se pudo cargar</strong>
      <p>{message}</p>
    </div>
  );
}
