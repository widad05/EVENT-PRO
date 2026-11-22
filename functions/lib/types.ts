export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(colName?: string): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[]; success: boolean }>;
  run(): Promise<{ success: boolean; meta: { last_row_id?: number; changes?: number } }>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<T[]>;
}

export interface R2ObjectBody {
  body: ReadableStream | ArrayBuffer | Uint8Array;
  httpMetadata?: {
    contentType?: string;
    cacheControl?: string;
  };
}

export interface R2Bucket {
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView | ReadableStream | string,
    options?: { httpMetadata?: { contentType?: string; cacheControl?: string } }
  ): Promise<unknown>;
  get(key: string): Promise<R2ObjectBody | null>;
  delete(key: string): Promise<void>;
}

export interface Env {
  DB: D1Database;
  MEDIA_BUCKET?: R2Bucket;
  TURNSTILE_SECRET_KEY?: string;
  ADMIN_PASSCODE?: string;
  ALLOWED_ORIGIN?: string;
  APP_ENV?: string;
}

export interface AuthSession {
  userId: number;
  email: string;
  fullName: string;
  role: 'client' | 'admin' | 'manager';
}
