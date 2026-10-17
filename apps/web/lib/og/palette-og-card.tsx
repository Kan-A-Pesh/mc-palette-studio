import { getBlock, type Palette, type WeightedBlock } from "@repo/palette-core";
import { SITE } from "@/lib/site";
import { PALETTE_OG } from "./palette-og-constants";

interface PaletteOgCardProps {
  palette: Palette;
  label: string;
  /** Blocks listed on the left, already cut to what fits. */
  rows: WeightedBlock[];
  /** Blocks left out of the list. */
  hidden: number;
  wall: string;
  swatches: Map<string, string>;
}

/** 1200×630 share card of one palette (inline styles only: Satori). */
export default function PaletteOgCard({
  palette,
  label,
  rows,
  hidden,
  wall,
  swatches,
}: PaletteOgCardProps) {
  const { COLORS } = SITE;
  const { PADDING, WALL, SWATCH } = PALETTE_OG;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: PADDING,
        background: COLORS.CANVAS,
        color: COLORS.TEXT,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", width: 860 }}>
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: -1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {palette.name}
          </div>
          <div style={{ marginTop: 6, fontSize: 24, color: COLORS.MUTED }}>
            {label}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", flexWrap: "wrap", width: 30, gap: 2 }}>
            <div style={{ width: 14, height: 14, background: "#c36953" }} />
            <div style={{ width: 14, height: 14, background: COLORS.ACCENT }} />
            <div style={{ width: 14, height: 14, background: "#905845" }} />
            <div style={{ width: 14, height: 14, background: "#d28a69" }} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{SITE.NAME}</div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "auto",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {rows.map((entry) => (
            <div
              key={entry.blockId}
              style={{ display: "flex", alignItems: "center", gap: 16 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
              <img
                src={swatches.get(entry.blockId)}
                width={SWATCH}
                height={SWATCH}
                alt=""
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 22, fontWeight: 600 }}>
                  {getBlock(entry.blockId)?.name ?? entry.blockId}
                </div>
                <div style={{ fontSize: 18, color: COLORS.MUTED }}>
                  {`${entry.weight}%`}
                </div>
              </div>
            </div>
          ))}
          {hidden > 0 && (
            <div style={{ fontSize: 20, color: COLORS.MUTED }}>
              {`+${hidden} more ${hidden === 1 ? "block" : "blocks"}`}
            </div>
          )}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered by Satori, not the browser */}
        <img
          src={wall}
          width={WALL.columns * WALL.cell}
          height={WALL.rows * WALL.cell}
          alt=""
        />
      </div>
    </div>
  );
}
