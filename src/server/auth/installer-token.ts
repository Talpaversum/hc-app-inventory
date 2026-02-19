import { jwtVerify } from "jose";

import type { EnvConfig } from "../config.js";

type InstallerClaims = {
  app_id?: string;
  slug?: string;
  purpose?: string;
};

const INVENTORY_APP_ID = "talpaversum/inventory";
const INVENTORY_SLUG = "inventory";

export async function verifyInstallerToken(token: string, config: EnvConfig): Promise<void> {
  await verifyTokenPurpose(token, config, "ui-artifact-fetch");
}

export async function verifyInstallationCompleteToken(token: string, config: EnvConfig): Promise<void> {
  await verifyTokenPurpose(token, config, "installation-complete");
}

async function verifyTokenPurpose(token: string, config: EnvConfig, expectedPurpose: string): Promise<void> {
  const secret = new TextEncoder().encode(config.INSTALLER_TOKEN_SECRET);
  const { payload } = await jwtVerify(token, secret, {
    issuer: config.INSTALLER_TOKEN_ISSUER,
  });

  const claims = payload as InstallerClaims;
  if (claims.purpose !== expectedPurpose) {
    throw new Error("invalid installer token purpose");
  }
  if (claims.app_id !== INVENTORY_APP_ID) {
    throw new Error("invalid installer token app_id");
  }
  if (claims.slug !== INVENTORY_SLUG) {
    throw new Error("invalid installer token slug");
  }
}
