import { Pool } from "pg";

import { loadConfig } from "../config.js";

let pool: Pool | null = null;

export function getPool() {
  if (!pool) {
    const config = loadConfig();
    pool = new Pool({
      connectionString: config.DATABASE_URL,
    });
  }
  return pool;
}
