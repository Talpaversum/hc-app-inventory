import type { FastifyRequest } from "fastify";

export type AppContext = {
  tenantId: string;
  actorId: string;
  actorEffectiveId: string;
};

export function requireAppContext(request: FastifyRequest): AppContext {
  const tenantId = request.headers["x-tenant-id"] as string | undefined;
  const actorId = request.headers["x-actor-id"] as string | undefined;
  const actorEffectiveId = request.headers["x-actor-effective-id"] as string | undefined;

  if (!tenantId || !actorId || !actorEffectiveId) {
    throw new Error("Missing app context headers");
  }

  return { tenantId, actorId, actorEffectiveId };
}
