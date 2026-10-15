#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const validTypes = new Set(["major", "minor", "patch"]);

function parseArgs() {
  const entries = process.argv.slice(2);
  for (const arg of entries) {
    if (arg.startsWith("--release-type=")) {
      return arg.split("=")[1];
    }
  }

  const flagIndex = entries.indexOf("--release-type");
  if (flagIndex !== -1 && entries[flagIndex + 1]) {
    return entries[flagIndex + 1];
  }

  return "";
}

function incrementVersion(currentVersion, releaseType) {
  const versionParts = currentVersion.split(".").map((part) => Number(part));
  if (versionParts.length !== 3 || versionParts.some((value) => Number.isNaN(value))) {
    throw new Error(`Invalid version ${currentVersion}`);
  }

  if (releaseType === "major") {
    versionParts[0] += 1;
    versionParts[1] = 0;
    versionParts[2] = 0;
    return versionParts.join(".");
  }

  if (releaseType === "minor") {
    versionParts[1] += 1;
    versionParts[2] = 0;
    return versionParts.join(".");
  }

  versionParts[2] += 1;
  return versionParts.join(".");
}

function updateRootPackage(newVersion) {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const rootPath = path.resolve(currentDir, "../../package.json");
  const packageJson = JSON.parse(readFileSync(rootPath, "utf8"));
  packageJson.version = newVersion;
  writeFileSync(rootPath, JSON.stringify(packageJson, null, 2) + "\n");
}

const releaseType = parseArgs();
if (!validTypes.has(releaseType)) {
  throw new Error(`Release type must be one of ${Array.from(validTypes).join(", ")}`);
}

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const rootPackagePath = path.resolve(currentDir, "../../package.json");
const packageJson = JSON.parse(readFileSync(rootPackagePath, "utf8"));
const currentVersion = packageJson.version ?? "0.0.0";
const nextVersion = incrementVersion(currentVersion, releaseType);
updateRootPackage(nextVersion);
console.log(nextVersion);

