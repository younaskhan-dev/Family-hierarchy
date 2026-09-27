export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

const toUrl = (path: string, params?: Record<string, string | undefined>) => {
  const normalizedPath = path.replace(/^\/+/, '');
  const url = new URL(normalizedPath, `${API_BASE_URL.replace(/\/$/, '')}/`);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
};

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  params?: Record<string, string | undefined>,
): Promise<T> {
  const url = toUrl(path, params);
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('family-hierarchy-admin-token') : null;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === 'object' && payload && 'message' in payload ? String(payload.message) : 'Request failed';
    throw new Error(message);
  }

  if (typeof payload === 'object' && payload && 'data' in payload) {
    return payload.data as T;
  }

  return payload as T;
}

export function buildApiUrl(path: string, params?: Record<string, string | undefined>) {
  return toUrl(path, params);
}
