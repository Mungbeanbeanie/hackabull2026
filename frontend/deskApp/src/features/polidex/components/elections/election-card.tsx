"use client";

import { useEffect, useState } from "react";
import { Election } from "@/features/polidex/types";
import { BackendPolitician, fetchCandidatesForElection } from "@/features/polidex/lib/api";
import { politicians } from "@/features/polidex/data/politicians";
import { ImageWithFallback } from "@/features/polidex/components/figma/image-with-fallback";
import { resolveProfileSide } from "@/features/polidex/components/compare/utils";

const FONT_SANS = "Inter, system-ui, sans-serif";
const FONT_MONO = "ui-monospace, 'Fira Mono', monospace";

const PARTY_COLOR: Record<string, string> = {
  R: "#C0392B",
  D: "#2563EB",
  I: "#6B7280",
};

const PARTY_BG: Record<string, string> = {
  R: "#FEF2F2",
  D: "#EFF6FF",
  I: "#F9FAFB",
};

export function ElectionCard({ election, onSelect }: Readonly<{ election: Election; onSelect: (id: string, side: "left" | "right") => void }>) {
  const [candidates, setCandidates] = useState<BackendPolitician[]>([]);

  useEffect(() => {
    fetchCandidatesForElection(election.candidateIds).then((result) => {
      if (result.length > 0) {
        setCandidates(result);
        return;
      }
      const local = election.candidateIds
        .map((id) => {
          const p = politicians.find((pol) => pol.id === id);
          if (!p) return null;
          return {
            id: p.id,
            name: p.name,
            party: p.party,
            state: p.state,
            office: p.role,
            vector: p.vector_stated,
            imageUrl: p.photo,
          } as BackendPolitician;
        })
        .filter((p): p is BackendPolitician => p !== null);
      setCandidates(local);
    });
  }, [election.candidateIds]);

  return (
    <div
      style={{
        borderRadius: 14,
        border: "1px solid #E2E5E9",
        background: "#FFFFFF",
        marginBottom: 12,
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(13,15,18,0.04)",
      }}
    >
      {/* Header */}
      <div style={{ padding: "14px 16px 12px" }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 600, color: "#0D0F12", letterSpacing: "-0.01em" }}>
          {election.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#8A919E", letterSpacing: "0.03em" }}>
            {election.location}
          </span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#D1D5DB", flexShrink: 0 }} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#4B5260", fontWeight: 500, letterSpacing: "0.03em" }}>
            {election.electionDay}
          </span>
        </div>
      </div>

      {/* Key dates */}
      <div style={{ borderTop: "1px solid #F3F4F6", borderBottom: "1px solid #F3F4F6", padding: "10px 16px", background: "#FAFAFA" }}>
        <div style={{ display: "flex", gap: 16, overflowX: "auto" }}>
          {election.importantDates.map((d) => (
            <div key={d.label} style={{ flexShrink: 0 }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#8A919E", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {d.label}
              </div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: "#0D0F12", fontWeight: 500, marginTop: 2 }}>
                {d.date}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Candidates */}
      {candidates.length > 0 && (
        <div style={{ padding: "12px 16px" }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#8A919E", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
            Candidates
          </div>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 2 }}>
            {candidates.map((candidate) => (
              <button
                key={candidate.id}
                onClick={(event) => onSelect(candidate.id, resolveProfileSide(event.clientX))}
                style={{
                  flexShrink: 0,
                  width: 100,
                  borderRadius: 12,
                  border: `1px solid ${PARTY_COLOR[candidate.party] ?? "#E2E5E9"}22`,
                  background: PARTY_BG[candidate.party] ?? "#F9FAFB",
                  padding: "10px 8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  transition: "box-shadow 150ms, transform 150ms",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 12px ${PARTY_COLOR[candidate.party] ?? "#000"}22`;
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    overflow: "hidden",
                    position: "relative",
                    border: `2px solid ${PARTY_COLOR[candidate.party] ?? "#E2E5E9"}44`,
                    background: "#F1F3F5",
                    flexShrink: 0,
                  }}
                >
                  <ImageWithFallback
                    src={candidate.imageUrl ?? ""}
                    alt={candidate.name}
                    loading="lazy"
                    className="h-full w-full"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div style={{ textAlign: "center", width: "100%" }}>
                  <div
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 11,
                      fontWeight: 500,
                      color: "#0D0F12",
                      lineHeight: 1.3,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {candidate.name}
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      marginTop: 4,
                      fontFamily: FONT_MONO,
                      fontSize: 9,
                      fontWeight: 700,
                      color: PARTY_COLOR[candidate.party] ?? "#6B7280",
                      letterSpacing: "0.06em",
                      background: `${PARTY_COLOR[candidate.party] ?? "#6B7280"}15`,
                      borderRadius: 4,
                      padding: "2px 5px",
                    }}
                  >
                    {toPartyShortLabel(candidate.party)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function toPartyShortLabel(party: string) {
  if (party === "R") return "REP";
  if (party === "D") return "DEM";
  return "IND";
}
