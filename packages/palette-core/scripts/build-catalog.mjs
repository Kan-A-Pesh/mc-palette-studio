// Builds src/data/blocks.json from the public misode/mcmeta mirror, for the
// latest Java release. Only derived metadata (ids, texture paths, colour
// statistics, the release each block shipped in) is written; the textures
// themselves are never stored in the repository.
import { writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const MCMETA = "https://raw.githubusercontent.com/misode/mcmeta";
// 1.14 is the oldest release mcmeta publishes summaries and assets for.
const OLDEST_DATA_VERSION = 1952;
const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../src/data/blocks.json",
);

// Technical or creative-only blocks that make no sense in a build palette.
const EXCLUDED = new Set([
  "barrier",
  "structure_void",
  "structure_block",
  "jigsaw",
  "command_block",
  "chain_command_block",
  "repeating_command_block",
  "light",
  "test_block",
  "test_instance_block",
  "budding_amethyst",
  "spawner",
  "trial_spawner",
  "vault",
  "petrified_oak_slab",
]);

// Default biome tints (plains) for faces that carry a tintindex.
const TINTS = {
  grass_block: "#91bd59",
  birch_leaves: "#80a755",
  spruce_leaves: "#619961",
  default_foliage: "#77ab2f",
};

// Blocks registered during an experiment (behind a feature flag, off by
// default) only become available in survival with the release that ships it.
// The registry has no flag information, so the windows are listed here.
const EXPERIMENTS = [
  { from: "1.19.3", until: "1.20" }, // update_1_20: bamboo, cherry
  { from: "1.20.3", until: "1.21" }, // update_1_21: tuff, copper bulbs, crafter
  { from: "1.21.2", until: "1.21.4" }, // winter_drop: pale garden
];

async function fetchMcmeta(ref, path) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`${MCMETA}/${ref}/${path}`);
    if (res.status === 404) return null;
    if (res.ok) return res;
    await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
  }
  throw new Error(`Failed to fetch ${ref}/${path}`);
}

async function fetchMcmetaJson(ref, path) {
  const res = await fetchMcmeta(ref, path);
  return res && res.json();
}

/** Java releases from 1.14 on, oldest first. */
async function fetchReleases() {
  const versions = await fetchMcmetaJson("summary", "versions/data.json");
  return versions
    .filter(
      (v) => v.type === "release" && v.data_version >= OLDEST_DATA_VERSION,
    )
    .sort((a, b) => a.data_version - b.data_version)
    .map((v) => ({ id: v.id, dataVersion: v.data_version }));
}

/** Every block id registered in a release. */
async function fetchRegistry(version) {
  const registries = await fetchMcmetaJson(
    `${version}-summary`,
    "registries/data.min.json",
  );
  if (!registries?.block) throw new Error(`No block registry for ${version}`);
  return new Set(registries.block);
}

/** First release of each block; a block may never disappear afterwards. */
function firstReleases(ids, releases, registries) {
  const order = new Map(releases.map((r, i) => [r.id, i]));
  const since = new Map();
  for (const id of ids) {
    const index = releases.findIndex((r) => registries.get(r.id).has(id));
    const gap = releases
      .slice(index)
      .find((r) => !registries.get(r.id).has(id));
    if (gap) throw new Error(`${id} is missing from ${gap.id}`);
    const experiment = EXPERIMENTS.find(
      (e) => index >= order.get(e.from) && index < order.get(e.until),
    );
    since.set(id, experiment ? experiment.until : releases[index].id);
  }
  return since;
}

const releases = await fetchReleases();
const MC_VERSION = releases.at(-1).id;
const ASSETS = `${MC_VERSION}-assets/assets/minecraft`;
for (const { from, until } of EXPERIMENTS) {
  if (![from, until].every((v) => releases.some((r) => r.id === v))) {
    throw new Error(`Unknown release in experiment ${from}–${until}`);
  }
}

const cache = new Map();
async function fetchJson(path) {
  if (!cache.has(path)) cache.set(path, fetchMcmetaJson(ASSETS, path));
  return cache.get(path);
}

async function fetchPng(texture) {
  const res = await fetchMcmeta(ASSETS, `textures/${texture}.png`);
  return res && PNG.sync.read(Buffer.from(await res.arrayBuffer()));
}

const stripNs = (ref) => ref.replace(/^minecraft:/, "");

function pickVariantModel(blockstate) {
  if (!blockstate?.variants) return null;
  // Prefer the upright, unrotated variant so "up" really is the top face.
  const entries = Object.values(blockstate.variants).map((v) =>
    Array.isArray(v) ? v[0] : v,
  );
  const upright = entries.find((e) => e && !e.x);
  return upright?.model ?? null;
}

async function resolveModel(modelRef) {
  const textures = {};
  let elements = null;
  let ref = modelRef;
  for (let depth = 0; ref && depth < 12; depth++) {
    const model = await fetchJson(`models/${stripNs(ref)}.json`);
    if (!model) return null;
    for (const [k, v] of Object.entries(model.textures ?? {})) {
      // 26.x writes some textures as `{ sprite, force_translucent }`.
      if (!(k in textures)) textures[k] = typeof v === "string" ? v : v.sprite;
    }
    if (!elements && model.elements) elements = model.elements;
    ref = model.parent;
  }
  return { textures, elements };
}

function resolveTexture(textures, ref) {
  let current = ref;
  for (let i = 0; i < 10 && current?.startsWith("#"); i++) {
    current = textures[current.slice(1)];
  }
  return current && !current.startsWith("#") ? stripNs(current) : null;
}

