import { EmptyState } from '../components/EmptyState';
import { PageTitle } from '../components/PageTitle';

export function RecipesPage() {
  return (
    <section>
      <PageTitle title="Recetas" description="Configura ingredientes requeridos por producto para calcular costos y disponibilidad." />
      <EmptyState title="Editor de recetas listo para conectar" description="La API ya expone GET, POST, PUT y DELETE por producto. En el siguiente incremento se conectará un selector producto-ingrediente." />
    </section>
  );
}
