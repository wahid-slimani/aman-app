/* eslint-disable no-console */

import { existsSync } from "node:fs";
import { join } from "node:path";

const requiredFiles = [
  ".github/verification/phase-05-verification.md",
  ".github/phases/phase-05-task-tracker.md",
  "src/proxy.ts",
  "src/lib/security/policy.ts"
];

const missing = requiredFiles.filter((path) => !existsSync(join(process.cwd(), path)));
if (missing.length > 0) {
  console.error("release hardening check failed. missing files:");
  for (const item of missing) {
    console.error(`- ${item}`);
  }
  process.exit(1);
}

console.log("release hardening check passed");
