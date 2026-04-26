"use client";

import { motion } from "motion/react";

import { Politician } from "@/features/polidex/data/politicians";
import { districtLabel, partyLabel } from "@/features/polidex/lib/display";
import { FONT_SANS } from "@/features/polidex/lib/style";

import { ImageWithFallback } from "../figma/image-with-fallback";

export function MatchRow({ politician, sim }: { politician: Politician; sim: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.25 }}
      style={{
        background: "white",
        border: "1px solid #E2E5E9",
        borderRadius: 12,
        padding: 12,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", background: "#F1F3F5", flexShrink: 0 }}>
        <ImageWithFallback
          src={politician.photo}
          alt={politician.name}
          className="h-full w-full"
          style={{ objectFit: "cover", filter: "grayscale(0.15)" }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: 13,
            fontWeight: 500,
            color: "#0D0F12",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {politician.name}
        </div>
        <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#8A919E", marginTop: 2 }}>
          {partyLabel(politician.party)} - {districtLabel(politician.district)}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 16, fontWeight: 500, color: "#0D0F12" }}>{Math.round(sim * 100)}%</div>
      </div>
    </motion.div>
  );
}
