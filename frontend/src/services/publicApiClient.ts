const API_BASE_URL = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: 'Error inesperado' }));
    throw new Error(errorBody.message ?? 'Error inesperado');
  }

  return response.json() as Promise<T>;
}

export const publicApiClient = {
  get: <T>(path: string) => request<T>(path)
};
