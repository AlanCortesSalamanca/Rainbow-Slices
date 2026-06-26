import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { FormField } from '../components/FormField';
import { InventoryStockCard } from '../components/InventoryStockCard';
import { LoadingState } from '../components/LoadingState';
import { PageTitle } from '../components/PageTitle';
import { SelectInput } from '../components/SelectInput';
import { StockAdjustmentDialog } from '../components/StockAdjustmentDialog';
import { TextInput } from '../components/TextInput';
import { WasteDialog } from '../components/WasteDialog';
import { inventoryService } from '../services/inventory.service';
import type { AdjustmentPayload, FinishedInventoryFilters, FinishedInventoryItem, WastePayload } from '../types/inventory.types';
import './FinishedInventoryPage.css';

type PendingAction =
  | { type: 'waste'; payload: WastePayload; productName: string }
  | { type: 'adjustment'; payload: AdjustmentPayload; productName: string };

const initialFilters: FinishedInventoryFilters = {
  search: '',
  presentation: '',
  status: '',
  sort: 'name'
};

export function FinishedInventoryPage() {
  const [stock, setStock] = useState<FinishedInventoryItem[]>([]);
  const [filters, setFilters] = useState<FinishedInventoryFilters>(initialFilters);
  const [selectedProduct, setSelectedProduct] = useState<FinishedInventoryItem | null>(null);
  const [dialog, setDialog] = useState<'waste' | 'adjustment' | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadStock = () => {
    setLoading(true);
    setError('');
    inventoryService
      .getFinishedInventory(filters)
      .then(setStock)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStock();
  }, [filters]);

  const openDialog = (type: 'waste' | 'adjustment', product: FinishedInventoryItem) => {
    setSelectedProduct(product);
    setDialog(type);
    setSuccess('');
    setError('');
  };

  const closeDialog = () => {
    setDialog(null);
    setSelectedProduct(null);
  };

  const prepareWaste = (payload: WastePayload) => {
    setPendingAction({ type: 'waste', payload, productName: selectedProduct?.name ?? 'producto' });
    closeDialog();
  };

  const prepareAdjustment = (payload: AdjustmentPayload) => {
    setPendingAction({ type: 'adjustment', payload, productName: selectedProduct?.name ?? 'producto' });
    closeDialog();
  };

  const confirmAction = async () => {
    if (!pendingAction) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (pendingAction.type === 'waste') {
        await inventoryService.createWasteMovement(pendingAction.payload);
        setSuccess('Merma registrada correctamente.');
      } else {
        await inventoryService.createAdjustmentMovement(pendingAction.payload);
        setSuccess('Ajuste manual registrado correctamente.');
      }

      setPendingAction(null);
      loadStock();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo registrar el movimiento.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <PageTitle title="Inventario terminado" description="Stock actual calculado por movimientos de producción, reservas, ventas, mermas y ajustes." />

      <div className="finished-inventory-page__filters">
        <FormField label="Buscar producto">
          <TextInput value={filters.search ?? ''} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Cheesecake, fresa..." />
        </FormField>
        <FormField label="Presentación">
          <SelectInput value={filters.presentation ?? ''} onChange={(event) => setFilters((current) => ({ ...current, presentation: event.target.value as FinishedInventoryFilters['presentation'] }))}>
            <option value="">Todas</option>
            <option value="slice">Rebanada</option>
            <option value="whole">Entero</option>
            <option value="mini">Mini</option>
            <option value="custom">Personalizado</option>
          </SelectInput>
        </FormField>
        <FormField label="Estado">
          <SelectInput value={filters.status ?? ''} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as FinishedInventoryFilters['status'] }))}>
            <option value="">Todos</option>
            <option value="with_stock">Con stock</option>
            <option value="out_of_stock">Agotado</option>
            <option value="negative">Stock negativo</option>
          </SelectInput>
        </FormField>
        <FormField label="Ordenar">
          <SelectInput value={filters.sort ?? 'name'} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value as FinishedInventoryFilters['sort'] }))}>
            <option value="name">Nombre</option>
            <option value="stock_asc">Menor stock primero</option>
            <option value="stock_desc">Mayor stock primero</option>
          </SelectInput>
        </FormField>
        <Button type="button" variant="secondary" onClick={() => setFilters(initialFilters)}>Limpiar filtros</Button>
      </div>

      {success ? <p className="finished-inventory-page__success">{success}</p> : null}
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !error && stock.length === 0 ? <EmptyState title="Sin productos" description="No hay productos que coincidan con los filtros actuales." /> : null}

      {!loading && !error && stock.length > 0 ? (
        <div className="finished-inventory-page__grid">
          {stock.map((item) => (
            <InventoryStockCard key={item.product_id} item={item} onWaste={(product) => openDialog('waste', product)} onAdjustment={(product) => openDialog('adjustment', product)} />
          ))}
        </div>
      ) : null}

      <WasteDialog open={dialog === 'waste'} product={selectedProduct} onCancel={closeDialog} onSubmit={prepareWaste} />
      <StockAdjustmentDialog open={dialog === 'adjustment'} product={selectedProduct} onCancel={closeDialog} onSubmit={prepareAdjustment} />
      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction?.type === 'waste' ? 'Confirmar merma' : 'Confirmar ajuste manual'}
        message={pendingAction ? `Esta acción registrará un movimiento de inventario para ${pendingAction.productName}. ¿Deseas continuar?` : ''}
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmAction}
      />
      {saving ? <p className="finished-inventory-page__saving">Registrando movimiento...</p> : null}
    </section>
  );
}
