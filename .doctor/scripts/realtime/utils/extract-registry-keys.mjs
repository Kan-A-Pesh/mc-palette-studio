import { readFileSync } from "node:fs";

const registryPath = process.argv[2];
const section = process.argv[3];

if (!registryPath || !section) {
  process.stderr.write(
    "usage: extract-registry-keys.mjs <registry.ts> <client|server>\n",
  );
  process.exit(2);
}

const source = readFileSync(registryPath, "utf8");
const inlineEmptyPattern = new RegExp(`${section}\\s*:\\s*\\{\\s*\\}`, "m");

if (inlineEmptyPattern.test(source)) {
  process.exit(0);
}

const sectionPattern = new RegExp(
  `${section}\\s*:\\s*\\{([\\s\\S]*?)\\n\\s*\\}(?:,|\\s*\\n\\s*\\})`,
  "m",
);
const sectionMatch = source.match(sectionPattern);

if (!sectionMatch) {
  process.exit(0);
}

const sectionBody = sectionMatch[1];
const eventPattern = /"([^"]+)":/g;
const eventNames = new Set();

for (const match of sectionBody.matchAll(eventPattern)) {
  eventNames.add(match[1]);
}

for (const eventName of [...eventNames].sort()) {
  process.stdout.write(`${eventName}\n`);
}
