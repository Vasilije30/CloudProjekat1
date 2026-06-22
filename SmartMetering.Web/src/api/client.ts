const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5080';

export interface ApiError {
  code: string;
  message: string;
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set Content-Type for non-FormData bodies
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({ code: 'Unknown', message: 'An error occurred' }));
    throw err as ApiError;
  }

  // Check if response has content
  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export function get<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: 'GET' });
}

export function post<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
}

export function put<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function patch<T>(path: string, body?: unknown): Promise<T> {
  return apiRequest<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function del<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: 'DELETE' });
}

export function getBlob(path: string): Promise<Blob> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(`${API_BASE}${path}`, { headers }).then(r => {
    if (!r.ok) throw new Error('Download failed');
    return r.blob();
  });
}

export { API_BASE };
