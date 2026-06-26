import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { TextInput } from '../components/TextInput';
import { deliveryPointsService } from '../services/deliveryPoints.service';
import { inventoryService } from '../services/inventory.service';
import { ordersService } from '../services/orders.service';
import { productsService } from '../services/products.service';
import type { DeliveryPoint } from '../types/delivery.types';
import type { FinishedInventoryStock } from '../types/inventory.types';
import type { Product } from '../types/product.types';
import './OrderFormPage.css';

interface OrderFormItem {
  product_id: string;
  product_name: string;
  presentation: Product['presentation'];
  quantity: number;
  unit_price: number;
  available_stock: number;
}

export function OrderFormPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [stock, setStock] = useState<FinishedInventoryStock[]>([]);
  const [deliveryPoints, setDeliveryPoints] = useState<DeliveryPoint[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState<'11:00' | '16:00'>('11:00');
  const [deliveryPointId, setDeliveryPointId] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(15);
  const [depositPaid, setDepositPaid] = useState(0);
  const [notes, setNotes] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [items, setItems] = useState<OrderFormItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadData() {
    const [nextProducts, nextStock, nextDeliveryPoints] = await Promise.all([
      productsService.list(),
      inventoryService.getFinishedInventory(),
      deliveryPointsService.list()
    ]);

    const activeProducts = nextProducts.filter((product) => product.status === 'active');
    setProducts(activeProducts);
    setStock(nextStock);
    setDeliveryPoints(nextDeliveryPoints);
    setSelectedProductId(activeProducts[0]?.id ?? '');
    setDeliveryPointId(nextDeliveryPoints[0]?.id ?? '');
    setDeliveryFee(Number(nextDeliveryPoints[0]?.delivery_fee ?? 15));
  }

  useEffect(() => {
    loadData()
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const productsWithStock = useMemo(() => {
    return products.map((product) => ({
      ...product,
      current_stock: stock.find((item) => item.product_id === product.id)?.current_stock ?? 0
    }));
  }, [products, stock]);

  const selectedProduct = productsWithStock.find((product) => product.id === selectedProductId) ?? null;
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
  const total = subtotal + deliveryFee;
  const suggestedDeposit = total > 300 ? total * 0.5 : 0;

  function handleDeliveryPointChange(nextDeliveryPointId: string) {
    const nextDeliveryPoint = deliveryPoints.find((point) => point.id === nextDeliveryPointId);
    setDeliveryPointId(nextDeliveryPointId);
    setDeliveryFee(Number(nextDeliveryPoint?.delivery_fee ?? 15));
  }

  function addItem() {
    setError('');

    if (!selectedProduct) {
      setError('Selecciona un producto activo');
      return;
    }

    const quantityAlreadyAdded = items
      .filter((item) => item.product_id === selectedProduct.id)
      .reduce((sum, item) => sum + item.quantity, 0);
    const availableToAdd = selectedProduct.current_stock - quantityAlreadyAdded;

    if (selectedQuantity <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    if (selectedQuantity > availableToAdd) {
      setError(`Stock insuficiente. Disponible para agregar: ${availableToAdd}`);
      return;
    }

    setItems((currentItems) => [
      ...currentItems,
      {
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        presentation: selectedProduct.presentation,
        quantity: selectedQuantity,
        unit_price: Number(selectedProduct.sale_price),
        available_stock: selectedProduct.current_stock
      }
    ]);
    setSelectedQuantity(1);
  }

  function removeItem(index: number) {
    setItems((currentItems) => currentItems.filter((_item, itemIndex) => itemIndex !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Agrega al menos un producto al pedido');
      return;
    }

    if (total > 300 && depositPaid <= 0) {
      setError('Los pedidos mayores a $300 MXN requieren anticipo registrado');
      return;
    }

    setSaving(true);

    try {
      const order = await ordersService.create({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        delivery_date: deliveryDate,
        delivery_time: deliveryTime,
        delivery_point_id: deliveryPointId,
        delivery_fee: deliveryFee,
        deposit_paid: depositPaid,
        notes: notes.trim() || undefined,
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      });

      navigate(`/orders/${order.id}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo guardar el pedido');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <section>
      <PageTitle title="Formulario de pedido" description="Captura cliente, entrega, anticipo e items. El pedido solo se guarda si hay stock suficiente y el backend reserva inventario." />
      {error ? <ErrorState message={error} /> : null}
      <form className="panel form-grid" onSubmit={handleSubmit}>
        <FormField label="Cliente"><TextInput name="customer_name" value={customerName} onChange={(event) => setCustomerName(event.target.value)} required /></FormField>
        <FormField label="Teléfono"><TextInput name="customer_phone" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} required /></FormField>
        <FormField label="Fecha de entrega"><TextInput name="delivery_date" type="date" value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} required /></FormField>
        <FormField label="Hora de entrega">
          <SelectInput name="delivery_time" value={deliveryTime} onChange={(event) => setDeliveryTime(event.target.value as '11:00' | '16:00')}>
            <option value="11:00">11:00 AM</option>
            <option value="16:00">4:00 PM</option>
          </SelectInput>
        </FormField>
        <FormField label="Punto de entrega">
          <SelectInput name="delivery_point_id" value={deliveryPointId} onChange={(event) => handleDeliveryPointChange(event.target.value)} required>
            {deliveryPoints.map((point) => (
              <option key={point.id} value={point.id}>{point.name}</option>
            ))}
          </SelectInput>
        </FormField>
        <FormField label="Costo de entrega"><NumberInput name="delivery_fee" value={deliveryFee} min={0} onChange={(event) => setDeliveryFee(Number(event.target.value))} /></FormField>
        <FormField label="Anticipo pagado"><NumberInput name="deposit_paid" value={depositPaid} min={0} onChange={(event) => setDepositPaid(Number(event.target.value))} /></FormField>
        <div className="order-form__picker full-width">
          <FormField label="Producto con stock">
            <SelectInput value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)}>
              {productsWithStock.map((product) => (
                <option key={product.id} value={product.id}>{product.name} - {product.presentation} - Stock {product.current_stock}</option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Cantidad"><NumberInput min={1} value={selectedQuantity} onChange={(event) => setSelectedQuantity(Number(event.target.value))} /></FormField>
          <Button type="button" onClick={addItem}>Agregar producto</Button>
        </div>
        <div className="full-width">
          <DataTable
            data={items}
            columns={[
              { key: 'product', header: 'Producto', render: (row) => row.product_name },
              { key: 'stock', header: 'Stock', render: (row) => row.available_stock },
              { key: 'quantity', header: 'Cantidad', render: (row) => row.quantity },
              { key: 'price', header: 'Precio', render: (row) => <MoneyText value={row.unit_price} /> },
              { key: 'total', header: 'Total', render: (row) => <MoneyText value={row.quantity * row.unit_price} /> },
              { key: 'actions', header: 'Acciones', render: (_row, index) => <Button type="button" variant="secondary" onClick={() => removeItem(index)}>Quitar</Button> }
            ]}
          />
        </div>
        <div className="order-form__totals full-width">
          <span>Subtotal: <MoneyText value={subtotal} /></span>
          <span>Entrega: <MoneyText value={deliveryFee} /></span>
          <strong>Total: <MoneyText value={total} /></strong>
          {total > 300 ? <span>Anticipo sugerido: <MoneyText value={suggestedDeposit} /></span> : null}
        </div>
        <div className="full-width"><FormField label="Notas"><TextArea name="notes" value={notes} onChange={(event) => setNotes(event.target.value)} /></FormField></div>
        <div className="page-actions full-width">
          <Button type="submit" disabled={saving || deliveryPoints.length === 0}>{saving ? 'Guardando...' : 'Guardar pedido'}</Button>
          <Link to="/orders"><Button type="button" variant="secondary">Volver</Button></Link>
        </div>
      </form>
    </section>
  );
}
