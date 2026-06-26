import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { FormField } from '../components/FormField';
import { InventoryMovementsTable } from '../components/InventoryMovementsTable';
import { LoadingState } from '../components/LoadingState';
import { MoneyText } from '../components/MoneyText';
import { PageTitle } from '../components/PageTitle';
import { SelectInput } from '../components/SelectInput';
import { StockAdjustmentDialog } from '../components/StockAdjustmentDialog';
import { TextInput } from '../components/TextInput';
import { WasteDialog } from '../components/WasteDialog';
import { inventoryService } from '../services/inventory.service';
import type {
  AdjustmentPayload,
  FinishedInventoryItem,
  FinishedInventoryMovement,
  FinishedInventoryMovementFilters,
  FinishedInventoryProductDetail,
  WastePayload
} from '../types/inventory.types';
import './InventoryProductDetailPage.css';

type PendingAction =
  | { type: 'waste'; payload: WastePayload; productName: string }
  | { type: 'adjustment'; payload: AdjustmentPayload; productName: string };

const presentationLabels = {
  slice: 'Rebanada',
  whole: 'Entero',
  mini: 'Mini',
  custom: 'Personalizado'
};

const initialMovementFilters: FinishedInventoryMovementFilters = {
  movement_type: '',
  date_from: '',
  date_to: '',
  related_order_id: '',
  related_production_batch_id: ''
};

function hasMovementFilters(filters: FinishedInventoryMovementFilters) {
  return Boolean(filters.movement_type || filters.date_from || filters.date_to || filters.related_order_id || filters.related_production_batch_id);
}

