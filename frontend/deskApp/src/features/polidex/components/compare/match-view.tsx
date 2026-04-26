"use client";

import { motion } from "motion/react";

import { RankedPolitician } from "@/features/polidex/lib/api";
import { districtLabel, partyLabel } from "@/features/polidex/lib/display";
import { FONT_SANS } from "@/features/polidex/lib/style";

import { ImageWithFallback } from "../figma/image-with-fallback";
import { MatchRow } from "./match-row";

export function MatchView({
  ranked,
  isRanking = false,
  backendOnline = null,
}: {
  ranked: RankedPolitician[];
  isRanking?: boolean;
  backendOnline?: boolean | null;
}) {
  if (ranked.length === 0) {
    const message = isRanking ? "Ranking politicians…" : "Complete the quiz to see your matches.";
    return (
      <div className="px-8 py-16 text-center" style={{ color: "#8A919E", fontSize: 14, fontFamily: FONT_SANS }}>
        {message}
      </div>
    );
  }

  const top = ranked[0];
  const rest = ranked.slice(1, 7);
  const worst = ranked[ranked.length - 1];

  return (
    <div className="space-y-6 px-5 py-6 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.3 }}
        style={{
          background: "white",
          border: "1px solid #E2E5E9",
          borderRadius: 14,
          padding: 22,
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ width: 96, height: 96, borderRadius: 14, overflow: "hidden", flexShrink: 0, background: "#F1F3F5" }}>
          <ImageWithFallback
            src={top.politician.photo}
            alt={top.politician.name}
            className="h-full w-full"
            style={{ objectFit: "cover", filter: "grayscale(0.15)" }}
          />
        </div>
        <div className="flex-1">
          <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#1565C0", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Your closest match
          </div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 24, fontWeight: 500, color: "#0D0F12", marginTop: 4 }}>
            {top.politician.name}
          </div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: "#4B5260", marginTop: 2 }}>
            {partyLabel(top.politician.party)} - {districtLabel(top.politician.district)} - {top.politician.role}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: FONT_SANS, fontSize: 36, fontWeight: 300, color: "#1565C0", lineHeight: 1 }}>
            {Math.round(top.sim * 100)}%
          </div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#8A919E", marginTop: 4 }}>
            alignment with your views
          </div>
        </div>
      </motion.div>

      <div>
        <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#8A919E", marginBottom: 10 }}>More close matches</div>
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
          {rest.map(({ politician, sim }) => (
            <MatchRow key={politician.id} politician={politician} sim={sim} />
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.3 }}
        style={{
          background: "white",
          border: "1px solid #E2E5E9",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div style={{ width: 48, height: 48, borderRadius: 10, overflow: "hidden", background: "#F1F3F5" }}>
          <ImageWithFallback
            src={worst.politician.photo}
            alt={worst.politician.name}
            className="h-full w-full"
            style={{ objectFit: "cover", filter: "grayscale(0.15)" }}
          />
        </div>
        <div className="flex-1">
          <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#991B1B", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Furthest from your views
          </div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 500, color: "#0D0F12" }}>{worst.politician.name}</div>
        </div>
        <div style={{ fontFamily: FONT_SANS, fontSize: 22, fontWeight: 300, color: "#991B1B" }}>{Math.round(worst.sim * 100)}%</div>
      </motion.div>
    </div>
  );
}
