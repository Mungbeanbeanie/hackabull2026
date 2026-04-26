"use client";

import { useState } from "react";
import { upcomingElections } from "@/features/polidex/data/elections";
import { ElectionCard } from "./election-card";

const FONT_MONO = "ui-monospace, 'Fira Mono', monospace";
const FONT_SANS = "Inter, system-ui, sans-serif";

const STATE_OPTIONS = [
  { value: "ALL", label: "All States" },
  { value: "FL",  label: "Florida" },
  { value: "TX",  label: "Texas" },
  { value: "National", label: "National" },
];

export function ElectionsSidebar({ onSelect }: { onSelect: (id: string) => void }) {
  const [selectedState, setSelectedState] = useState("ALL");

  const filtered = upcomingElections.filter(
    (e) => selectedState === "ALL" || e.state === selectedState,
  );

  return (
    <aside
      className="hidden lg:flex"
      style={{
        width: 576,
        flexShrink: 0,
        height: "100%",
        background: "#F8F9FA",
        borderLeft: "1px solid #E2E5E9",
        overflowY: "auto",
        padding: 16,
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            color: "#8A919E",
            letterSpacing: "0.09em",
            textTransform: "uppercase",
          }}
        >
          Upcoming Elections
        </div>
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          style={{
            fontFamily: FONT_SANS,
            fontSize: 12,
            color: "#1C2431",
            background: "#FFFFFF",
            border: "1px solid #E2E5E9",
            borderRadius: 6,
            padding: "4px 8px",
            cursor: "pointer",
          }}
        >
          {STATE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ flex: 1 }}>
        {filtered.length === 0 ? (
          <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#8A919E", marginTop: 8 }}>
            No elections found for this state.
          </div>
        ) : (
          filtered.map((election) => (
            <ElectionCard key={election.id} election={election} onSelect={onSelect} />
          ))
        )}
      </div>

      <p
        style={{
          fontFamily: FONT_SANS,
          fontSize: 10,
          color: "#8A919E",
          fontStyle: "italic",
          marginTop: 16,
          lineHeight: 1.5,
        }}
      >
        Pro Demo Note: Election events are mocked for April 2026 demo purposes, but candidate cards
        are dynamically fetched from the live SearchController. Click any candidate to run vector
        analysis.
      </p>
    </aside>
  );
}
