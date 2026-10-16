import { getBlock } from "@repo/palette-core";
import { SITE } from "@/lib/site";

interface OgCardProps {
  /** Rows of block ids drawn as colour swatches on the right. */
  rows: string[][];
}

/** 1200×630 share card rendered by `next/og` (inline styles only: Satori). */
export default function OgCard({ rows }: OgCardProps) {
  const { COLORS } = SITE;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 80px",
        background: COLORS.CANVAS,
        color: COLORS.TEXT,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: 560 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", flexWrap: "wrap", width: 52, gap: 4 }}>
            <div style={{ width: 24, height: 24, background: "#c36953" }} />
            <div style={{ width: 24, height: 24, background: COLORS.ACCENT }} />
            <div style={{ width: 24, height: 24, background: "#905845" }} />
            <div style={{ width: 24, height: 24, background: "#d28a69" }} />
          </div>
          <div style={{ fontSize: 34, fontWeight: 700 }}>{SITE.NAME}</div>
        </div>
        <div
          style={{
            marginTop: 56,
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: -1.5,
          }}
        >
          Minecraft block palette generator
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 28,
            fontSize: 30,
            lineHeight: 1.35,
            color: COLORS.MUTED,
          }}
        >
          <div>Pick a block. Get the palette.</div>
          <div>Export to WorldEdit.</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((row) => (
          <div key={row.join()} style={{ display: "flex", gap: 10 }}>
            {row.map((id) => (
              <div
                key={id}
                style={{
                  width: 84,
                  height: 84,
                  background: getBlock(id)?.faces.side.color ?? COLORS.PANEL,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
