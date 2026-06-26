import { useEffect, useState, type FormEvent } from 'react';
import { Button } from './Button';
import { FormField } from './FormField';
import { NumberInput } from './NumberInput';
import { TextArea } from './TextArea';
import type { AdjustmentPayload, FinishedInventoryItem } from '../types/inventory.types';
import './StockMovementDialog.css';

interface StockAdjustmentDialogProps {
  product: FinishedInventoryItem | null;
  open: boolean;
  onCancel: () => void;
  onSubmit: (payload: AdjustmentPayload) => void;
}

export function StockAdjustmentDialog({ product, open, onCancel, onSubmit }: StockAdjustmentDialogProps) {
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
    const trimmedNotes = notes.trim();

    if (!Number.isInteger(parsedQuantity) || parsedQuantity === 0) {
      setError('El ajuste debe ser un entero distinto de 0.');
      return;
    }

    if (parsedQuantity < 0 && product.current_stock + parsedQuantity < 0) {
      setError(`El ajuste dejaría stock negativo. Stock actual: ${product.current_stock}.`);
      return;
    }

    if (!trimmedNotes) {
      setError('Las notas son obligatorias para ajustes manuales.');
      return;
    }

    onSubmit({ product_id: product.product_id, quantity: parsedQuantity, notes: trimmedNotes });
  };

  return (
    <div className="stock-movement-dialog" role="dialog" aria-modal="true">
      <form className="stock-movement-dialog__panel" onSubmit={handleSubmit}>
        <h3>Ajuste manual</h3>
        <p>Usa cantidades positivas para aumentar inventario y negativas para corregir faltantes. Stock actual: <strong>{product.current_stock}</strong>.</p>
        {error ? <p className="stock-movement-dialog__error">{error}</p> : null}
        <FormField label="Cantidad">
          <NumberInput step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
        </FormField>
        <FormField label="Notas" hint="Obligatorio. Ejemplo: Corrección por conteo físico.">
          <TextArea value={notes} onChange={(event) => setNotes(event.target.value)} required />
        </FormField>
        {Number(quantity) < 0 ? <p className="stock-movement-dialog__warning">Este ajuste reducirá inventario.</p> : <p className="stock-movement-dialog__info">Este ajuste aumentará inventario.</p>}
        <div className="stock-movement-dialog__actions">
          <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" variant={Number(quantity) < 0 ? 'danger' : 'primary'}>Continuar</Button>
        </div>
      </form>
    </div>
  );
}
