import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { ErrorState } from '../components/ErrorState';
import { FormField } from '../components/FormField';
import { LoadingState } from '../components/LoadingState';
import { NumberInput } from '../components/NumberInput';
import { PageTitle } from '../components/PageTitle';
import { SelectInput } from '../components/SelectInput';
import { TextArea } from '../components/TextArea';
import { TextInput } from '../components/TextInput';
import { productsService } from '../services/products.service';
import { uploadsService } from '../services/uploads.service';
import type { PresentationType, ProductStatus } from '../types/common.types';
import './ProductFormPage.css';

interface ProductFormState {
  name: string;
  slug: string;
  category: string;
  description: string;
  presentation: PresentationType;
  pieces_per_batch: number;
  sale_price: number;
  image_url: string;
  preparation_time_days: number;
  status: ProductStatus;
  internal_notes: string;
}

const initialForm: ProductFormState = {
  name: '',
  slug: '',
  category: 'Cheesecake',
  description: '',
  presentation: 'slice',
  pieces_per_batch: 9,
  sale_price: 0,
  image_url: '',
  preparation_time_days: 1,
  status: 'active',
  internal_notes: ''
};

export function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [form, setForm] = useState<ProductFormState>(initialForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    productsService
      .getById(id)
      .then((detail) => {
        setForm({
          name: detail.product.name,
          slug: detail.product.slug,
          category: detail.product.category,
          description: detail.product.description ?? '',
          presentation: detail.product.presentation,
          pieces_per_batch: detail.product.pieces_per_batch,
          sale_price: Number(detail.product.sale_price),
          image_url: detail.product.image_url ?? '',
          preparation_time_days: detail.product.preparation_time_days,
          status: detail.product.status,
          internal_notes: detail.product.internal_notes ?? ''
        });
        setImagePreview(detail.product.image_url ?? '');
      })
      .catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : 'No se pudo cargar el producto'))
      .finally(() => setLoading(false));
  }, [id]);

  function updateField<Key extends keyof ProductFormState>(key: Key, value: ProductFormState[Key]) {
    setForm((currentForm) => ({ ...currentForm, [key]: value }));
  }

  function handlePresentationChange(value: PresentationType) {
    setForm((currentForm) => ({
      ...currentForm,
      presentation: value,
      pieces_per_batch: value === 'slice' ? 8 : 1
    }));
  }

  function handleImageChange(file?: File) {
    setImageFile(file ?? null);

    if (!file) {
      setImagePreview(form.image_url);
      return;
    }

    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      let imageUrl = form.image_url.trim() || null;

      if (imageFile) {
        const uploadResult = await uploadsService.productImage(imageFile);
        imageUrl = uploadResult.imageUrl;
      }

      const payload = {
        name: form.name.trim(),
        ...(form.slug.trim() ? { slug: form.slug.trim() } : {}),
        category: form.category.trim() || 'Cheesecake',
        description: form.description.trim() || null,
        presentation: form.presentation,
        pieces_per_batch: form.pieces_per_batch,
        sale_price: Number(form.sale_price),
        image_url: imageUrl,
        preparation_time_days: Number(form.preparation_time_days),
        status: form.status,
        is_custom: form.presentation === 'custom',
        internal_notes: form.internal_notes.trim() || null
      };

      if (id) {
        await productsService.update(id, payload);
        navigate(`/products/${id}`);
        return;
      }

      const createdProduct = await productsService.create(payload);
      navigate(`/products/${createdProduct.id}`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo guardar el producto');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  return (
    <section>
      <PageTitle title={isEditing ? 'Editar producto' : 'Nuevo producto'} description="Agrega una imagen desde tu equipo; el backend la sube a Supabase Storage y guarda la URL en el producto." />
      {error ? <ErrorState message={error} /> : null}
      <form className="panel form-grid" onSubmit={handleSubmit}>
        <FormField label="Nombre"><TextInput name="name" value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Cheesecake de Oreo Rebanada" required /></FormField>
        <FormField label="Slug"><TextInput name="slug" value={form.slug} onChange={(event) => updateField('slug', event.target.value)} placeholder="cheesecake-oreo-rebanada" /></FormField>
        <FormField label="Categoría"><TextInput name="category" value={form.category} onChange={(event) => updateField('category', event.target.value)} /></FormField>
        <FormField label="Presentación">
          <SelectInput name="presentation" value={form.presentation} onChange={(event) => handlePresentationChange(event.target.value as PresentationType)}>
            <option value="slice">Rebanada</option>
            <option value="whole">Completo</option>
            <option value="mini">Mini</option>
            <option value="custom">Personalizado</option>
          </SelectInput>
        </FormField>
        <FormField label="Piezas por batch" hint="Se calcula automáticamente: rebanada = 8, otras presentaciones = 1."><NumberInput name="pieces_per_batch" value={form.pieces_per_batch} min={1} readOnly /></FormField>
        <FormField label="Precio de venta"><NumberInput name="sale_price" value={form.sale_price} min={0} step="0.01" onChange={(event) => updateField('sale_price', Number(event.target.value))} /></FormField>
        <FormField label="Imagen desde tu equipo" hint="Formatos permitidos: JPG, PNG, WEBP o GIF. Máximo 5 MB.">
          <input className="input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => handleImageChange(event.target.files?.[0])} />
        </FormField>
        <FormField label="URL de imagen"><TextInput name="image_url" value={form.image_url} onChange={(event) => updateField('image_url', event.target.value)} placeholder="Se llena automáticamente al subir imagen" /></FormField>
        <FormField label="Tiempo de preparación"><NumberInput name="preparation_time_days" value={form.preparation_time_days} min={0} onChange={(event) => updateField('preparation_time_days', Number(event.target.value))} /></FormField>
        <FormField label="Estado">
          <SelectInput name="status" value={form.status} onChange={(event) => updateField('status', event.target.value as ProductStatus)}>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </SelectInput>
        </FormField>
        {imagePreview ? (
          <div className="product-form__preview full-width">
            <span>Vista previa</span>
            <img src={imagePreview} alt="Vista previa del producto" />
          </div>
        ) : null}
        <div className="full-width"><FormField label="Descripción"><TextArea name="description" value={form.description} onChange={(event) => updateField('description', event.target.value)} /></FormField></div>
        <div className="full-width"><FormField label="Notas internas"><TextArea name="internal_notes" value={form.internal_notes} onChange={(event) => updateField('internal_notes', event.target.value)} /></FormField></div>
        <div className="page-actions full-width">
          <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar producto'}</Button>
          <Link to="/products"><Button type="button" variant="secondary">Volver</Button></Link>
        </div>
      </form>
    </section>
  );
}
