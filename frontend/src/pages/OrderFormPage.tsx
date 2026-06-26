import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { FormField } from '../components/FormField';
import { NumberInput } from '../components/NumberInput';
import { PageTitle } from '../components/PageTitle';
import { SelectInput } from '../components/SelectInput';
import { TextArea } from '../components/TextArea';
import { TextInput } from '../components/TextInput';

export function OrderFormPage() {
  return (
    <section>
      <PageTitle title="Formulario de pedido" description="Captura cliente, fecha, entrega, anticipo e items. Permite pedidos aunque falte stock y marca producción requerida." />
      <form className="panel form-grid">
        <FormField label="Cliente"><TextInput name="customer_name" /></FormField>
        <FormField label="Teléfono"><TextInput name="customer_phone" /></FormField>
        <FormField label="Fecha de entrega"><TextInput name="delivery_date" type="date" /></FormField>
        <FormField label="Hora de entrega">
          <SelectInput name="delivery_time" defaultValue="11:00">
            <option value="11:00">11:00 AM</option>
            <option value="16:00">4:00 PM</option>
          </SelectInput>
        </FormField>
        <FormField label="Costo de entrega"><NumberInput name="delivery_fee" defaultValue={15} min={0} /></FormField>
        <FormField label="Anticipo pagado"><NumberInput name="deposit_paid" defaultValue={0} min={0} /></FormField>
        <div className="full-width"><FormField label="Notas"><TextArea name="notes" /></FormField></div>
        <div className="page-actions full-width">
          <Button type="button">Guardar pedido</Button>
          <Link to="/orders"><Button type="button" variant="secondary">Volver</Button></Link>
        </div>
      </form>
    </section>
  );
}
