#!/usr/bin/env node

import { execSync, spawnSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { createInterface } from "readline";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, "..");

const SECRETS = [
  {
    name: "RAILWAY_TOKEN",
    description: "Railway API token",
    envKey: "RAILWAY_TOKEN",
    prompt: true,
    help: "Get from https://railway.app/account/tokens",
  },
  {
    name: "RAILWAY_PROJECT_ID",
    description: "Railway project ID",
    envKey: "RAILWAY_PROJECT_ID",
    prompt: true,
    help: "Get from Railway project settings",
  },
  {
    name: "RAILWAY_SERVICE_ID",
    description: "Railway realtime service ID",
    envKey: "RAILWAY_SERVICE_ID",
    prompt: true,
    help: "Get from Railway service settings",
  },
  {
    name: "VERCEL_TOKEN",
    description: "Vercel API token",
    envKey: "VERCEL_TOKEN",
    prompt: true,
    help: "Get from https://vercel.com/account/tokens",
  },
  {
    name: "VERCEL_ORG_ID",
    description: "Vercel organization/team ID",
    source: "vercel",
    key: "orgId",
  },
  {
    name: "VERCEL_PROJECT_ID",
    description: "Vercel project ID",
    source: "vercel",
    key: "projectId",
  },
];

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function checkGitHubCLI() {
  try {
    execSync("gh --version", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function checkGitHubAuth() {
  try {
    execSync("gh auth status", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function getRepoInfo() {
  try {
    const remote = execSync("git remote get-url origin", {
      encoding: "utf-8",
    }).trim();

    const match = remote.match(/github\.com[:/](.+?)(?:\.git)?$/);
    if (match) {
      return match[1];
    }
  } catch {}
  return null;
}

function getExistingSecrets(repo) {
  try {
    const output = execSync(`gh secret list --repo ${repo} --json name`, {
      encoding: "utf-8",
    });
    const secrets = JSON.parse(output);
    return secrets.map((s) => s.name);
  } catch {
    return [];
  }
}

function setSecret(repo, name, value) {
  try {
    const result = spawnSync("gh", ["secret", "set", name, "--repo", repo], {
      input: value,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });

    if (result.status !== 0) {
      throw new Error(result.stderr || "Failed to set secret");
    }
    return true;
  } catch (error) {
    console.error(`  ✗ Failed to set ${name}: ${error.message}`);
    return false;
  }
}

function loadEnvFile() {
  const envPath = resolve(ROOT_DIR, ".env");
  if (!existsSync(envPath)) {
    return {};
  }

  const content = readFileSync(envPath, "utf-8");
  const env = {};

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      env[match[1].trim()] = value;
    }
  }

  return env;
}

function loadVercelConfig() {
  const vercelPath = resolve(ROOT_DIR, ".vercel", "project.json");
  if (!existsSync(vercelPath)) {
    return null;
  }

  try {
    const content = readFileSync(vercelPath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function main() {
  console.log("\n🔧 GitHub Secrets Setup\n");

  if (!checkGitHubCLI()) {
    console.error("✗ GitHub CLI (gh) is not installed.");
    console.error("  Install from: https://cli.github.com/");
    process.exit(1);
  }

  if (!checkGitHubAuth()) {
    console.error("✗ GitHub CLI is not authenticated.");
    console.error("  Run: gh auth login");
    process.exit(1);
  }

  const repo = getRepoInfo();
  if (!repo) {
    console.error("✗ Could not determine GitHub repository from git remote.");
    process.exit(1);
  }

  console.log(`Repository: ${repo}\n`);

  const existingSecrets = getExistingSecrets(repo);
  const envFile = loadEnvFile();
  const vercelConfig = loadVercelConfig();

  if (vercelConfig) {
    console.log("✓ Found .vercel/project.json\n");
  } else {
    console.log("⚠ No .vercel/project.json found. Run 'vercel link' first.\n");
  }

  let updated = 0;
  let skipped = 0;

  for (const secret of SECRETS) {
    console.log(`\n${secret.name}`);
    console.log(`  ${secret.description}`);

    let value = null;

    if (secret.source === "vercel" && vercelConfig) {
      value = vercelConfig[secret.key];
      if (value) {
        console.log(`  Source: .vercel/project.json`);
      }
    } else if (secret.envKey && envFile[secret.envKey]) {
      value = envFile[secret.envKey];
      console.log(`  Source: .env file`);
    }

    const alreadySet = existingSecrets.includes(secret.name);

    if (alreadySet) {
      console.log(`  Status: Already set in GitHub`);

      if (value) {
        const override = await question(
          `  Override with new value? (y/N): `,
        );
        if (override.toLowerCase() !== "y") {
          console.log(`  ⏭ Skipped`);
          skipped++;
          continue;
        }
      } else if (secret.prompt) {
        const override = await question(`  Override? (y/N): `);
        if (override.toLowerCase() !== "y") {
          console.log(`  ⏭ Skipped`);
          skipped++;
          continue;
        }
      } else {
        console.log(`  ⏭ Skipped (no new value available)`);
        skipped++;
        continue;
      }
    }

    if (!value && secret.prompt) {
      if (secret.help) {
        console.log(`  Help: ${secret.help}`);
      }
      value = await question(`  Enter value: `);
      if (!value.trim()) {
        console.log(`  ⏭ Skipped (no value provided)`);
        skipped++;
        continue;
      }
      value = value.trim();
    }

    if (!value) {
      console.log(`  ⏭ Skipped (no value available)`);
      skipped++;
      continue;
    }

    if (setSecret(repo, secret.name, value)) {
      console.log(`  ✓ Set successfully`);
      updated++;
    }
  }

  console.log(`\n${"─".repeat(50)}`);
  console.log(`\n✅ Setup complete!`);
  console.log(`   Secrets updated: ${updated}`);
  console.log(`   Secrets skipped: ${skipped}\n`);

  if (!vercelConfig) {
    console.log("⚠ Remember to run 'vercel link' and re-run this script");
    console.log("  to set VERCEL_ORG_ID and VERCEL_PROJECT_ID.\n");
  }

  rl.close();
}

main().catch((error) => {
  console.error("Error:", error.message);
  rl.close();
  process.exit(1);
});

