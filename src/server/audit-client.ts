import { readFile } from "node:fs/promises";

import type { FastifyBaseLogger } from "fastify";

import type { EnvConfig } from "./config.js";

export type InventoryAuditEvent = {
  event_type: "inventory.item.created" | "inventory.item.updated" | "inventory.item.deleted";
  action: string;
  outcome: "success" | "failure";
  severity?: "info" | "warning" | "error";
  resource_id: string;
  message: string;
  metadata?: Record<string, unknown>;
  correlation_id?: string;
};

export async function appendInventoryAudit(config: EnvConfig, logger: FastifyBaseLogger, event: InventoryAuditEvent) {
  try {
    const token = (await readFile(config.HC_CORE_APP_TOKEN_FILE, "utf8")).trim();
    const response = await fetch(`${config.HC_CORE_API_URL.replace(/\/$/, "")}/audit/events`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ ...event, category: "inventory", scope: "tenant", visibility: "tenant_admin", resource_type: "inventory_item", severity: event.severity ?? "info" }),
    });
    if (!response.ok) throw new Error(`Core audit API returned ${response.status}`);
  } catch (error) {
    logger.error({ err: error, event_type: event.event_type, resource_id: event.resource_id }, "Inventory audit append failed");
  }
}