export function InventoryProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const [detail, setDetail] = useState<FinishedInventoryProductDetail | null>(null);
  const [movements, setMovements] = useState<FinishedInventoryMovement[]>([]);
  const [movementFilters, setMovementFilters] = useState<FinishedInventoryMovementFilters>(initialMovementFilters);
  const [selectedProduct, setSelectedProduct] = useState<FinishedInventoryItem | null>(null);
  const [dialog, setDialog] = useState<'waste' | 'adjustment' | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [loading, setLoading] = useState(true);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadDetail = () => {
    if (!productId) return;

    setLoading(true);
    setError('');
    inventoryService
      .getFinishedInventoryProduct(productId)
      .then((response) => {
        setDetail(response);
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  };

  const loadMovements = () => {
    if (!productId) return;

    setMovementsLoading(true);
    inventoryService
      .getFinishedInventoryMovements(productId, movementFilters)
      .then(setMovements)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setMovementsLoading(false));
  };

  useEffect(() => {
    loadDetail();
  }, [productId]);

  useEffect(() => {
    if (!detail) return;

    if (hasMovementFilters(movementFilters)) {
      loadMovements();
      return;
    }

    setMovements(detail.movements);
  }, [productId, movementFilters, detail]);

  const product = detail?.product ?? null;

  const openDialog = (type: 'waste' | 'adjustment') => {
    if (!product) return;
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
    setPendingAction({ type: 'waste', payload, productName: product?.name ?? 'producto' });
    closeDialog();
  };

  const prepareAdjustment = (payload: AdjustmentPayload) => {
    setPendingAction({ type: 'adjustment', payload, productName: product?.name ?? 'producto' });
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
      loadDetail();
      loadMovements();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo registrar el movimiento.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <PageTitle title="Detalle de inventario" description="Trazabilidad completa del stock terminado por producto." />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}

      {!loading && !error && !detail ? <EmptyState title="Producto no encontrado" /> : null}

      {!loading && detail && product ? (
        <div className="inventory-product-detail">
          <header className="inventory-product-detail__header">
            <div className="inventory-product-detail__media">
              {product.image_url ? <img src={product.image_url} alt={product.name} /> : <span>RS</span>}
            </div>
            <div className="inventory-product-detail__headline">
              <Link to="/inventory/finished">Volver a inventario</Link>
              <h2>{product.name}</h2>
              <p>{presentationLabels[product.presentation]} · <MoneyText value={product.sale_price} /> · {product.pieces_per_batch} unidades por producción</p>
              <strong className={`inventory-product-detail__stock inventory-product-detail__stock--${product.status}`}>Stock actual: {detail.current_stock}</strong>
              {product.product_status === 'inactive' ? <p className="inventory-product-detail__warning">Producto inactivo: disponible solo para consulta de trazabilidad.</p> : null}
              {product.status === 'negative' ? <p className="inventory-product-detail__warning">Stock negativo: revisar movimientos.</p> : null}
            </div>
            <div className="inventory-product-detail__actions">
              <Button variant="secondary" onClick={() => openDialog('waste')} disabled={product.current_stock <= 0 || product.product_status !== 'active'}>Registrar merma</Button>
              <Button variant="secondary" onClick={() => openDialog('adjustment')} disabled={product.product_status !== 'active'}>Ajuste manual</Button>
              <Link className="inventory-product-detail__button-link" to="/production">Ir a producción</Link>
            </div>
          </header>

          {success ? <p className="inventory-product-detail__success">{success}</p> : null}
          {saving ? <p className="inventory-product-detail__saving">Registrando movimiento...</p> : null}

          <div className="inventory-product-detail__summary">
            <div><span>Total producido</span><strong>{detail.movement_summary.total_produced}</strong></div>
            <div><span>Total reservado</span><strong>{detail.movement_summary.total_reserved}</strong></div>
            <div><span>Total liberado</span><strong>{detail.movement_summary.total_unreserved}</strong></div>
            <div><span>Total vendido</span><strong>{detail.movement_summary.total_sold}</strong></div>
            <div><span>Total merma</span><strong>{detail.movement_summary.total_waste}</strong></div>
            <div><span>Ajustes netos</span><strong>{detail.movement_summary.total_adjustments}</strong></div>
          </div>

          <section className="inventory-product-detail__section">
            <h3>Movimientos</h3>
            <div className="inventory-product-detail__filters">
              <FormField label="Tipo">
                <SelectInput value={movementFilters.movement_type ?? ''} onChange={(event) => setMovementFilters((current) => ({ ...current, movement_type: event.target.value as FinishedInventoryMovementFilters['movement_type'] }))}>
                  <option value="">Todos</option>
                  <option value="production_output">Producción</option>
                  <option value="reserved">Reservado</option>
                  <option value="unreserved">Liberado</option>
                  <option value="sold">Vendido</option>
                  <option value="waste">Merma</option>
                  <option value="adjustment">Ajuste</option>
                </SelectInput>
              </FormField>
              <FormField label="Desde">
                <TextInput type="date" value={movementFilters.date_from ?? ''} onChange={(event) => setMovementFilters((current) => ({ ...current, date_from: event.target.value }))} />
              </FormField>
              <FormField label="Hasta">
                <TextInput type="date" value={movementFilters.date_to ?? ''} onChange={(event) => setMovementFilters((current) => ({ ...current, date_to: event.target.value }))} />
              </FormField>
              <FormField label="Pedido">
                <TextInput value={movementFilters.related_order_id ?? ''} onChange={(event) => setMovementFilters((current) => ({ ...current, related_order_id: event.target.value }))} placeholder="UUID del pedido" />
              </FormField>
              <FormField label="Producción">
                <TextInput value={movementFilters.related_production_batch_id ?? ''} onChange={(event) => setMovementFilters((current) => ({ ...current, related_production_batch_id: event.target.value }))} placeholder="UUID de producción" />
              </FormField>
              <Button type="button" variant="secondary" onClick={() => setMovementFilters(initialMovementFilters)}>Limpiar</Button>
            </div>
            {movementsLoading ? <LoadingState /> : null}
            {!movementsLoading && movements.length === 0 ? <EmptyState title="Sin movimientos" description="No hay movimientos para los filtros seleccionados." /> : null}
            {!movementsLoading && movements.length > 0 ? <InventoryMovementsTable movements={movements} /> : null}
          </section>
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
    </section>
  );
}
