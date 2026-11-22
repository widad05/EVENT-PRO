import type { D1Database } from './types.ts';

const encoder = new TextEncoder();

export function sanitizeText(input: unknown, maxLen = 1000): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLen);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 180;
}

export function isValidMoroccanOrIntlPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-().]/g, '');
  return /^(\+212|0)[5-7]\d{8}$/.test(cleaned) || /^\+\d{8,15}$/.test(cleaned);
}

export function isSafeMediaUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('/src/assets/') || url.startsWith('/api/media/') || url.startsWith('/assets/')) {
    return !url.includes('..');
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function fromHex(hex: string): Uint8Array {
  const len = Math.floor(hex.length / 2);
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return toHex(new Uint8Array(digest));
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  return `pbkdf2_100000$${toHex(salt)}$${toHex(new Uint8Array(bits))}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 3 || !parts[0].startsWith('pbkdf2_')) return false;
  const iterations = parseInt(parts[0].replace('pbkdf2_', ''), 10);
  if (!Number.isFinite(iterations) || iterations < 10000) return false;
  const salt = fromHex(parts[1]);
  const expected = fromHex(parts[2]);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  return timingSafeEqual(new Uint8Array(bits), expected);
}

export function generateOpaqueToken(byteLength = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return toHex(bytes);
}

export function generateReferenceCode(prefix: 'EP-RES' | 'EP-DEV'): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const randBytes = crypto.getRandomValues(new Uint8Array(2));
  const num = ((randBytes[0] << 8) | randBytes[1]) % 9000 + 1000;
  return `${prefix}-${y}${m}${d}-${num}`;
}

export async function verifyTurnstileToken(
  secretKey: string | undefined,
  token: string | undefined,
  remoteIp: string | null
): Promise<boolean> {
  if (!secretKey || !secretKey.trim()) {
    return true;
  }
  if (!token || !token.trim()) {
    return false;
  }
  try {
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) formData.append('remoteip', remoteIp);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}

export async function checkRateLimit(
  db: D1Database,
  key: string,
  maxRequests = 20,
  windowSeconds = 60
): Promise<boolean> {
  const nowSec = Math.floor(Date.now() / 1000);
  try {
    const existing = await db
      .prepare('SELECT count, window_start FROM rate_limits WHERE rate_key = ?')
      .bind(key)
      .first<{ count: number; window_start: number }>();

    if (!existing || nowSec - existing.window_start >= windowSeconds) {
      await db
        .prepare(
          'INSERT INTO rate_limits (rate_key, count, window_start) VALUES (?, 1, ?) ON CONFLICT(rate_key) DO UPDATE SET count = 1, window_start = excluded.window_start'
        )
        .bind(key, nowSec)
        .run();
      return true;
    }

    if (existing.count >= maxRequests) {
      return false;
    }

    await db
      .prepare('UPDATE rate_limits SET count = count + 1 WHERE rate_key = ?')
      .bind(key)
      .run();
    return true;
  } catch {
    return true;
  }
}

export function jsonResponse(
  data: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

export function getCorsHeaders(request: Request, allowedOrigin?: string): Record<string, string> {
  const origin = request.headers.get('Origin');
  const reqUrl = new URL(request.url);
  if (!origin) return {};
  if (origin === reqUrl.origin || (allowedOrigin && origin === allowedOrigin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      Vary: 'Origin',
    };
  }
  return {};
}
