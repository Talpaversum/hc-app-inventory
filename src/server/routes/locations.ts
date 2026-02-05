import type { FastifyInstance } from "fastify";

import { getPool } from "../db/pool.js";
import { requireAppContext } from "../middleware/context.js";

export async function registerLocationRoutes(app: FastifyInstance) {
  app.get("/v1/locations", async (request, reply) => {
    const { tenantId } = requireAppContext(request);
    const pool = getPool();
    const result = await pool.query(
      "select l.id, l.parent_id, l.name, lk.key as kind_key, lk.label as kind_label from inventory.locations l join inventory.location_kinds lk on lk.id = l.kind_id where l.tenant_id = $1 order by lk.sort_order, l.name",
      [tenantId],
    );
    return reply.send({ items: result.rows });
  });

  app.post("/v1/locations", async (request, reply) => {
    const { tenantId } = requireAppContext(request);
    const body = request.body as { name: string; kind_key: string; parent_id?: string | null };
    const pool = getPool();
    const kind = await pool.query(
      "select id from inventory.location_kinds where tenant_id = $1 and key = $2",
      [tenantId, body.kind_key],
    );
    if (kind.rowCount === 0) {
      return reply.code(400).send({ message: "Unknown kind" });
    }
    const result = await pool.query(
      "insert into inventory.locations (tenant_id, kind_id, name, parent_id) values ($1, $2, $3, $4) returning id",
      [tenantId, kind.rows[0].id, body.name, body.parent_id ?? null],
    );
    return reply.code(201).send({ id: result.rows[0].id });
  });

  app.get("/v1/location-kinds", async (request, reply) => {
    const { tenantId } = requireAppContext(request);
    const pool = getPool();
    const result = await pool.query(
      "select id, key, label, is_builtin from inventory.location_kinds where tenant_id = $1 order by sort_order",
      [tenantId],
    );
    return reply.send({ items: result.rows });
  });

  app.post("/v1/location-kinds", async (request, reply) => {
    const { tenantId } = requireAppContext(request);
    const body = request.body as { key: string; label: string };
    const pool = getPool();
    const result = await pool.query(
      "insert into inventory.location_kinds (tenant_id, key, label, sort_order, is_builtin) values ($1, $2, $3, 100, false) returning id",
      [tenantId, body.key, body.label],
    );
    return reply.code(201).send({ id: result.rows[0].id });
  });
}
