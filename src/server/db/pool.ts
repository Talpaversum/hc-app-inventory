import { Pool } from "pg";

import { loadConfig } from "../config.js";
import { deriveAppSchemaName } from "./schema.js";

let pool: Pool | null = null;
const INVENTORY_APP_ID = "talpaversum/inventory";

export function getPool() {
  if (!pool) {
    const config = loadConfig();
    const schemaName = deriveAppSchemaName(INVENTORY_APP_ID);
    pool = new Pool({
      connectionString: config.DATABASE_URL,
      options: `-c search_path=${schemaName}`,
    });
  }
  return pool;
}
