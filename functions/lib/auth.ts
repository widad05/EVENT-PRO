import type { AuthSession, D1Database, Env } from './types.ts';
import {
  generateOpaqueToken,
  hashPassword,
  sha256Hex,
  timingSafeEqual,
  verifyPassword,
} from './security.ts';

const SESSION_DAYS = 7;

export function extractBearerToken(request: Request): string | null {
  const auth = request.headers.get('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7).trim();
  return token.length >= 16 ? token : null;
}

export async function createSession(
  db: D1Database,
  userId: number,
  role: 'client' | 'admin' | 'manager'
): Promise<{ token: string; expiresAt: string }> {
  const token = generateOpaqueToken(32);
  const tokenHash = await sha256Hex(token);
  const expiresDate = new Date(Date.now() + SESSION_DAYS * 86400 * 1000);
  const expiresAt = expiresDate.toISOString();

  await db
    .prepare('INSERT INTO sessions (token_hash, user_id, role, expires_at) VALUES (?, ?, ?, ?)')
    .bind(tokenHash, userId, role, expiresAt)
    .run();

  return { token, expiresAt };
}

export async function getSessionFromRequest(
  request: Request,
  db: D1Database
): Promise<AuthSession | null> {
  const token = extractBearerToken(request);
  if (!token) return null;
  const tokenHash = await sha256Hex(token);

  const row = await db
    .prepare(
      `SELECT s.user_id, s.role, s.expires_at, u.email, u.full_name, u.is_active
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ?`
    )
    .bind(tokenHash)
    .first<{
      user_id: number;
      role: 'client' | 'admin' | 'manager';
      expires_at: string;
      email: string;
      full_name: string;
      is_active: number;
    }>();

  if (!row || !row.is_active) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run();
    return null;
  }

  return {
    userId: row.user_id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
  };
}

export async function revokeSession(request: Request, db: D1Database): Promise<void> {
  const token = extractBearerToken(request);
  if (!token) return;
  const tokenHash = await sha256Hex(token);
  await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run();
}

export async function getAdminSetupStatus(env: Env): Promise<{
  needsSetup: boolean;
  passcodeConfigured: boolean;
}> {
  const passcodeConfigured = Boolean(env.ADMIN_PASSCODE && env.ADMIN_PASSCODE.trim().length > 0);
  const existingAdmin = await env.DB.prepare(
    "SELECT id FROM users WHERE role IN ('admin', 'manager') AND is_active = 1 LIMIT 1"
  ).first<{ id: number }>();

  return {
    needsSetup: !passcodeConfigured && !existingAdmin,
    passcodeConfigured,
  };
}

export async function verifyAdminPasscode(
  provided: string,
  envPasscode: string
): Promise<boolean> {
  const enc = new TextEncoder();
  const a = await crypto.subtle.digest('SHA-256', enc.encode(provided));
  const b = await crypto.subtle.digest('SHA-256', enc.encode(envPasscode));
  return timingSafeEqual(new Uint8Array(a), new Uint8Array(b));
}

export async function bootstrapFirstAdmin(
  env: Env,
  params: { email: string; fullName: string; password: string }
): Promise<{ userId: number; email: string; fullName: string; token: string } | null> {
  const status = await getAdminSetupStatus(env);
  if (!status.needsSetup) return null;

  const passwordHash = await hashPassword(params.password);
  const existingUser = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
    .bind(params.email.toLowerCase())
    .first<{ id: number }>();

  let userId: number;
  if (existingUser) {
    await env.DB.prepare(
      "UPDATE users SET password_hash = ?, full_name = ?, role = 'admin', is_active = 1, updated_at = datetime('now') WHERE id = ?"
    )
      .bind(passwordHash, params.fullName, existingUser.id)
      .run();
    userId = existingUser.id;
  } else {
    const res = await env.DB.prepare(
      "INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, 'admin')"
    )
      .bind(params.email.toLowerCase(), passwordHash, params.fullName)
      .run();
    userId = Number(res.meta.last_row_id);
  }

  await env.DB.prepare(
    "INSERT OR IGNORE INTO admin_roles (user_id, role_name, permissions_json) VALUES (?, 'Super Administrateur', '[\"all\"]')"
  )
    .bind(userId)
    .run();

  const session = await createSession(env.DB, userId, 'admin');
  return {
    userId,
    email: params.email.toLowerCase(),
    fullName: params.fullName,
    token: session.token,
  };
}

export async function verifyUserCredentials(
  db: D1Database,
  email: string,
  password: string
): Promise<{
  id: number;
  email: string;
  full_name: string;
  role: 'client' | 'admin' | 'manager';
} | null> {
  const user = await db
    .prepare(
      'SELECT id, email, password_hash, full_name, role, is_active FROM users WHERE email = ?'
    )
    .bind(email.toLowerCase())
    .first<{
      id: number;
      email: string;
      password_hash: string;
      full_name: string;
      role: 'client' | 'admin' | 'manager';
      is_active: number;
    }>();

  if (!user || !user.is_active) return null;
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return null;
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
  };
}
