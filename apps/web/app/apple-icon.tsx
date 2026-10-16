import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const tile = { width: 60, height: 60 };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexWrap: "wrap",
          alignContent: "center",
          justifyContent: "center",
          gap: 8,
          padding: "0 26px",
          background: SITE.COLORS.CANVAS,
        }}
      >
        <div style={{ ...tile, background: "#c36953" }} />
        <div style={{ ...tile, background: SITE.COLORS.ACCENT }} />
        <div style={{ ...tile, background: "#905845" }} />
        <div style={{ ...tile, background: "#d28a69" }} />
      </div>
    ),
    size,
  );
}
