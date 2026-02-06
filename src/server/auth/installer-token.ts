import { jwtVerify } from "jose";

import type { EnvConfig } from "../config.js";

type InstallerClaims = {
  app_id?: string;
  slug?: string;
  purpose?: string;
};

export async function verifyInstallerToken(token: string, config: EnvConfig): Promise<void> {
  const secret = new TextEncoder().encode(config.INSTALLER_TOKEN_SECRET);
  const { payload } = await jwtVerify(token, secret, {
    issuer: config.INSTALLER_TOKEN_ISSUER,
  });

  const claims = payload as InstallerClaims;
  if (claims.purpose !== "ui-artifact-fetch") {
    throw new Error("invalid installer token purpose");
  }
  if (claims.app_id !== "com.talpaversum.inventory") {
    throw new Error("invalid installer token app_id");
  }
  if (claims.slug !== "inventory") {
    throw new Error("invalid installer token slug");
  }
}
