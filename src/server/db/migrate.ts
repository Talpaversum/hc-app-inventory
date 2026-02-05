import { readFile } from "node:fs/promises";
import path from "node:path";

import { getPool } from "./pool.js";

async function run() {
  const pool = getPool();
  const migrationsDir = path.resolve(process.cwd(), "migrations");
  const indexFile = await readFile(path.join(migrationsDir, "index.txt"), "utf-8");
  const migrations = indexFile.split("\n").map((line) => line.trim()).filter(Boolean);

  for (const filename of migrations) {
    const sql = await readFile(path.join(migrationsDir, filename), "utf-8");
    await pool.query(sql);
    console.log(`[inventory] Applied migration ${filename}`);
  }

  await pool.end();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
