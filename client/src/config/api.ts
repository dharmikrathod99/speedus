/**
 * SPEED US - Centralized API Client Configuration
 * Automatically points to https://speedus.onrender.com in production,
 * and http://localhost:3001 or Vite proxy in local development.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://speedus.onrender.com' : 'http://localhost:3001');

export async function fetchApi<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `API request failed with status ${response.status}`);
  }

  return response.json();
}

