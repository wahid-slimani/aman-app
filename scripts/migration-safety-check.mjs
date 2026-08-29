/* eslint-disable no-console */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const migrationsPath = join(root, "prisma", "migrations", "migration_lock.toml");

if (!existsSync(migrationsPath)) {
  console.error("migration_lock.toml is missing");
  process.exit(1);
}

const content = readFileSync(migrationsPath, "utf8");
if (!content.includes("provider = \"postgresql\"")) {
  console.error("migration provider mismatch. expected postgresql");
  process.exit(1);
}

console.log("migration safety check passed");
