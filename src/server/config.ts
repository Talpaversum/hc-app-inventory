import dotenv from "dotenv";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(4010),
  DATABASE_URL: z.string().min(1),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function loadConfig(): EnvConfig {
  dotenv.config();
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid inventory app config: ${message}`);
  }
  return parsed.data;
}
