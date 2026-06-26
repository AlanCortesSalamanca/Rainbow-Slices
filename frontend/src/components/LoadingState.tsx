import './StateBlocks.css';

export function LoadingState() {
  return (
    <div className="state-block">
      <strong>Cargando información...</strong>
      <p>Estamos consultando la API administrativa.</p>
    </div>
  );
}
