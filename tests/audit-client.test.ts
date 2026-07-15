import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs/promises", () => ({ readFile: vi.fn().mockResolvedValue("runtime-token\n") }));

import { appendInventoryAudit } from "../src/server/audit-client.js";

const config = { PORT: 4010, DATABASE_URL: "postgres://db", INSTALLER_TOKEN_SECRET: "1234567890123456", INSTALLER_TOKEN_ISSUER: "issuer", HC_CORE_API_URL: "http://core:3000/api/v1", HC_CORE_APP_TOKEN_FILE: "/token" };

describe("inventory audit client", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("uses the Core app token and tenant-scoped structured event", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    const logger = { error: vi.fn() };
    await appendInventoryAudit(config, logger as never, { event_type: "inventory.item.created", action: "inventory.item.create", outcome: "success", resource_id: "item-1", message: "Inventory item created" });
    expect(fetchMock).toHaveBeenCalledWith("http://core:3000/api/v1/audit/events", expect.objectContaining({ headers: expect.objectContaining({ authorization: "Bearer runtime-token" }) }));
    expect(JSON.parse(String((fetchMock.mock.calls[0][1] as RequestInit).body))).toMatchObject({ scope: "tenant", visibility: "tenant_admin", resource_type: "inventory_item" });
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("logs a technical error without failing the business operation", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    const logger = { error: vi.fn() };
    await expect(appendInventoryAudit(config, logger as never, { event_type: "inventory.item.deleted", action: "inventory.item.delete", outcome: "success", resource_id: "item-1", message: "Inventory item deleted" })).resolves.toBeUndefined();
    expect(logger.error).toHaveBeenCalledOnce();
  });
});
