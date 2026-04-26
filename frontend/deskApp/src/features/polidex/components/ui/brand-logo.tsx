"use client";

import { CSSProperties } from "react";

import { FONT_SANS } from "@/features/polidex/lib/style";

type BrandLogoProps = {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
};

const SIZE_MAP: Record<NonNullable<BrandLogoProps["size"]>, { text: string; tagline: string; spacing: number }> = {
  sm: { text: "26px", tagline: "9px", spacing: 0.4 },
  md: { text: "44px", tagline: "11px", spacing: 0.5 },
  lg: { text: "84px", tagline: "12px", spacing: 0.6 },
};

const poliStyle: CSSProperties = {
  background: "linear-gradient(170deg, #6AA8DE 0%, #2B6AA4 45%, #1D4D82 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

const dexStyle: CSSProperties = {
  background: "linear-gradient(170deg, #FF5A6D 0%, #F61536 50%, #D6092A 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

export function BrandLogo({ size = "md", showTagline = false, className }: BrandLogoProps) {
  const currentSize = SIZE_MAP[size];

  return (
    <div className={className} style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1 }}>
      <div
        aria-label="PoliDex"
        style={{
          fontFamily: FONT_SANS,
          fontSize: currentSize.text,
          fontWeight: 800,
          letterSpacing: `-${currentSize.spacing}px`,
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        <span style={poliStyle}>Poli</span>
        <span style={dexStyle}>Dex</span>
      </div>
      {showTagline && (
        <div
          style={{
            marginTop: 6,
            fontFamily: FONT_SANS,
            fontSize: currentSize.tagline,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#667188",
          }}
        >
          Civic intelligence engine
        </div>
      )}
    </div>
  );
}
