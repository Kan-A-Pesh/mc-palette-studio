/* eslint-disable no-undef, turbo/no-undeclared-env-vars */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const isCI =
  process.env.CI ||
  process.env.VERCEL ||
  process.env.NETLIFY ||
  process.env.RAILWAY_ENVIRONMENT ||
  process.env.RENDER ||
  process.env.FLY_APP_NAME ||
  process.env.HEROKU ||
  process.env.AWS_EXECUTION_ENV ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.AZURE_FUNCTIONS_ENVIRONMENT;

if (isCI) {
  console.log("○ Skipping env symlinks (CI/deployment detected)");
  process.exit(0);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, "..");
const appsDir = path.join(monorepoRoot, "apps");

const appDirectories = fs
  .readdirSync(appsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

const envFiles = [".env", ".env.local"];

for (const appName of appDirectories) {
  const targetDir = path.join(appsDir, appName);

  for (const file of envFiles) {
    const relativePath = path.join("..", "..", file);
    const target = path.join(targetDir, file);

    try {
      fs.unlinkSync(target);
    } catch {
      // Ignore if doesn't exist
    }

    try {
      fs.symlinkSync(relativePath, target, "file");
      console.log(`✓ [apps/${appName}] Linked ${file} → ${relativePath}`);
    } catch (err) {
      if (err.code === "EPERM") {
        console.warn(`⚠ [apps/${appName}] ${file}: symlinks require admin on Windows`);
      } else {
        console.warn(`⚠ [apps/${appName}] Could not link ${file}:`, err.message);
      }
    }
  }
}

