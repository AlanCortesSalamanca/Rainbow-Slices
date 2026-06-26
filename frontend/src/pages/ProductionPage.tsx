import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Button } from '../components/Button';
import { DataTable } from '../components/DataTable';
import { ErrorState } from '../components/ErrorState';
import { FormField } from '../components/FormField';
import { LoadingState } from '../components/LoadingState';
import { MoneyText } from '../components/MoneyText';
import { NumberInput } from '../components/NumberInput';
import { PageTitle } from '../components/PageTitle';
import { SelectInput } from '../components/SelectInput';
import { TextArea } from '../components/TextArea';
import { inventoryService } from '../services/inventory.service';
import { productsService } from '../services/products.service';
import { productionService } from '../services/production.service';
import type { FinishedInventoryStock } from '../types/inventory.types';
import type { Product } from '../types/product.types';
import type { ProductionBatch } from '../types/production.types';
import './ProductionPage.css';

export function ProductionPage() {
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<FinishedInventoryStock[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [batchesQuantity, setBatchesQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadData() {
    const [nextBatches, nextProducts, nextStock] = await Promise.all([
      productionService.list(),
      productsService.list(),
      inventoryService.getFinishedInventory()
    ]);

    const activeProducts = nextProducts.filter((product) => product.status === 'active');
    setBatches(nextBatches);
    setProducts(activeProducts);
    setStock(nextStock);
    setSelectedProductId((current) => current || activeProducts[0]?.id || '');
  }

  useEffect(() => {
    loadData()
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) ?? null,
    [products, selectedProductId]
  );

  const selectedStock = useMemo(
    () => stock.find((item) => item.product_id === selectedProductId)?.current_stock ?? 0,
    [selectedProductId, stock]
  );

  const unitsToAdd = selectedProduct ? selectedProduct.pieces_per_batch * batchesQuantity : 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const batch = await productionService.create({
        product_id: selectedProductId,
        batches_quantity: batchesQuantity,
        notes: notes.trim() || undefined
      });

      setSuccess(
        batch.production_mode === 'manual'
          ? `Producción registrada sin receta. Se agregaron ${batch.units_produced} unidades al stock y no se descontaron ingredientes.`
          : `Producción registrada. Se agregaron ${batch.units_produced} unidades al stock.`
      );
      setNotes('');
      setBatchesQuantity(1);
      await loadData();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo registrar la producción');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <PageTitle title="Producción" description="Registro de lotes producidos, consumo de ingredientes y salida a inventario terminado." />
      {loading ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {success ? <div className="production-page__success">{success}</div> : null}
      {!loading ? (
        <form className="panel form-grid production-page__form" onSubmit={handleSubmit}>
          <FormField label="Producto activo">
            <SelectInput value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)} required>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Cantidad de producciones/lotes">
            <NumberInput min={1} value={batchesQuantity} onChange={(event) => setBatchesQuantity(Number(event.target.value))} required />
          </FormField>
          <div className="production-page__summary full-width">
            <span>Presentación: {selectedProduct?.presentation ?? '-'}</span>
            <span>Unidades por producción: {selectedProduct?.pieces_per_batch ?? 0}</span>
            <span>Stock actual: {selectedStock}</span>
            <strong>Se agregarán {unitsToAdd} unidades al stock.</strong>
          </div>
          <div className="full-width"><FormField label="Notas"><TextArea value={notes} onChange={(event) => setNotes(event.target.value)} /></FormField></div>
          <div className="page-actions full-width"><Button type="submit" disabled={saving || !selectedProductId}>{saving ? 'Registrando...' : 'Registrar producción'}</Button></div>
        </form>
      ) : null}
      {!loading && !error ? (
        <DataTable
          data={batches}
          columns={[
            { key: 'date', header: 'Fecha', render: (row) => row.production_date },
            { key: 'batches', header: 'Batches', render: (row) => row.batches_quantity },
            { key: 'units', header: 'Unidades', render: (row) => row.units_produced },
            { key: 'mode', header: 'Modo', render: (row) => row.production_mode },
            { key: 'cost', header: 'Costo estimado', render: (row) => <MoneyText value={Number(row.estimated_total_cost)} /> }
          ]}
        />
      ) : null}
    </section>
  );
}
