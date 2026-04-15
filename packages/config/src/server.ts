import { loadRootEnv } from "./load-env";
import { serverConfigSchema } from "./schema";

loadRootEnv();

function loadServerConfig() {
  const result = serverConfigSchema.safeParse(process.env);

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Config validation failed:\n${issues}`);
  }

  return result.data;
}

export const config = loadServerConfig();
export const env = config;
