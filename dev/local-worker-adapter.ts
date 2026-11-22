import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createRequire } from 'node:module';
import type { D1Database, D1PreparedStatement, Env, R2Bucket } from '../functions/lib/types.ts';
import { onRequest } from '../functions/api/[[route]].ts';

const require = createRequire(import.meta.url);

interface SQLiteStatement {
  get(...params: unknown[]): unknown;
  all(...params: unknown[]): unknown[];
  run(...params: unknown[]): { lastInsertRowid?: number | bigint; changes?: number };
}

interface SQLiteDatabase {
  exec(sql: string): void;
  prepare(sql: string): SQLiteStatement;
}

function createLocalD1(dbPath: string, migrationsDir: string): D1Database {
  const { DatabaseSync } = require('node:sqlite') as {
    DatabaseSync: new (filePath: string) => SQLiteDatabase;
  };
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const sqlite = new DatabaseSync(dbPath);
  sqlite.exec('PRAGMA foreign_keys = ON;');

  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of migrationFiles) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    sqlite.exec(sql);
  }

  class LocalStatement implements D1PreparedStatement {
    private sql: string;
    private params: unknown[] = [];

    constructor(sql: string) {
      this.sql = sql;
    }

    bind(...values: unknown[]): D1PreparedStatement {
      this.params = values.map((v) => (v === undefined ? null : v));
      return this;
    }

    async first<T = Record<string, unknown>>(colName?: string): Promise<T | null> {
      const stmt = sqlite.prepare(this.sql);
      const row = stmt.get(...this.params) as Record<string, unknown> | undefined;
      if (!row) return null;
      if (colName) return (row[colName] as T) ?? null;
      return row as T;
    }

    async all<T = Record<string, unknown>>(): Promise<{ results: T[]; success: boolean }> {
      const stmt = sqlite.prepare(this.sql);
      const results = stmt.all(...this.params) as T[];
      return { results, success: true };
    }

    async run(): Promise<{ success: boolean; meta: { last_row_id?: number; changes?: number } }> {
      const stmt = sqlite.prepare(this.sql);
      const res = stmt.run(...this.params);
      return {
        success: true,
        meta: {
          last_row_id: res.lastInsertRowid ? Number(res.lastInsertRowid) : undefined,
          changes: res.changes ?? 0,
        },
      };
    }
  }

  return {
    prepare(query: string): D1PreparedStatement {
      return new LocalStatement(query);
    },
    async batch<T = unknown>(statements: D1PreparedStatement[]): Promise<T[]> {
      const results: T[] = [];
      for (const s of statements) {
        results.push((await s.run()) as T);
      }
      return results;
    },
  };
}

function createLocalR2(baseDir: string): R2Bucket {
  fs.mkdirSync(baseDir, { recursive: true });
  return {
    async put(key, value, options) {
      const resolved = path.resolve(baseDir, key);
      if (!resolved.startsWith(path.resolve(baseDir) + path.sep)) {
        throw new Error('Invalid R2 key');
      }
      fs.mkdirSync(path.dirname(resolved), { recursive: true });
      const buf =
        value instanceof ArrayBuffer
          ? Buffer.from(value)
          : ArrayBuffer.isView(value)
            ? Buffer.from(value.buffer, value.byteOffset, value.byteLength)
            : Buffer.from(String(value));
      fs.writeFileSync(resolved, buf);
      if (options?.httpMetadata?.contentType) {
        fs.writeFileSync(`${resolved}.meta.json`, JSON.stringify(options.httpMetadata));
      }
      return { key };
    },
    async get(key) {
      const resolved = path.resolve(baseDir, key);
      if (!resolved.startsWith(path.resolve(baseDir) + path.sep) || !fs.existsSync(resolved)) {
        return null;
      }
      const data = fs.readFileSync(resolved);
      let httpMetadata: { contentType?: string; cacheControl?: string } | undefined;
      if (fs.existsSync(`${resolved}.meta.json`)) {
        httpMetadata = JSON.parse(fs.readFileSync(`${resolved}.meta.json`, 'utf-8'));
      }
      return {
        body: new Uint8Array(data),
        httpMetadata,
      };
    },
    async delete(key) {
      const resolved = path.resolve(baseDir, key);
      if (resolved.startsWith(path.resolve(baseDir) + path.sep) && fs.existsSync(resolved)) {
        fs.unlinkSync(resolved);
      }
    },
  };
}

let cachedEnv: Env | null = null;

function getLocalEnv(rootDir: string): Env {
  if (cachedEnv) return cachedEnv;
  const dbPath = path.resolve(rootDir, '.local-dev/eventpro.sqlite');
  const migrationsDir = path.resolve(rootDir, 'migrations');
  const r2Dir = path.resolve(rootDir, '.local-dev/r2');

  cachedEnv = {
    DB: createLocalD1(dbPath, migrationsDir),
    MEDIA_BUCKET: createLocalR2(r2Dir),
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY || '',
    ADMIN_PASSCODE: process.env.ADMIN_PASSCODE || '',
    ALLOWED_ORIGIN: process.env.APP_URL || '',
    APP_ENV: 'development',
  };
  return cachedEnv;
}

export async function handleLocalApiRequest(
  req: IncomingMessage,
  res: ServerResponse,
  rootDir: string
): Promise<void> {
  const host = req.headers.host || 'localhost:3000';
  const url = `http://${host}${req.url || '/'}`;

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const bodyBuffer = Buffer.concat(chunks);

  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (typeof v === 'string') headers.set(k, v);
    else if (Array.isArray(v)) headers.set(k, v.join(', '));
  }

  const method = (req.method || 'GET').toUpperCase();
  const webRequest = new Request(url, {
    method,
    headers,
    body: method !== 'GET' && method !== 'HEAD' && bodyBuffer.length > 0 ? bodyBuffer : undefined,
  });

  const env = getLocalEnv(rootDir);
  const webResponse = await onRequest({ request: webRequest, env });

  res.statusCode = webResponse.status;
  webResponse.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  const outBuf = Buffer.from(await webResponse.arrayBuffer());
  res.end(outBuf);
}
