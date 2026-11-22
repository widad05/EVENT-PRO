let inMemoryAuthToken: string | null = null;

export function setAuthToken(token: string | null) {
  inMemoryAuthToken = token;
}

export function getAuthToken(): string | null {
  return inMemoryAuthToken;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (inMemoryAuthToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${inMemoryAuthToken}`);
  }

  const res = await fetch(path, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errMsg =
      typeof data?.error === 'string'
        ? data.error
        : `Une erreur est survenue (HTTP ${res.status}).`;
    throw new Error(errMsg);
  }
  return data as T;
}

export function formatMad(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || !Number.isFinite(amount)) {
    return 'Tarif sur devis';
  }
  return `${new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(amount)} MAD`;
}

export function formatDateFr(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Date à définir';
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return new Intl.DateTimeFormat('fr-MA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Casablanca',
  }).format(parsed);
}

export function buildWhatsAppUrl(
  whatsappNumber: string,
  contextMessage: string
): string {
  const digits = (whatsappNumber || '+212600000000').replace(/[^\d]/g, '');
  const text = encodeURIComponent(contextMessage);
  return `https://wa.me/${digits}?text=${text}`;
}

export function parseJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}