function isFullCube(element) {
  const [x0, y0, z0] = element.from;
  const [x1, y1, z1] = element.to;
  return (
    x0 === 0 && y0 === 0 && z0 === 0 && x1 === 16 && y1 === 16 && z1 === 16
  );
}

// sRGB -> CIELab (D65)
function toLab(r, g, b) {
  const lin = (c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const x = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
  const y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  const z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function textureStats(png, tint) {
  // Animated textures are vertical strips: only the first square frame counts.
  const size = png.width;
  const tintRgb = tint ? hexToRgb(tint) : null;
  let n = 0;
  let opaque = 0;
  let sum = [0, 0, 0];
  let rgbSum = [0, 0, 0];
  const lightness = [];
  for (let y = 0; y < Math.min(size, png.height); y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * png.width + x) * 4;
      let r = png.data[i];
      let g = png.data[i + 1];
      let b = png.data[i + 2];
      const a = png.data[i + 3];
      n++;
      if (a < 128) continue;
      opaque++;
      if (tintRgb) {
        r = (r * tintRgb[0]) / 255;
        g = (g * tintRgb[1]) / 255;
        b = (b * tintRgb[2]) / 255;
      }
      const lab = toLab(r, g, b);
      sum = sum.map((s, k) => s + lab[k]);
      rgbSum = [rgbSum[0] + r, rgbSum[1] + g, rgbSum[2] + b];
      lightness.push(lab[0]);
    }
  }
  if (!opaque) return null;
  const lab = sum.map((s) => s / opaque);
  const mean = lightness.reduce((a, b) => a + b, 0) / opaque;
  const variance = lightness.reduce((a, l) => a + (l - mean) ** 2, 0) / opaque;
  const avg = rgbSum.map((s) => Math.round(s / opaque));
  const round = (v) => Math.round(v * 10) / 10;
  return {
    color: `#${avg.map((c) => c.toString(16).padStart(2, "0")).join("")}`,
    lab: lab.map(round),
    contrast: round(Math.sqrt(variance)),
    opacity: Math.round((opaque / n) * 100) / 100,
    animated: png.height > png.width,
  };
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await fn(items[i], i);
      }
    }),
  );
  return results;
}

// Waxed, infested and suspicious blocks look exactly like their plain twin.
const DUPLICATE_PREFIXES = ["waxed_", "infested_", "suspicious_"];

async function describeBlock(id) {
  if (EXCLUDED.has(id)) return null;
  if (DUPLICATE_PREFIXES.some((p) => id.startsWith(p))) return null;
  const blockstate = await fetchJson(`blockstates/${id}.json`);
  const modelRef = pickVariantModel(blockstate);
  if (!modelRef) return null;
  const model = await resolveModel(modelRef);
  const cube = model?.elements?.[0];
  if (!cube || !isFullCube(cube)) return null;
  // Extra elements are only allowed when they are overlays on the same cube.
  if (!model.elements.every(isFullCube)) return null;

  const faces = {};
  for (const [face, name] of [
    ["up", "top"],
    ["north", "side"],
    ["down", "bottom"],
  ]) {
    const def = cube.faces?.[face];
    const texture = def && resolveTexture(model.textures, def.texture);
    if (!texture) return null;
    const tinted = def.tintindex !== undefined;
    const tint = tinted
      ? (TINTS[id] ??
        (id.endsWith("leaves") ? TINTS.default_foliage : TINTS.grass_block))
      : undefined;
    faces[name] = { texture, ...(tint ? { tint } : {}) };
  }
  return { id, faces };
}

async function main() {
  const registries = new Map();
  await mapLimit(releases, 8, async (r) => {
    registries.set(r.id, await fetchRegistry(r.id));
  });
  const ids = [...registries.get(MC_VERSION)];
  console.log(`Inspecting ${ids.length} blockstates for ${MC_VERSION}…`);

  const described = (await mapLimit(ids, 24, describeBlock)).filter(Boolean);
  console.log(`${described.length} full-cube blocks`);

  const textureKeys = new Map();
  for (const block of described) {
    for (const face of Object.values(block.faces)) {
      textureKeys.set(`${face.texture}|${face.tint ?? ""}`, face);
    }
  }
  const pngs = new Map();
  const uniqueTextures = [
    ...new Set(
      described.flatMap((b) => Object.values(b.faces).map((f) => f.texture)),
    ),
  ];
  await mapLimit(uniqueTextures, 24, async (texture) => {
    pngs.set(texture, await fetchPng(texture));
  });

  const blocks = [];
  for (const block of described) {
    const out = { id: block.id, since: "", faces: {} };
    let ok = true;
    for (const [name, face] of Object.entries(block.faces)) {
      const png = pngs.get(face.texture);
      const stats = png && textureStats(png, face.tint);
      if (!stats) {
        ok = false;
        break;
      }
      out.faces[name] = { ...face, ...stats };
    }
    if (ok) blocks.push(out);
  }
  blocks.sort((a, b) => a.id.localeCompare(b.id));
  const since = firstReleases(
    blocks.map((b) => b.id),
    releases,
    registries,
  );
  for (const block of blocks) block.since = since.get(block.id);

  await writeFile(
    OUT,
    JSON.stringify(
      { version: MC_VERSION, versions: [...releases].reverse(), blocks },
      null,
      0,
    ) + "\n",
  );
  console.log(`Wrote ${blocks.length} blocks to ${OUT}`);
}

await main();
