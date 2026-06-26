import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { FormField } from '../components/FormField';
import { NumberInput } from '../components/NumberInput';
import { PageTitle } from '../components/PageTitle';
import { TextInput } from '../components/TextInput';

export function IngredientFormPage() {
  return (
    <section>
      <PageTitle title="Formulario de ingrediente" description="Alta y edición de materia prima." />
      <form className="panel form-grid">
        <FormField label="Nombre"><TextInput name="name" placeholder="Queso crema" /></FormField>
        <FormField label="Unidad"><TextInput name="unit" placeholder="g, pieza, ml" /></FormField>
        <FormField label="Stock mínimo"><NumberInput name="minimum_stock" min={0} step="0.001" /></FormField>
        <div className="page-actions full-width">
          <Button type="button">Guardar ingrediente</Button>
          <Link to="/ingredients"><Button type="button" variant="secondary">Volver</Button></Link>
        </div>
      </form>
    </section>
  );
}
