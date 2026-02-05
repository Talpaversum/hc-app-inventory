import type { FastifyInstance } from "fastify";

import { getPool } from "../db/pool.js";
import { requireAppContext } from "../middleware/context.js";

export async function registerAttributeTypeRoutes(app: FastifyInstance) {
  app.get("/v1/attribute-types", async (request, reply) => {
    const { tenantId } = requireAppContext(request);
    const pool = getPool();
    const result = await pool.query(
      "select id, key, label, data_type, is_builtin, validation_regex, unique_scope from inventory.attribute_types where tenant_id = $1 order by created_at",
      [tenantId],
    );
    return reply.send({ items: result.rows });
  });

  app.post("/v1/attribute-types", async (request, reply) => {
    const { tenantId } = requireAppContext(request);
    const body = request.body as {
      key: string;
      label: string;
      data_type: string;
      validation_regex?: string | null;
      unique_scope?: string | null;
    };
    const pool = getPool();
    const result = await pool.query(
      "insert into inventory.attribute_types (tenant_id, key, label, data_type, validation_regex, unique_scope, is_builtin) values ($1, $2, $3, $4, $5, $6, false) returning id",
      [tenantId, body.key, body.label, body.data_type, body.validation_regex ?? null, body.unique_scope ?? "none"],
    );
    return reply.code(201).send({ id: result.rows[0].id });
  });
}
