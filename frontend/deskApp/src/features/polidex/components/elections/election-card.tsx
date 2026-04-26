"use client";

import { useEffect, useState } from "react";
import { Election } from "@/features/polidex/types";
import { BackendPolitician, fetchCandidatesForElection } from "@/features/polidex/lib/api";
import { politicians } from "@/features/polidex/data/politicians";
import { ImageWithFallback } from "@/features/polidex/components/figma/image-with-fallback";

const FONT_SANS = "Inter, system-ui, sans-serif";
const FONT_MONO = "ui-monospace, 'Fira Mono', monospace";

const PARTY_COLOR: Record<string, string> = {
  R: "#C0392B",
  D: "#2563EB",
  I: "#6B7280",
};

export function ElectionCard({ election, onSelect }: { election: Election; onSelect: (id: string) => void }) {
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
          return { id: p.id, name: p.name, party: p.party, state: "FL", office: p.role, vector: p.vector_stated, imageUrl: p.photo } as BackendPolitician;
        })
        .filter((p): p is BackendPolitician => p !== null);
      setCandidates(local);
    });
  }, [election.candidateIds]);

  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid #E2E5E9",
        background: "#FFFFFF",
        padding: 16,
        marginBottom: 12,
      }}
    >
      <div style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 500, color: "#0D0F12" }}>
        {election.title}
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#8A919E", marginTop: 3, letterSpacing: "0.04em" }}>
        {election.location} &middot; {election.electionDay}
      </div>

      <ul style={{ marginTop: 10, listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        {election.importantDates.map((d) => (
          <li
            key={d.label}
            style={{
              fontFamily: FONT_MONO,
              fontSize: 10,
              color: "#4B5260",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{d.label}</span>
            <span style={{ color: "#8A919E" }}>{d.date}</span>
          </li>
        ))}
      </ul>

      {candidates.length > 0 && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginTop: 12, paddingBottom: 4 }}>
          {candidates.map((candidate) => (
            <button
              key={candidate.id}
              onClick={() => onSelect(candidate.id)}
              style={{
                borderRadius: 10,
                border: "1px solid #E2E5E9",
                padding: "8px 6px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                minWidth: 72,
                background: "#F8F9FA",
                cursor: "pointer",
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", flexShrink: 0, position: "relative" }}>
                <ImageWithFallback
                  src={candidate.imageUrl ?? ""}
                  alt={candidate.name}
                  loading="lazy"
                  className="h-full w-full"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 10,
                  color: "#0D0F12",
                  textAlign: "center",
                  width: 60,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {candidate.name.split(" ").pop()}
              </div>
              <div
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: 9,
                  color: PARTY_COLOR[candidate.party] ?? "#6B7280",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                }}
              >
                {candidate.party}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
