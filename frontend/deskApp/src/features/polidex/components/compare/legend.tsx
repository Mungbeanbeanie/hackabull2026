"use client";

import { FONT_SANS } from "@/features/polidex/lib/style";

export function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div style={{ width: 8, height: 8, borderRadius: 999, background: swatch }} />
      <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#4B5260" }}>{label}</div>
    </div>
  );
}
