import { z } from 'zod';

/**
 * All runtime configuration comes from import.meta.env and is validated here.
 * Phase 0 has no required variables. Add new ones to this schema AND to
 * .env.example (name only, empty value). Never put secrets in VITE_* variables:
 * anything prefixed VITE_ is shipped to the browser.
 */
const EnvSchema = z.object({
  MODE: z.string(),
  DEV: z.boolean(),
  PROD: z.boolean(),
});

export type AppEnv = z.infer<typeof EnvSchema>;

const FORBIDDEN_CLIENT_VARS = /SERVICE_ROLE|SECRET|PRIVATE_KEY|PASSWORD/i;

export function parseEnv(raw: Record<string, unknown>): AppEnv {
  const leaked = Object.keys(raw).filter((key) => key.startsWith('VITE_') && FORBIDDEN_CLIENT_VARS.test(key));
  if (leaked.length > 0) {
    throw new Error(`Refusing to start: secret-looking variables exposed to the client: ${leaked.join(', ')}`);
  }
  const result = EnvSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Invalid environment configuration:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export const env: AppEnv = parseEnv(import.meta.env);
