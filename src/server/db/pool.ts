import { Pool } from "pg";

import { loadConfig } from "../config.js";
import { deriveAppSchemaName } from "./schema.js";

let pool: Pool | null = null;

export function getPool() {
  if (!pool) {
    const config = loadConfig();
    const schemaName = deriveAppSchemaName("com.talpaversum.inventory");
    pool = new Pool({
      connectionString: config.DATABASE_URL,
      options: `-c search_path=${schemaName}`,
    });
  }
  return pool;
}
