import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// `prepare: false`               — required for Supabase Supavisor Transaction pooler (port 6543),
//                                  which doesn't support the extended query protocol.
// `ssl: { rejectUnauthorized: false }` — Supabase pooler requires TLS; disabling cert
//                                  verification avoids self-signed cert rejections in Node.js.
// `max: 1`                       — keeps the pool small for serverless / edge environments.
const client = postgres(process.env.DATABASE_URL!, {
  max: 1,
  prepare: false,
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(client, { schema });
