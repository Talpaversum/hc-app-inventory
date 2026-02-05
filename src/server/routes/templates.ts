import type { FastifyInstance } from "fastify";

import { getPool } from "../db/pool.js";
import { requireAppContext } from "../middleware/context.js";

export async function registerTemplateRoutes(app: FastifyInstance) {
  app.get("/v1/templates", async (request, reply) => {
    const { tenantId } = requireAppContext(request);
    const pool = getPool();
    const result = await pool.query(
      "select id, name, visibility_scope, visibility_ref_id, is_locked from inventory.templates where tenant_id = $1 order by created_at",
      [tenantId],
    );
    return reply.send({ items: result.rows });
  });

  app.post("/v1/templates", async (request, reply) => {
    const { tenantId } = requireAppContext(request);
    const body = request.body as {
      name: string;
      visibility_scope: string;
      visibility_ref_id?: string | null;
      fields: Array<{ attribute_type_id: string; required: boolean; sort_order: number }>;
    };
    const pool = getPool();
    const result = await pool.query(
      "insert into inventory.templates (tenant_id, name, visibility_scope, visibility_ref_id, is_locked) values ($1, $2, $3, $4, false) returning id",
      [tenantId, body.name, body.visibility_scope, body.visibility_ref_id ?? null],
    );
    const templateId = result.rows[0].id as string;

    for (const field of body.fields ?? []) {
      await pool.query(
        "insert into inventory.template_fields (template_id, attribute_type_id, required, sort_order) values ($1, $2, $3, $4)",
        [templateId, field.attribute_type_id, field.required, field.sort_order],
      );
    }

    return reply.code(201).send({ id: templateId });
  });

  app.get("/v1/templates/:templateId/fields", async (request, reply) => {
    const { tenantId } = requireAppContext(request);
    const templateId = request.params.templateId as string;
    const pool = getPool();
    const result = await pool.query(
      "select tf.attribute_type_id, tf.required from inventory.template_fields tf join inventory.templates t on t.id = tf.template_id where tf.template_id = $1 and t.tenant_id = $2 order by tf.sort_order",
      [templateId, tenantId],
    );
    return reply.send({ items: result.rows });
  });
}
