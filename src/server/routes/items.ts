import type { FastifyInstance } from "fastify";

import { getPool } from "../db/pool.js";
import { requireAppContext } from "../middleware/context.js";
import { appendInventoryAudit } from "../audit-client.js";
import type { EnvConfig } from "../config.js";

export async function registerItemRoutes(app: FastifyInstance, config: EnvConfig) {
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

    void appendInventoryAudit(config, request.log, { event_type: "inventory.item.created", action: "inventory.item.create", outcome: "success", resource_id: itemId, message: "Inventory item created", metadata: { inventory_number: body.inventory_number ?? null }, correlation_id: String(request.headers["x-correlation-id"] ?? request.id) });
    return reply.code(201).send({ id: itemId });
  });

  app.patch("/v1/items/:id", async (request, reply) => {
    const { tenantId } = requireAppContext(request);
    const itemId = (request.params as { id: string }).id;
    const body = request.body as { name?: string; inventory_number?: string | null; location_id?: string | null };
    const result = await getPool().query(
      `update items set name = coalesce($3, name), inventory_number = case when $4 then $5 else inventory_number end,
       location_id = case when $6 then $7 else location_id end where tenant_id = $1 and id = $2 returning id`,
      [tenantId, itemId, body.name ?? null, Object.hasOwn(body, "inventory_number"), body.inventory_number ?? null, Object.hasOwn(body, "location_id"), body.location_id ?? null],
    );
    if (!result.rowCount) return reply.code(404).send({ message: "item not found" });
    void appendInventoryAudit(config, request.log, { event_type: "inventory.item.updated", action: "inventory.item.update", outcome: "success", resource_id: itemId, message: "Inventory item updated", metadata: { changed_fields: Object.keys(body) }, correlation_id: String(request.headers["x-correlation-id"] ?? request.id) });
    return reply.send({ id: itemId });
  });

  app.delete("/v1/items/:id", async (request, reply) => {
    const { tenantId } = requireAppContext(request);
    const itemId = (request.params as { id: string }).id;
    const result = await getPool().query("delete from items where tenant_id = $1 and id = $2", [tenantId, itemId]);
    if (!result.rowCount) return reply.code(404).send({ message: "item not found" });
    void appendInventoryAudit(config, request.log, { event_type: "inventory.item.deleted", action: "inventory.item.delete", outcome: "success", resource_id: itemId, message: "Inventory item deleted", correlation_id: String(request.headers["x-correlation-id"] ?? request.id) });
    return reply.code(204).send();
  });
}
