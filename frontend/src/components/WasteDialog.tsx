import { useEffect, useState, type FormEvent } from 'react';
import { Button } from './Button';
import { FormField } from './FormField';
import { NumberInput } from './NumberInput';
import { TextArea } from './TextArea';
import type { FinishedInventoryItem, WastePayload } from '../types/inventory.types';
import './StockMovementDialog.css';

interface WasteDialogProps {
  product: FinishedInventoryItem | null;
  open: boolean;
  onCancel: () => void;
  onSubmit: (payload: WastePayload) => void;
}

export function WasteDialog({ product, open, onCancel, onSubmit }: WasteDialogProps) {
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setQuantity('1');
      setNotes('');
      setError('');
    }
  }, [open]);

  if (!open || !product) return null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedQuantity = Number(quantity);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setError('La cantidad debe ser un entero mayor a 0.');
      return;
    }

    if (parsedQuantity > product.current_stock) {
      setError(`No puedes registrar merma mayor al stock actual (${product.current_stock}).`);
      return;
    }

    onSubmit({ product_id: product.product_id, quantity: parsedQuantity, notes: notes.trim() || undefined });
  };

  return (
    <div className="stock-movement-dialog" role="dialog" aria-modal="true">
      <form className="stock-movement-dialog__panel" onSubmit={handleSubmit}>
        <h3>Registrar merma</h3>
        <p>La merma reducirá el stock de {product.name}. Stock actual: <strong>{product.current_stock}</strong>.</p>
        {error ? <p className="stock-movement-dialog__error">{error}</p> : null}
        <FormField label="Cantidad">
          <NumberInput min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
        </FormField>
        <FormField label="Notas" hint="Opcional. Ejemplo: Se dañaron durante transporte.">
          <TextArea value={notes} onChange={(event) => setNotes(event.target.value)} />
        </FormField>
        <div className="stock-movement-dialog__actions">
          <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" variant="danger">Continuar</Button>
        </div>
      </form>
    </div>
  );
}
