import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as dotenvConfig } from "dotenv";

let hasLoadedEnv = false;

function findWorkspaceRoot(startDir: string): string | null {
  let currentDir = path.resolve(startDir);

  while (true) {
    if (existsSync(path.join(currentDir, "turbo.json"))) {
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      return null;
    }

    currentDir = parentDir;
  }
}

function resolveRootEnvPath(): string | null {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [process.cwd(), moduleDir];

  for (const candidate of candidates) {
    const root = findWorkspaceRoot(candidate);
    if (!root) {
      continue;
    }

    const envPath = path.join(root, ".env");
    if (existsSync(envPath)) {
      return envPath;
    }
  }

  return null;
}

export function loadRootEnv(): void {
  if (hasLoadedEnv) {
    return;
  }

  hasLoadedEnv = true;

  const envPath = resolveRootEnvPath();
  if (envPath) {
    dotenvConfig({ path: envPath });
    return;
  }

  dotenvConfig();
}
