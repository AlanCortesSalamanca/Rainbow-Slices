import { FormEvent, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { FormField } from '../../components/FormField';
import { TextInput } from '../../components/TextInput';
import { useAuth } from '../../auth/AuthContext';
import './LoginPage.css';

interface LocationState {
  from?: {
    pathname?: string;
  };
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout, session, user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as LocationState | null)?.from?.pathname ?? '/products';

  const role = user?.user_metadata?.role ?? user?.app_metadata?.role;

  useEffect(() => {
    if (!loading && session && role !== 'admin') {
      logout().catch(() => undefined);
      setError('Tu usuario no tiene permisos administrativos.');
    }
  }, [loading, logout, role, session]);

  if (!loading && session && role === 'admin') {
    return <Navigate to="/products" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-page__card">
        <div className="login-page__brand">
          <span>RS</span>
          <div>
            <strong>Rainbow Slices</strong>
            <p>Administración privada</p>
          </div>
        </div>
        <div className="login-page__intro">
          <p className="login-page__eyebrow">Acceso administrativo</p>
          <h1>Gestiona pedidos, producción e inventario con seguridad.</h1>
        </div>
        <form className="login-page__form" onSubmit={handleSubmit}>
          <FormField label="Email">
            <TextInput type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
          </FormField>
          <FormField label="Contraseña">
            <TextInput type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
          </FormField>
          {error ? <p className="login-page__error">{error}</p> : null}
          <Button type="submit" disabled={submitting || loading}>{submitting ? 'Ingresando...' : 'Ingresar'}</Button>
        </form>
      </section>
    </main>
  );
}
