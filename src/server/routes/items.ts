import type { FastifyInstance } from "fastify";

import { getPool } from "../db/pool.js";
import { requireAppContext } from "../middleware/context.js";

export async function registerItemRoutes(app: FastifyInstance) {
  app.get("/v1/items", async (request, reply) => {
    const { tenantId } = requireAppContext(request);
    const pool = getPool();
    const result = await pool.query(
      "select id, name, inventory_number from items where tenant_id = $1 order by created_at desc",
      [tenantId],
    );
    return reply.send({ items: result.rows });
  });

  app.post("/v1/items", async (request, reply) => {
    const { tenantId } = requireAppContext(request);
    const body = request.body as {
      name: string;
      inventory_number?: string | null;
      template_id?: string | null;
      location_id?: string | null;
      owner?: { type: string; id: string } | null;
      manager?: { type: string; id: string } | null;
      attributes?: Array<{ attribute_type_id: string; value_string?: string; value_number?: number; value_date?: string }>;
    };
    const pool = getPool();
    const result = await pool.query(
      "insert into items (tenant_id, name, inventory_number, template_id, location_id, owner_type, owner_id, manager_type, manager_id, registered_at) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, now()) returning id",
      [
        tenantId,
        body.name,
        body.inventory_number ?? null,
        body.template_id ?? null,
        body.location_id ?? null,
        body.owner?.type ?? null,
        body.owner?.id ?? null,
        body.manager?.type ?? null,
        body.manager?.id ?? null,
      ],
    );
    const itemId = result.rows[0].id as string;

    for (const attr of body.attributes ?? []) {
      await pool.query(
        "insert into item_attributes (item_id, attribute_type_id, value_string, value_number, value_date) values ($1, $2, $3, $4, $5)",
        [itemId, attr.attribute_type_id, attr.value_string ?? null, attr.value_number ?? null, attr.value_date ?? null],
      );
    }

    return reply.code(201).send({ id: itemId });
  });
}
